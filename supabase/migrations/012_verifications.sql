-- Add verification fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  location text NOT NULL,
  id_type text NOT NULL CHECK (id_type IN ('passport', 'drivers_license', 'national_id', 'state_id')),
  id_document_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now() NOT NULL,
  reviewed_at timestamptz,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason text
);

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verif_select_own" ON verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "verif_insert" ON verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "verif_update_own_pending" ON verifications FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can see all verifications
CREATE POLICY "verif_admin_select" ON verifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "verif_admin_update" ON verifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- NOTE: You must manually create a private Storage bucket named "id-documents" in your
-- Supabase dashboard (Storage > New bucket). Set it to Private (not public).
-- The service role key is used server-side to upload and download files from this bucket.
