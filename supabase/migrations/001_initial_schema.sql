-- Enable trigram extension for fuzzy duplicate detection
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- GIN index for fast trigram similarity search
CREATE INDEX posts_content_trgm_idx ON posts USING GIN (content gin_trgm_ops);

-- Likes table
CREATE TABLE likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Follows table
CREATE TABLE follows (
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- RPC: check post similarity
CREATE OR REPLACE FUNCTION check_post_similarity(input_content text, similarity_threshold float DEFAULT 0.65)
RETURNS TABLE (
  post_id uuid,
  author_username text,
  similarity_score float
) LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, pr.username, similarity(p.content, input_content) AS similarity_score
  FROM posts p
  JOIN profiles pr ON pr.id = p.user_id
  WHERE similarity(p.content, input_content) > similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT 1;
$$;
