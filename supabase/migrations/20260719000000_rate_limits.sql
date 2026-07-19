-- Migration to create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER DEFAULT 1 NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    window_ms INTEGER NOT NULL
);

-- Index for pruning expired rate limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry
  ON public.rate_limits (window_start);
