CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    offer_id INTEGER,
    order_id INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    channel VARCHAR(50) DEFAULT 'in_app',
    created_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    read_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    new_offers_enabled BOOLEAN DEFAULT true,
    reservation_confirmations_enabled BOOLEAN DEFAULT true,
    expiration_reminders_enabled BOOLEAN DEFAULT true,
    pickup_reminders_enabled BOOLEAN DEFAULT true,
    preferred_channel VARCHAR(50) DEFAULT 'in_app',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);