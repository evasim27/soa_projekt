CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    log_type VARCHAR(10) NOT NULL,
    url VARCHAR(500),
    correlation_id VARCHAR(100),
    service_name VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_correlation_id ON logs(correlation_id);
CREATE INDEX idx_logs_service_name ON logs(service_name);