-- Add filter dimensions to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS political_lean text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ethnicity text;

-- Indexes for efficient filtering
CREATE INDEX IF NOT EXISTS profiles_location_idx ON profiles (location);
CREATE INDEX IF NOT EXISTS profiles_gender_idx ON profiles (gender);
CREATE INDEX IF NOT EXISTS profiles_political_lean_idx ON profiles (political_lean);
CREATE INDEX IF NOT EXISTS profiles_ethnicity_idx ON profiles (ethnicity);
CREATE INDEX IF NOT EXISTS profiles_date_of_birth_idx ON profiles (date_of_birth);
