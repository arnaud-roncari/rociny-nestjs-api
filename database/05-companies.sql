CREATE TABLE api.companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES api.users(id) ON DELETE CASCADE,
    --
    profile_picture TEXT,
    name TEXT,
    department TEXT,
    description TEXT,
    --
    stripe_customer_id TEXT NOT NULL,
    --
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);