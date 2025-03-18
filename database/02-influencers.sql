CREATE TABLE api.influencers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(1024),
    picture_path VARCHAR(1024) NULL,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);