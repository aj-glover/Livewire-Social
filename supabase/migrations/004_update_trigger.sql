-- Update the handle_new_user trigger to also store date_of_birth and phone
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, date_of_birth, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    (NEW.raw_user_meta_data->>'date_of_birth')::date,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, profiles.date_of_birth),
    phone = COALESCE(EXCLUDED.phone, profiles.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
