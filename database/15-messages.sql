CREATE TABLE api.messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES api.conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('influencer', 'company')),
    sender_id INT NOT NULL, 
    content TEXT,
    collaboration_id INT REFERENCES api.collaborations(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);
