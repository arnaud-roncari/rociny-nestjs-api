CREATE TABLE api.conversations (
    id SERIAL PRIMARY KEY,
    influencer_id INT NOT NULL REFERENCES api.influencers(id) ON DELETE CASCADE,
    company_id INT NOT NULL REFERENCES api.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
