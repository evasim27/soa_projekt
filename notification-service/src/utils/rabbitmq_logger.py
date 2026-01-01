import pika
import json
import os
from datetime import datetime
import uuid

class RabbitMQLogger:
    def __init__(self):
        self.rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
        self.rabbitmq_port = int(os.getenv('RABBITMQ_PORT', 5672))
        self.rabbitmq_user = os.getenv('RABBITMQ_USER', 'admin')
        self.rabbitmq_pass = os.getenv('RABBITMQ_PASS', 'admin')
        self.service_name = 'notification-service'
        self.connection = None
        self.channel = None

    def connect(self):
        try:
            credentials = pika.PlainCredentials(self.rabbitmq_user, self.rabbitmq_pass)
            parameters = pika.ConnectionParameters(
                host=self.rabbitmq_host,
                port=self.rabbitmq_port,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            self.channel.exchange_declare(
                exchange='logs_exchange',
                exchange_type='fanout',
                durable=True
            )
            return True
        except Exception as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            return False

    def close(self):
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
        except Exception as e:
            print(f"Error closing RabbitMQ connection: {e}")

    def send_log(self, log_type, url, correlation_id, message):
        try:
            if not self.channel or self.connection.is_closed:
                if not self.connect():
                    print("Cannot send log - RabbitMQ connection failed")
                    return False

            # Format timestamp: 2020-12-15 16:26:04,797
            now = datetime.now()
            timestamp = now.strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]
            
            # Format: <timestamp> <LogType> <URL> Correlation: <CorrelationId> [<serviceName>] - <Sporočilo>
            log_message = f"{timestamp} {log_type.upper()} {url} Correlation: {correlation_id} [{self.service_name}] - {message}"

            self.channel.basic_publish(
                exchange='logs_exchange',
                routing_key='',
                body=log_message,
                properties=pika.BasicProperties(
                    delivery_mode=2,
                )
            )
            return True
        except Exception as e:
            print(f"Failed to send log to RabbitMQ: {e}")
            self.connect()
            return False

    def log_info(self, url, correlation_id, message):
        self.send_log('INFO', url, correlation_id, message)

    def log_error(self, url, correlation_id, message):
        self.send_log('ERROR', url, correlation_id, message)

    def log_warn(self, url, correlation_id, message):
        self.send_log('WARN', url, correlation_id, message)


rabbitmq_logger = RabbitMQLogger()