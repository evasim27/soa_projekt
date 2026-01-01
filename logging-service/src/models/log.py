class Log:
    def __init__(self, timestamp, log_type, url, correlation_id, service_name, message):
        self.timestamp = timestamp
        self.log_type = log_type
        self.url = url
        self.correlation_id = correlation_id
        self.service_name = service_name
        self.message = message

    def to_dict(self):
        return {
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'log_type': self.log_type,
            'url': self.url,
            'correlation_id': self.correlation_id,
            'service_name': self.service_name,
            'message': self.message
        }