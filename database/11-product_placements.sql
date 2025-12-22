CREATE TABLE api.product_placements (
    id SERIAL PRIMARY KEY,
    collaboration_id INTEGER NOT NULL REFERENCES api.collaborations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);
