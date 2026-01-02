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

        console.log('✅ Connected to RabbitMQ');
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
        service_name: 'offer-service',
        message: message
    };

    console.log('📤 Sending log (offer-service):', logData);

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

function correlationMiddleware(req, res, next) {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    res.setHeader('x-correlation-id', req.correlationId);
    next();
}

function loggingMiddleware(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const url = `http://localhost:${process.env.PORT || 5005}${req.originalUrl}`;
        const logType = res.statusCode >= 400 ? 'ERROR' : 'INFO';
        const message = `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`;

        sendLog(logType, url, req.correlationId, message);
    });

    next();
}

module.exports = {
    initRabbitMQ,
    sendLog,
    correlationMiddleware,
    loggingMiddleware
};