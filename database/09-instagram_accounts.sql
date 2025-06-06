CREATE TABLE api.instagram_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES api.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    instagram_id TEXT NOT NULL,
    username TEXT NOT NULL,
    followers_count INTEGER,
    profile_picture_url TEXT
);