CREATE TABLE api.instagram_media (
  id SERIAL PRIMARY KEY,
  instagram_account_id VARCHAR(50) NOT NULL,
  media_id VARCHAR(100) UNIQUE NOT NULL,
  media_type VARCHAR(50),
  timestamp TIMESTAMP,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  ig_reels_avg_watch_time FLOAT,
  ig_reels_video_view_total_time FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
