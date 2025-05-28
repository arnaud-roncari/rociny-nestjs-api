CREATE TABLE api.instagram_demographics (
  id SERIAL PRIMARY KEY,
  instagram_account_id VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'age', 'gender', 'city'
  label VARCHAR(100),
  value INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
