CREATE TABLE api.collaborations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES api.companies(id) ON DELETE CASCADE,
    influencer_id INTEGER NOT NULL REFERENCES api.influencers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    files TEXT[] DEFAULT '{}',
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);
