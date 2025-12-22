CREATE TABLE api.social_networks (
    id SERIAL PRIMARY KEY,
    influencer_id INT REFERENCES api.influencers(id) ON DELETE CASCADE,
    company_id INT REFERENCES api.companies(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('twitch', 'youtube', 'x', 'tiktok', 'linkedin', 'instagram')),
    followers INT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);


