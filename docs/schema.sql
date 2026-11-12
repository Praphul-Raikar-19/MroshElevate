-- =========================================================================
-- MROSHELEVATE PRODUCTION DATABASE SCHEMA (PostgreSQL / Supabase DDL)
-- Version: 2.0.0 (Sprint 2 - Production Backend Integration)
-- Description: Creator-Investor Ecosystem for MROSHELEVATE & Karnataka Pilot
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'creator',
        'brand',
        'studio',
        'investor',
        'shg_collective',
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability_status AS ENUM (
        'available',
        'busy',
        'open_to_offers',
        'unavailable'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_type AS ENUM (
        'gig',
        'full_time',
        'contract',
        'brand_campaign',
        'contest',
        'mentorship_grant'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE milestone_status AS ENUM (
        'pending',
        'in_progress',
        'submitted',
        'approved',
        'revision_requested'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE collaboration_status AS ENUM (
        'pending',
        'accepted',
        'declined',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PUBLIC PROFILES TABLE (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'creator',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    banner_url TEXT,
    headline VARCHAR(200),
    bio TEXT,
    hourly_rate VARCHAR(50) DEFAULT '₹2,000/hr',
    currency VARCHAR(10) DEFAULT 'INR',
    primary_category VARCHAR(100) DEFAULT 'Digital & UI/UX',
    district VARCHAR(100) DEFAULT 'Bangalore Urban',
    state VARCHAR(100) DEFAULT 'Karnataka',
    country VARCHAR(100) DEFAULT 'India',
    availability availability_status DEFAULT 'available',
    experience_years INT DEFAULT 2,
    portfolio_website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_badge VARCHAR(50) DEFAULT 'verified_creator',
    rating DECIMAL(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SKILLS TAXONOMY
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_regional_craft BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.user_skills (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) DEFAULT 'intermediate',
    PRIMARY KEY (user_id, skill_id)
);

-- 4. PORTFOLIO ITEMS
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    media_type VARCHAR(50) NOT NULL DEFAULT 'image', -- 'image', 'video', 'audio', 'document'
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    view_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATOR FEED POSTS
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(50), -- 'image', 'video', 'audio'
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. POST LIKES (Unique constraint prevents duplicate likes)
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- 7. POST COMMENTS
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SAVED POSTS / BOOKMARKS
CREATE TABLE IF NOT EXISTS public.saved_posts (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- 9. CONNECTIONS (Follow / Network Graph)
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'accepted', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- 10. UPCOMING EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    day VARCHAR(10) NOT NULL,
    month VARCHAR(10) NOT NULL,
    meta TEXT NOT NULL,
    event_type VARCHAR(50) DEFAULT 'virtual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. OPPORTUNITIES & BRIEFS
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poster_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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
    deadline VARCHAR(50),
    status VARCHAR(50) DEFAULT 'open',
    applicant_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    pitch_text TEXT NOT NULL,
    proposed_rate VARCHAR(50),
    estimated_delivery VARCHAR(50),
    portfolio_references TEXT[],
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. PROJECTS & COLLABORATIONS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES public.profiles(id),
    client_id UUID REFERENCES public.profiles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    total_budget VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. PROJECT MILESTONES (SafeGuard Model)
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount VARCHAR(50),
    status milestone_status DEFAULT 'pending',
    due_date DATE,
    proof_url TEXT,
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 15. COLLABORATION REQUESTS
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_title VARCHAR(200) NOT NULL,
    proposal_text TEXT NOT NULL,
    offered_budget VARCHAR(50),
    status collaboration_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- DATABASE TRIGGERS: AUTOMATED USER PROFILE PROVISIONING
-- =========================================================================

-- Automatically create profile entry when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        district,
        avatar_url,
        is_verified,
        verification_badge
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'creator'::public.user_role),
        COALESCE(new.raw_user_meta_data->>'district', 'Bangalore Urban'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'),
        TRUE,
        CASE 
            WHEN new.raw_user_meta_data->>'role' = 'shg_collective' THEN 'verified_shg'
            WHEN new.raw_user_meta_data->>'role' = 'studio' THEN 'verified_studio'
            ELSE 'verified_creator'
        END
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attachment
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to increment/decrement post likes count
CREATE OR REPLACE FUNCTION public.handle_post_like_counter()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_like_changed ON public.post_likes;
CREATE TRIGGER on_post_like_changed
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_counter();

-- Trigger to increment/decrement post comments count
CREATE OR REPLACE FUNCTION public.handle_post_comment_counter()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_comment_changed ON public.post_comments;
CREATE TRIGGER on_post_comment_changed
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment_counter();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Posts
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- 3. Likes
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can toggle their own likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- 4. Comments
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete their comments" ON public.post_comments FOR DELETE USING (auth.uid() = author_id);

-- 5. Saved Posts
CREATE POLICY "Users can view their own saved posts" ON public.saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save posts" ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove saved posts" ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);

-- 6. Connections
CREATE POLICY "Connections are viewable by everyone" ON public.connections FOR SELECT USING (true);
CREATE POLICY "Users can send connection requests" ON public.connections FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can disconnect" ON public.connections FOR DELETE USING (auth.uid() = sender_id);

-- 7. Events
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);

-- 8. Opportunities & Applications
CREATE POLICY "Opportunities are viewable by everyone" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Brands and studios can post opportunities" ON public.opportunities FOR INSERT WITH CHECK (auth.uid() = poster_id);
CREATE POLICY "Applicants and posters can view applications" ON public.applications FOR SELECT USING (auth.uid() = applicant_id OR EXISTS (SELECT 1 FROM public.opportunities WHERE id = opportunity_id AND poster_id = auth.uid()));
CREATE POLICY "Creators can submit applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- =========================================================================
-- STORAGE BUCKETS (Run in Supabase Storage or SQL Editor)
-- =========================================================================

INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('covers', 'covers', true),
('portfolios', 'portfolios', true),
('post-media', 'post-media', true),
('deliverables', 'deliverables', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Public can view avatar images" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view post media" ON storage.objects FOR SELECT USING (bucket_id = 'post-media');
CREATE POLICY "Users can upload post media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =========================================================================
-- SEED DATA: KARNATAKA PILOT EVENTS & TAXONOMY
-- =========================================================================

INSERT INTO public.events (title, day, month, meta, event_type) VALUES
('Creative Mixer', '25', 'AUG', '7:00 PM • Virtual Community Room', 'virtual'),
('Film & Foley Workshop', '02', 'SEP', '2:00 PM • Studio B, Acoustic Bay Bangalore', 'in_person'),
('Channapatna Craft & UI Meet', '15', 'SEP', '10:00 AM • Bangalore Design Hub', 'in_person')
ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, is_regional_craft) VALUES
('UI/UX Design', 'Digital', false),
('Blender 3D', 'Digital', false),
('Figma Prototyping', 'Digital', false),
('Channapatna Lacquerware', 'Craft', true),
('Ilkal Handloom Weaving', 'Craft', true),
('Bidri Metal Inlay', 'Craft', true),
('Dolby Atmos Mixing', 'Audio', false),
('Foley Sound Design', 'Audio', false),
('Anamorphic Cinematography', 'Film', false)
ON CONFLICT (name) DO NOTHING;
