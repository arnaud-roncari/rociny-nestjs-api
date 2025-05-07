CREATE TABLE api.oauth_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES api.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- google, apple
    provider_user_id TEXT NOT NULL -- id from google, apple
);