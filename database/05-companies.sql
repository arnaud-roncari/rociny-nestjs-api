CREATE TABLE api.companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES api.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);