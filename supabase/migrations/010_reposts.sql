ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_of uuid REFERENCES posts(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_repost boolean NOT NULL DEFAULT false;
-- Allow empty content for reposts (content can be '' when is_repost=true)
-- We handle this in API validation, not DB constraint
CREATE INDEX IF NOT EXISTS posts_repost_of_idx ON posts (repost_of);
