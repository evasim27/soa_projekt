CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_locations (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,

    -- Prevent duplicate locations for same merchant
    CONSTRAINT unique_location UNIQUE (merchant_id, address, city, postal_code)
);

CREATE TABLE IF NOT EXISTS merchant_hours (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES merchant_locations(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TEXT,
    close_time TEXT,
    
    CONSTRAINT unique_hours_per_day UNIQUE (location_id, day_of_week)
);

