-- ============================================
-- Email Notifications & Logging System
-- ============================================

-- Create enum for email status
DO $$ BEGIN
    CREATE TYPE public.email_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_name TEXT,
    status public.email_status DEFAULT 'pending',
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view email logs
CREATE POLICY "Admins can view all email logs" 
    ON public.email_logs 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create external_events table to trigger edge functions
-- This serves as a queue for out-of-band processing
CREATE TABLE IF NOT EXISTS public.queued_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'welcome', 'new_comment', etc.
    payload JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.queued_emails ENABLE ROW LEVEL SECURITY;

-- Only system/authenticated can insert (effectively handled by triggers)
CREATE POLICY "System can manage queued emails" 
    ON public.queued_emails 
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_queued_emails_unprocessed ON public.queued_emails(processed_at) WHERE processed_at IS NULL;

-- Trigger Function: Queue email on new user
CREATE OR REPLACE FUNCTION public.queue_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.queued_emails (user_id, type, payload)
    VALUES (
        NEW.id,
        'welcome',
        jsonb_build_object(
            'email', NEW.email,
            'name', COALESCE(NEW.name, 'Researcher')
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for welcome email
DROP TRIGGER IF EXISTS on_auth_user_created_email ON public.users;
CREATE TRIGGER on_auth_user_created_email
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.queue_welcome_email();

-- Trigger Function: Queue email on new comment (simplified)
CREATE OR REPLACE FUNCTION public.queue_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_title TEXT;
    actor_name TEXT;
BEGIN
    -- Get post details
    SELECT author_id, title INTO post_author_id, post_title
    FROM public.posts
    WHERE id = NEW.post_id;

    -- Get actor name
    SELECT name INTO actor_name
    FROM public.users
    WHERE id = NEW.author_id;

    -- Don't notify self
    IF post_author_id != NEW.author_id THEN
        INSERT INTO public.queued_emails (user_id, type, payload)
        VALUES (
            post_author_id,
            'new_comment',
            jsonb_build_object(
                'post_title', post_title,
                'comment_preview', LEFT(NEW.content, 100),
                'actor_name', actor_name,
                'post_id', NEW.post_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment email
DROP TRIGGER IF EXISTS on_comment_created_email ON public.comments;
CREATE TRIGGER on_comment_created_email
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.queue_comment_notification();
