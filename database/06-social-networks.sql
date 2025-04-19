CREATE TABLE social_networks (
    id SERIAL PRIMARY KEY,
    influencer_id INT REFERENCES api.influencers(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('twitch', 'youtube', 'instagram', 'tiktok')),
    followers INT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);