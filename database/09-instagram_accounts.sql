CREATE TABLE api.instagram_accounts (
    id SERIAL PRIMARY KEY,                                -- Internal UUID for this Instagram account entry
    user_id INT REFERENCES api.users(id) ON DELETE CASCADE NOT NULL,                              -- FK to your app's users table

    instagram_id VARCHAR(50) NOT NULL,                  -- Instagram Business ID from the API
    facebook_id VARCHAR(255) UNIQUE NOT NULL,           -- Facebook ID from the API
    username VARCHAR(255) NOT NULL,                     -- IG @username (via API)
    name VARCHAR(255),                                  -- Display name (via API)
    profile_picture_url TEXT,                           -- Profile picture URL (via API)
    biography TEXT,                                     -- IG bio (via API)
    website VARCHAR(255),                               -- Website in bio (via API)

    followers_count INT DEFAULT 0,                      -- Followers count (via API)
    follows_count INT DEFAULT 0,                        -- Number of accounts followed (via API)
    media_count INT DEFAULT 0,                          -- Number of media posts (via API)

    -- Engagement metrics (must be calculated manually)
    average_engagement_rate FLOAT,                      -- Calculated: (avg_likes + avg_comments) / followers_count
    average_likes INT DEFAULT 0,                        -- Calculated from last X posts
    average_comments INT DEFAULT 0,                     -- Calculated from last X posts

    -- Instagram insights metrics (via /insights)
    reach INT DEFAULT 0,                                -- Reach (API: insights)
    impressions INT DEFAULT 0,                          -- Impressions (API: insights)
    profile_views INT DEFAULT 0,                        -- Profile views (API: insights)
    website_clicks INT DEFAULT 0,                       -- Website clicks from bio (API: insights)
    insights_last_updated TIMESTAMP,                    -- Date the insights were last updated

    facebook_token VARCHAR(1024),                     -- Facebook Token of the user (via API)
    page_access_token VARCHAR(1024),                   -- Instagram Token of the user (via API)

    user_token_last_refresh TIMESTAMP,
    page_token_last_refresh TIMESTAMP,
    needs_reconnect BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),                 -- Row creation timestamp
    updated_at TIMESTAMP DEFAULT NOW()                  -- Row update timestamp

);
