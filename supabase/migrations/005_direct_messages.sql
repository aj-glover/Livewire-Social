-- Add public_key to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_key text;

-- Direct messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ciphertext text NOT NULL,
  iv text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS dm_participants_idx ON direct_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS dm_recipient_idx ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS dm_created_idx ON direct_messages(created_at);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dm_select" ON direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "dm_insert" ON direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
