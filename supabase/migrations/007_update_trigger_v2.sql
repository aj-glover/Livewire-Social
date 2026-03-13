-- Update handle_new_user trigger to also store location, gender, political_lean, ethnicity
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, date_of_birth, phone, location, gender, political_lean, ethnicity)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    (NEW.raw_user_meta_data->>'date_of_birth')::date,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'location',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'political_lean',
    NEW.raw_user_meta_data->>'ethnicity'
  )
  ON CONFLICT (id) DO UPDATE SET
    username        = EXCLUDED.username,
    date_of_birth   = COALESCE(EXCLUDED.date_of_birth, profiles.date_of_birth),
    phone           = COALESCE(EXCLUDED.phone, profiles.phone),
    location        = COALESCE(EXCLUDED.location, profiles.location),
    gender          = COALESCE(EXCLUDED.gender, profiles.gender),
    political_lean  = COALESCE(EXCLUDED.political_lean, profiles.political_lean),
    ethnicity       = COALESCE(EXCLUDED.ethnicity, profiles.ethnicity);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
