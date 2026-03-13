-- Add date_of_birth to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Add phone (unique, for one-account enforcement)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text UNIQUE;

-- Add adult content flag to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_adult_content boolean NOT NULL DEFAULT false;
