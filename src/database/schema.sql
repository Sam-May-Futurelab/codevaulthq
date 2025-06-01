/**
 * Database Schema Design for Production Snippet Management
 * This file defines the database structure for scalable snippet data management
 */

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  github_username VARCHAR(50),
  twitter_username VARCHAR(50),
  is_verified BOOLEAN DEFAULT FALSE,
  is_pro BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- User preferences
  profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'followers')),
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  
  -- Metrics
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  snippets_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0
);

-- Create indexes for users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Snippets table
CREATE TABLE snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  html_code TEXT DEFAULT '',
  css_code TEXT DEFAULT '',
  javascript_code TEXT DEFAULT '',
  
  -- Metadata
  category VARCHAR(50) NOT NULL CHECK (category IN ('css', 'javascript', 'html', 'canvas', 'webgl', 'react', 'vue', 'animation')),
  tags TEXT[] DEFAULT '{}',
  
  -- URLs
  thumbnail_url TEXT,
  preview_url TEXT,
  
  -- Visibility and licensing
  is_public BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  license VARCHAR(20) DEFAULT 'MIT' CHECK (license IN ('MIT', 'Apache', 'GPL', 'Custom', 'Commercial')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Basic metrics (denormalized for performance)
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0
);

-- Create indexes for snippets
CREATE INDEX idx_snippets_author_id ON snippets(author_id);
CREATE INDEX idx_snippets_category ON snippets(category);
CREATE INDEX idx_snippets_tags ON snippets USING GIN(tags);
CREATE INDEX idx_snippets_created_at ON snippets(created_at);
CREATE INDEX idx_snippets_published_at ON snippets(published_at);
CREATE INDEX idx_snippets_is_public ON snippets(is_public);
CREATE INDEX idx_snippets_is_featured ON snippets(is_featured);
CREATE INDEX idx_snippets_views_count ON snippets(views_count);
CREATE INDEX idx_snippets_likes_count ON snippets(likes_count);

-- Full-text search index
CREATE INDEX idx_snippets_search ON snippets USING GIN(
  to_tsvector('english', title || ' ' || description || ' ' || array_to_string(tags, ' '))
);

-- Snippet Analytics table for detailed tracking
CREATE TABLE snippet_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  
  -- Core metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  bookmarks INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  
  -- Time-based metrics
  daily_views INTEGER DEFAULT 0,
  weekly_views INTEGER DEFAULT 0,
  monthly_views INTEGER DEFAULT 0,
  
  -- Quality metrics
  average_time_spent DECIMAL(10,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  interaction_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Calculated scores
  community_score DECIMAL(8,2) DEFAULT 0,
  trending_score DECIMAL(8,2) DEFAULT 0,
  virality_index DECIMAL(8,2) DEFAULT 0,
  ranking_score DECIMAL(8,2) DEFAULT 0,
  
  -- Rankings
  recency_factor DECIMAL(5,4) DEFAULT 1.0,
  engagement_factor DECIMAL(5,4) DEFAULT 0,
  quality_factor DECIMAL(5,4) DEFAULT 0.5,
  creativity_factor DECIMAL(5,4) DEFAULT 0.5,
  popularity_factor DECIMAL(5,4) DEFAULT 0,
  author_reputation_factor DECIMAL(5,4) DEFAULT 0.5,
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(snippet_id)
);

-- Create indexes for analytics
CREATE INDEX idx_snippet_analytics_snippet_id ON snippet_analytics(snippet_id);
CREATE INDEX idx_snippet_analytics_ranking_score ON snippet_analytics(ranking_score DESC);
CREATE INDEX idx_snippet_analytics_trending_score ON snippet_analytics(trending_score DESC);
CREATE INDEX idx_snippet_analytics_views ON snippet_analytics(views DESC);
CREATE INDEX idx_snippet_analytics_likes ON snippet_analytics(likes DESC);

-- Time-based analytics for detailed tracking
CREATE TABLE snippet_time_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  stat_hour INTEGER CHECK (stat_hour >= 0 AND stat_hour <= 23),
  
  -- Metrics for this time period
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(snippet_id, stat_date, stat_hour)
);

-- Create indexes for time stats
CREATE INDEX idx_snippet_time_stats_snippet_id ON snippet_time_stats(snippet_id);
CREATE INDEX idx_snippet_time_stats_date ON snippet_time_stats(stat_date);
CREATE INDEX idx_snippet_time_stats_hour ON snippet_time_stats(stat_hour);

-- User interactions tracking
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Allow anonymous interactions
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'like', 'download', 'share', 'bookmark', 'fork', 'comment')),
  
  -- Session and device info
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country_code VARCHAR(2),
  device_type VARCHAR(20),
  
  -- Timing
  time_spent INTEGER, -- seconds spent viewing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for interactions
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_snippet_id ON user_interactions(snippet_id);
CREATE INDEX idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_created_at ON user_interactions(created_at);
CREATE INDEX idx_user_interactions_country ON user_interactions(country_code);

-- User follows
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for follows
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

-- Snippet likes (for detailed tracking)
CREATE TABLE snippet_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, snippet_id)
);

-- Snippet bookmarks
CREATE TABLE snippet_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, snippet_id)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
  
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for comments
CREATE INDEX idx_comments_snippet_id ON comments(snippet_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- Collections
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  is_public BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection items
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(collection_id, snippet_id)
);

-- Create indexes for collections
CREATE INDEX idx_collections_author_id ON collections(author_id);
CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX idx_collection_items_snippet_id ON collection_items(snippet_id);

-- Reports (for moderation)
CREATE TABLE snippet_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'copyright', 'malicious', 'other')),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- API keys for external integrations
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  
  permissions TEXT[] DEFAULT '{}', -- Array of permission strings
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snippets_updated_at BEFORE UPDATE ON snippets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update snippet counts
CREATE OR REPLACE FUNCTION update_snippet_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update analytics metrics
        INSERT INTO snippet_analytics (snippet_id)
        VALUES (NEW.snippet_id)
        ON CONFLICT (snippet_id) DO UPDATE SET
            views = snippet_analytics.views + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
            likes = snippet_analytics.likes + CASE WHEN NEW.interaction_type = 'like' THEN 1 ELSE 0 END,
            downloads = snippet_analytics.downloads + CASE WHEN NEW.interaction_type = 'download' THEN 1 ELSE 0 END,
            shares = snippet_analytics.shares + CASE WHEN NEW.interaction_type = 'share' THEN 1 ELSE 0 END,
            bookmarks = snippet_analytics.bookmarks + CASE WHEN NEW.interaction_type = 'bookmark' THEN 1 ELSE 0 END,
            forks = snippet_analytics.forks + CASE WHEN NEW.interaction_type = 'fork' THEN 1 ELSE 0 END,
            last_updated = NOW();
            
        -- Update denormalized counts in snippets table
        UPDATE snippets SET
            views_count = views_count + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
            likes_count = likes_count + CASE WHEN NEW.interaction_type = 'like' THEN 1 ELSE 0 END,
            downloads_count = downloads_count + CASE WHEN NEW.interaction_type = 'download' THEN 1 ELSE 0 END
        WHERE id = NEW.snippet_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for updating counts
CREATE TRIGGER update_snippet_interaction_counts 
    AFTER INSERT ON user_interactions
    FOR EACH ROW EXECUTE FUNCTION update_snippet_counts();

-- Create materialized view for top snippets (refreshed periodically)
CREATE MATERIALIZED VIEW top_snippets_monthly AS
SELECT 
    s.id,
    s.title,
    s.description,
    s.category,
    s.tags,
    s.author_id,
    s.created_at,
    sa.ranking_score,
    sa.views,
    sa.likes,
    sa.downloads,
    ROW_NUMBER() OVER (ORDER BY sa.ranking_score DESC) as rank
FROM snippets s
JOIN snippet_analytics sa ON s.id = sa.snippet_id
WHERE s.is_public = true
  AND s.created_at >= DATE_TRUNC('month', NOW())
ORDER BY sa.ranking_score DESC
LIMIT 100;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_top_snippets_monthly_id ON top_snippets_monthly(id);
CREATE INDEX idx_top_snippets_monthly_rank ON top_snippets_monthly(rank);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_top_snippets()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY top_snippets_monthly;
END;
$$ language 'plpgsql';

-- Performance optimization views
CREATE VIEW snippet_stats_summary AS
SELECT 
    s.id,
    s.title,
    s.category,
    s.author_id,
    s.created_at,
    COALESCE(sa.views, 0) as views,
    COALESCE(sa.likes, 0) as likes,
    COALESCE(sa.downloads, 0) as downloads,
    COALESCE(sa.ranking_score, 0) as ranking_score,
    COALESCE(sa.trending_score, 0) as trending_score
FROM snippets s
LEFT JOIN snippet_analytics sa ON s.id = sa.snippet_id
WHERE s.is_public = true;

-- Example queries for common operations:

-- Get top 10 snippets by ranking score
/*
SELECT * FROM snippet_stats_summary
ORDER BY ranking_score DESC
LIMIT 10;
*/

-- Get trending snippets
/*
SELECT * FROM snippet_stats_summary
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY trending_score DESC, views DESC
LIMIT 10;
*/

-- Get snippets by category with pagination
/*
SELECT * FROM snippet_stats_summary
WHERE category = 'javascript'
ORDER BY ranking_score DESC
LIMIT 20 OFFSET 0;
*/

-- Search snippets with full-text search
/*
SELECT s.*, ts_rank(
    to_tsvector('english', s.title || ' ' || s.description || ' ' || array_to_string(s.tags, ' ')),
    plainto_tsquery('english', 'search term')
) as rank
FROM snippet_stats_summary s
WHERE to_tsvector('english', s.title || ' ' || s.description || ' ' || array_to_string(s.tags, ' '))
    @@ plainto_tsquery('english', 'search term')
ORDER BY rank DESC, ranking_score DESC;
*/
