ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS registration_mode TEXT DEFAULT 'internal'::text NOT NULL CHECK (registration_mode IN ('internal', 'external')),
ADD COLUMN IF NOT EXISTS external_rsvp_url TEXT DEFAULT ''::text NOT NULL;
