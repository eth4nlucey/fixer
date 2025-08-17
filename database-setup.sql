-- Fixer App Database Schema
-- Run this in your Supabase SQL editor

-- Enable PostGIS for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('danger', 'safe', 'checkpoint', 'incident', 'resource')),
    severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    description TEXT,
    reporter_id UUID REFERENCES auth.users(id),
    anonymous BOOLEAN DEFAULT true,
    verification_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create verifications table
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    device_id TEXT,
    is_accurate BOOLEAN NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('hospital', 'shelter', 'water', 'food', 'internet', 'fuel')),
    name TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    status TEXT CHECK (status IN ('operational', 'limited', 'closed')),
    details JSONB,
    contact_info TEXT,
    capacity INTEGER,
    last_verified TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create journalist_profiles table
CREATE TABLE IF NOT EXISTS public.journalist_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization TEXT,
    emergency_contact TEXT,
    check_in_frequency TEXT,
    last_check_in TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports (type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at);
CREATE INDEX IF NOT EXISTS idx_reports_verified ON public.reports (verified);

CREATE INDEX IF NOT EXISTS idx_resources_location ON public.resources USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources (type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources (status);

CREATE INDEX IF NOT EXISTS idx_verifications_report_id ON public.verifications (report_id);
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON public.verifications (created_at);

-- Create function to get reports within bounds
CREATE OR REPLACE FUNCTION get_reports_in_bounds(
    lat_min FLOAT,
    lat_max FLOAT,
    lng_min FLOAT,
    lng_max FLOAT
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    severity TEXT,
    description TEXT,
    latitude FLOAT,
    longitude FLOAT,
    verified BOOLEAN,
    verification_count INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.type,
        r.severity,
        r.description,
        ST_Y(r.location::geometry) as latitude,
        ST_X(r.location::geometry) as longitude,
        r.verified,
        r.verification_count,
        r.created_at
    FROM public.reports r
    WHERE ST_Within(
        r.location::geometry,
        ST_MakeEnvelope(lng_min, lat_min, lng_max, lat_max, 4326)
    )
    AND (r.expires_at IS NULL OR r.expires_at > NOW())
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to find nearest resources
CREATE OR REPLACE FUNCTION find_nearest_resources(
    user_lat FLOAT,
    user_lng FLOAT,
    resource_type_filter TEXT DEFAULT NULL,
    max_distance_meters INTEGER DEFAULT 10000,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    status TEXT,
    distance_meters FLOAT,
    latitude FLOAT,
    longitude FLOAT,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.type,
        r.status,
        ST_Distance(r.location::geography, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distance_meters,
        ST_Y(r.location::geometry) as latitude,
        ST_X(r.location::geometry) as longitude,
        r.details
    FROM public.resources r
    WHERE (resource_type_filter IS NULL OR r.type = resource_type_filter)
    AND ST_DWithin(r.location::geography, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, max_distance_meters)
    ORDER BY distance_meters ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journalist_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports (allow all read, authenticated users can insert)
CREATE POLICY "Reports are viewable by everyone" ON public.reports
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reports" ON public.reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Users can update their own reports" ON public.reports
    FOR UPDATE USING (auth.uid() = reporter_id);

-- RLS Policies for verifications
CREATE POLICY "Verifications are viewable by everyone" ON public.verifications
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert verifications" ON public.verifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- RLS Policies for resources
CREATE POLICY "Resources are viewable by everyone" ON public.resources
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can modify resources" ON public.resources
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for journalist profiles
CREATE POLICY "Users can view their own profile" ON public.journalist_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.journalist_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.journalist_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional - remove in production)
INSERT INTO public.resources (type, name, location, status, details) VALUES
('shelter', 'Central Metro Station', ST_SetSRID(ST_MakePoint(30.5234, 50.4501), 4326), 'operational', '{"capacity": 200, "facilities": ["restrooms", "water", "medical"]}'),
('hospital', 'Kyiv City Hospital', ST_SetSRID(ST_MakePoint(30.5326, 50.4502), 4326), 'operational', '{"emergency": true, "specialties": ["trauma", "cardiology"]}'),
('shelter', 'University Metro Station', ST_SetSRID(ST_MakePoint(30.5134, 50.4401), 4326), 'operational', '{"capacity": 150, "facilities": ["restrooms", "water"]}')
ON CONFLICT DO NOTHING;