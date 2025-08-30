CREATE TABLE api.user_devices (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES api.users(id) ON DELETE CASCADE,
  onesignal_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
