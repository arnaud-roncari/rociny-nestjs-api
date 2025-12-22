CREATE TABLE api.collaborations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES api.companies(id) ON DELETE CASCADE,
    influencer_id INTEGER NOT NULL REFERENCES api.influencers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    files TEXT[] DEFAULT '{}',
    status TEXT NOT NULL,
    platform_quote TEXT,
    influencer_quote TEXT,
    platform_invoice TEXT,
    influencer_invoice TEXT,
    contract TEXT,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);
