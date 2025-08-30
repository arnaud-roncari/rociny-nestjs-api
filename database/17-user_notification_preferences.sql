CREATE TABLE api.user_notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES api.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, type)
);