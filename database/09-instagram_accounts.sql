CREATE TABLE api.instagram_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES api.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    instagram_id TEXT NOT NULL,
    username TEXT NOT NULL,
    
     -- 

    followers_count INTEGER, 
    profile_picture_url TEXT, 
    reach INTEGER, 
    views INTEGER, 
    profile_view_rate FLOAT,
    profile_views INTEGER,
    website_clicks INTEGER,
    link_clicks INTEGER, 
    engagement_rate FLOAT, 
    total_interactions INTEGER, 
    interaction_percentage_posts FLOAT, 
    interaction_percentage_reels FLOAT, 
    post_percentage FLOAT, 
    reel_percentage FLOAT, 
    gender_male_percentage FLOAT, 
    gender_female_percentage FLOAT, 
    top_cities TEXT[], 
    top_age_ranges TEXT[], 
    last_media_url TEXT ,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp

);