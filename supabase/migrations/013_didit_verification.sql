-- Add Didit session tracking to verifications table
ALTER TABLE verifications ADD COLUMN IF NOT EXISTS didit_session_id text UNIQUE;

-- Make manual upload fields optional (Didit flow doesn't require them)
ALTER TABLE verifications ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE verifications ALTER COLUMN date_of_birth DROP NOT NULL;
ALTER TABLE verifications ALTER COLUMN location DROP NOT NULL;
ALTER TABLE verifications ALTER COLUMN id_type DROP NOT NULL;
ALTER TABLE verifications ALTER COLUMN id_document_path DROP NOT NULL;

-- Drop old id_type check constraint if it exists
ALTER TABLE verifications DROP CONSTRAINT IF EXISTS verifications_id_type_check;

-- Expand status values to include Didit statuses
ALTER TABLE verifications DROP CONSTRAINT IF EXISTS verifications_status_check;
ALTER TABLE verifications ADD CONSTRAINT verifications_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'in_review', 'declined', 'expired', 'abandoned'));

-- Allow webhook (service role) to update verifications without RLS
-- The existing policies allow users to update their own pending verifications,
-- but the webhook uses service role which bypasses RLS entirely, so no extra policy needed.
