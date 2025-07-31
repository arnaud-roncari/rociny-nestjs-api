CREATE TABLE api.reviews (
    id SERIAL PRIMARY KEY,
    collaboration_id INTEGER NOT NULL REFERENCES api.collaborations(id),
    author_id INTEGER NOT NULL,
    reviewed_id INTEGER NOT NULL,
    stars INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);
