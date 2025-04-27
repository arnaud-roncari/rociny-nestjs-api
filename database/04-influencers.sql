CREATE TABLE api.influencers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES api.users(id) ON DELETE CASCADE,
    --
    profile_picture TEXT,
    portfolio TEXT[] DEFAULT '{}',
    name TEXT,
    department TEXT,
    description TEXT,
    themes TEXT[] DEFAULT '{}',
    target_audience TEXT[] DEFAULT '{}',
    --
    stripe_account_id TEXT NOT NULL,
    --

    created_at TIMESTAMPTZ DEFAULT current_timestamp
);