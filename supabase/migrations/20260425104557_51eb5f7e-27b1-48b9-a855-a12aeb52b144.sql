CREATE TABLE public.cms_admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin sessions are private"
ON public.cms_admin_sessions
FOR SELECT
USING (false);

CREATE INDEX idx_cms_admin_sessions_expires ON public.cms_admin_sessions (expires_at);