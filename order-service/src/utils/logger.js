const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'rabbitmq';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_USER = process.env.RABBITMQ_USER || 'admin';
const RABBITMQ_PASS = process.env.RABBITMQ_PASS || 'admin';
const EXCHANGE_NAME = 'logs_exchange';

let channel = null;

async function initRabbitMQ() {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: RABBITMQ_HOST,
            port: RABBITMQ_PORT,
            username: RABBITMQ_USER,
            password: RABBITMQ_PASS
        });

        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });

        console.log('✅ Connected to RabbitMQ (order-service)');
    } catch (error) {
        console.error('❌ Failed to connect to RabbitMQ:', error.message);
        setTimeout(initRabbitMQ, 5000);
    }
}

function sendLog(logType, url, correlationId, message) {
    const logData = {
        timestamp: new Date().toISOString(),
        log_type: logType,
        url: url,
        correlation_id: correlationId,
        service_name: 'order-service',
        message: message
    };

    console.log('📤 Sending log (order-service):', logData);  // ← Debug log

    if (channel) {
        try {
            channel.publish(
                EXCHANGE_NAME,
                '',
                Buffer.from(JSON.stringify(logData)),
                { persistent: true }
            );
            console.log('✅ Log sent successfully');
        } catch (error) {
            console.error('❌ Failed to publish log:', error.message);
        }
    } else {
        console.error('❌ Channel not ready');
    }
}

function correlationHook(request, reply, done) {
    request.correlationId = request.headers['x-correlation-id'] || uuidv4();
    reply.header('x-correlation-id', request.correlationId);
    done();
}

function loggingHook(request, reply, done) {
    const start = Date.now();

    reply.raw.on('finish', () => {
        const duration = Date.now() - start;
        const url = `http://localhost:${process.env.PORT || 5006}${request.url}`;
        const logType = reply.statusCode >= 400 ? 'ERROR' : 'INFO';
        const message = `${request.method} ${request.url} - ${reply.statusCode} (${duration}ms)`;

        sendLog(logType, url, request.correlationId, message);
    });

    done();
}

module.exports = {
    initRabbitMQ,
    sendLog,
    correlationHook,
    loggingHook
};