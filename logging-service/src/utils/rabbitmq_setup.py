import pika
import os
import json
import time

def get_rabbitmq_connection():
    rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
    rabbitmq_port = int(os.getenv('RABBITMQ_PORT', 5672))
    rabbitmq_user = os.getenv('RABBITMQ_USER', 'admin')
    rabbitmq_pass = os.getenv('RABBITMQ_PASS', 'admin')
    
    max_retries = 5
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_pass)
            parameters = pika.ConnectionParameters(
                host=rabbitmq_host,
                port=rabbitmq_port,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )
            connection = pika.BlockingConnection(parameters)
            return connection
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Failed to connect to RabbitMQ (attempt {attempt + 1}/{max_retries}): {e}")
                time.sleep(retry_delay)
            else:
                raise

def setup_rabbitmq():
    connection = get_rabbitmq_connection()
    channel = connection.channel()
    
    channel.exchange_declare(
        exchange='logs_exchange',
        exchange_type='fanout',
        durable=True
    )
    
    channel.queue_declare(
        queue='logging_queue',
        durable=True
    )
    
    channel.queue_bind(
        exchange='logs_exchange',
        queue='logging_queue'
    )
    
    connection.close()
    return True

def consume_all_logs():
    connection = get_rabbitmq_connection()
    channel = connection.channel()
    
    channel.queue_declare(queue='logging_queue', durable=True)
    
    logs = []
    
    while True:
        method_frame, header_frame, body = channel.basic_get(queue='logging_queue', auto_ack=True)
        if method_frame is None:
            break
        
        try:
            log_data = json.loads(body.decode('utf-8'))
            logs.append(log_data)
        except Exception as e:
            print(f"Error parsing log message: {e}")
    
    connection.close()
    return logs