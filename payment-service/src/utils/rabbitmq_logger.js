const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

class RabbitMQLogger {
    constructor() {
        this.rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
        this.rabbitmqPort = process.env.RABBITMQ_PORT || 5672;
        this.rabbitmqUser = process.env.RABBITMQ_USER || 'admin';
        this.rabbitmqPass = process.env.RABBITMQ_PASS || 'admin';
        this.serviceName = 'payment-service';
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            const url = `amqp://${this.rabbitmqUser}:${this.rabbitmqPass}@${this.rabbitmqHost}:${this.rabbitmqPort}`;
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            
            await this.channel.assertExchange('logs_exchange', 'fanout', { durable: true });
            
            return true;
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error.message);
            return false;
        }
    }

    async close() {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error.message);
        }
    }

    async sendLog(logType, url, correlationId, message) {
        try {
            if (!this.channel) {
                await this.connect();
            }

            // Format timestamp: 2020-12-15 16:26:04,797
            const now = new Date();
            const timestamp = now.toISOString().replace('T', ' ').replace('Z', '').substring(0, 23).replace('.', ',');
            
            // Format: <timestamp> <LogType> <URL> Correlation: <CorrelationId> [<serviceName>] - <Sporočilo>
            const logMessage = `${timestamp} ${logType.toUpperCase()} ${url} Correlation: ${correlationId} [${this.serviceName}] - ${message}`;

            this.channel.publish(
                'logs_exchange',
                '',
                Buffer.from(logMessage),
                { persistent: true }
            );

            return true;
        } catch (error) {
            console.error('Failed to send log to RabbitMQ:', error.message);
            await this.connect();
            return false;
        }
    }

    async logInfo(url, correlationId, message) {
        await this.sendLog('INFO', url, correlationId, message);
    }

    async logError(url, correlationId, message) {
        await this.sendLog('ERROR', url, correlationId, message);
    }

    async logWarn(url, correlationId, message) {
        await this.sendLog('WARN', url, correlationId, message);
    }
}

const rabbitmqLogger = new RabbitMQLogger();

module.exports = rabbitmqLogger;