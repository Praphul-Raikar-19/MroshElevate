-- =========================================================================
-- MROSHELEVATE DATABASE SCHEMA (PostgreSQL / Supabase DDL)
-- Version: 1.0.0
-- Description: Creator-Investor Ecosystem for MROSHELEVATE
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM (
    'creator',
    'brand',
    'studio',
    'investor',
    'shg_collective',
    'admin'
);

CREATE TYPE availability_status AS ENUM (
    'available',
    'busy',
    'open_to_offers',
    'unavailable'
);

CREATE TYPE opportunity_type AS ENUM (
    'gig',
    'full_time',
    'contract',
    'brand_campaign',
    'contest',
    'mentorship_grant'
);

CREATE TYPE milestone_status AS ENUM (
    'pending',
    'in_progress',
    'submitted',
    'approved',
    'revision_requested'
);

CREATE TYPE collaboration_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'completed',
    'cancelled'
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'creator',
    avatar_url TEXT,
    banner_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_badge VARCHAR(50), -- 'verified_creator', 'verified_shg', 'verified_studio', 'verified_brand'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(200),
    bio TEXT,
    hourly_rate DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    primary_category VARCHAR(100), -- 'UI/UX Design', 'Filmmaking', 'Handloom & Craft', 'Sound Design'
    district VARCHAR(100),         -- 'Bangalore Urban', 'Mysore', 'Dharwad', 'Bidar', etc.
    state VARCHAR(100) DEFAULT 'Karnataka',
    country VARCHAR(100) DEFAULT 'India',
    availability availability_status DEFAULT 'available',
    experience_years INT DEFAULT 0,
    portfolio_website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb, -- e.g. {"instagram": "...", "behance": "...", "github": "..."}
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SKILLS TAXONOMY
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_regional_craft BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_skills (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'expert'
    PRIMARY KEY (user_id, skill_id)
);

-- 5. PORTFOLIO ITEMS
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    media_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio', 'document'
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    view_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. OPPORTUNITIES & BRIEFS
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poster_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    opportunity_type opportunity_type DEFAULT 'gig',
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    location VARCHAR(150),
    is_remote BOOLEAN DEFAULT TRUE,
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'closed'
    applicant_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pitch_text TEXT NOT NULL,
    proposed_rate DECIMAL(12, 2),
    portfolio_references TEXT[],
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'shortlisted', 'accepted', 'rejected'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PROJECTS & COLLABORATIONS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id),
    client_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    total_budget DECIMAL(12, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'completed', 'paused'
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PROJECT MILESTONES (Transparent Execution Tracker)
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2),
    status milestone_status DEFAULT 'pending',
    due_date DATE,
    proof_url TEXT,
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 10. COLLABORATION REQUESTS
CREATE TABLE IF NOT EXISTS collaboration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_title VARCHAR(200) NOT NULL,
    proposal_text TEXT NOT NULL,
    offered_compensation DECIMAL(12, 2),
    status collaboration_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. MESSAGES & COMMUNICATION
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    attachment_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_profiles_district ON user_profiles(district);
CREATE INDEX idx_profiles_category ON user_profiles(primary_category);
CREATE INDEX idx_profiles_availability ON user_profiles(availability);
CREATE INDEX idx_portfolio_user ON portfolio_items(user_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_messages_thread ON messages(sender_id, recipient_id);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Read policies: Public can read verified creators, profiles, portfolios and open opportunities
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Public portfolios are viewable by everyone" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Open opportunities are viewable by everyone" ON opportunities FOR SELECT USING (status = 'open');

-- User modification policies: Users can edit their own profiles & portfolios
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own portfolio items" ON portfolio_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio items" ON portfolio_items FOR UPDATE USING (auth.uid() = user_id);

