-- Create contact_messages table for storing contact form submissions
-- This table is used by the /api/contact endpoint

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' NOT NULL,
    responded_at TIMESTAMPTZ,
    response_notes TEXT
);

-- Add comments for documentation
COMMENT ON TABLE public.contact_messages IS 'Stores contact form submissions from visitors';
COMMENT ON COLUMN public.contact_messages.status IS 'Status of the message: new, read, responded, archived';

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (used by API with service role key)
CREATE POLICY "Service role has full access to contact_messages"
ON public.contact_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Authenticated admins can read all messages
CREATE POLICY "Admins can read contact_messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'moderator')
    )
);

-- Policy: Admins can update message status
CREATE POLICY "Admins can update contact_messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'moderator')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'moderator')
    )
);

-- Create index for faster lookups by status
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
