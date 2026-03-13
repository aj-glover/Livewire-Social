CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'follow')),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
-- system inserts via SECURITY DEFINER triggers, no INSERT policy needed for users

-- Like notification trigger
CREATE OR REPLACE FUNCTION notify_on_like() RETURNS trigger AS $$
DECLARE post_owner uuid;
BEGIN
  SELECT user_id INTO post_owner FROM posts WHERE id = NEW.post_id;
  IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, post_id)
    VALUES (post_owner, NEW.user_id, 'like', NEW.post_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE TRIGGER trg_notify_like AFTER INSERT ON likes FOR EACH ROW EXECUTE FUNCTION notify_on_like();

-- Comment notification trigger
CREATE OR REPLACE FUNCTION notify_on_comment() RETURNS trigger AS $$
DECLARE post_owner uuid;
BEGIN
  SELECT user_id INTO post_owner FROM posts WHERE id = NEW.post_id;
  IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, post_id)
    VALUES (post_owner, NEW.user_id, 'comment', NEW.post_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE TRIGGER trg_notify_comment AFTER INSERT ON comments FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- Follow notification trigger
CREATE OR REPLACE FUNCTION notify_on_follow() RETURNS trigger AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE TRIGGER trg_notify_follow AFTER INSERT ON follows FOR EACH ROW EXECUTE FUNCTION notify_on_follow();
