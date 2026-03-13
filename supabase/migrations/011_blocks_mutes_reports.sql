CREATE TABLE IF NOT EXISTS blocks (
  blocker_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (blocker_id, blocked_id)
);
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocks_select" ON blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "blocks_insert" ON blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "blocks_delete" ON blocks FOR DELETE USING (auth.uid() = blocker_id);

CREATE TABLE IF NOT EXISTS mutes (
  muter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  muted_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (muter_id, muted_id)
);
ALTER TABLE mutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mutes_select" ON mutes FOR SELECT USING (auth.uid() = muter_id);
CREATE POLICY "mutes_insert" ON mutes FOR INSERT WITH CHECK (auth.uid() = muter_id);
CREATE POLICY "mutes_delete" ON mutes FOR DELETE USING (auth.uid() = muter_id);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_own" ON reports FOR SELECT USING (auth.uid() = reporter_id);
