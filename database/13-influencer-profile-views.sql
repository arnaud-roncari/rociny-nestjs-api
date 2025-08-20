CREATE TABLE api.influencer_profile_views (
    id SERIAL PRIMARY KEY,
    influencer_id INT NOT NULL REFERENCES api.influencers(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT current_timestamp
);
