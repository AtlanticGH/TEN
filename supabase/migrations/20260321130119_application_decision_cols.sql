-- Add columns required by the email decision system
-- (idempotent — safe to run multiple times)
-- Must run after 20260321130103_courses.sql (creates public.applications)

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS rejection_reason       text,
  ADD COLUMN IF NOT EXISTS decision_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS decision_email_type    text
    CHECK (decision_email_type IN ('approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_applications_decision_type
  ON public.applications (decision_email_type)
  WHERE decision_email_type IS NOT NULL;
