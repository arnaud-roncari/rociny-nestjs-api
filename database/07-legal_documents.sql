CREATE TABLE api.legal_documents (
    id SERIAL PRIMARY KEY,
    influencer_id INT REFERENCES api.influencers(id) ON DELETE CASCADE,
    company_id INT REFERENCES api.companies(id) ON DELETE CASCADE,
    document TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'validated', 'refused')),
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);


