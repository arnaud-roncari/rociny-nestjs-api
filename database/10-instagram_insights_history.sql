CREATE TABLE api.instagram_insights_history (
  id SERIAL PRIMARY KEY,
  instagram_account_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  reach INTEGER,
  impressions INTEGER,
  profile_views INTEGER,
  website_clicks INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  total_interactions INTEGER,
  views INTEGER,
  followers_gained INTEGER,
  followers_lost INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);