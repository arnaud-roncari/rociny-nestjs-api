CREATE TABLE api.crashes (
    id SERIAL PRIMARY KEY,
    exception TEXT NOT NULL,
    stack TEXT,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);
