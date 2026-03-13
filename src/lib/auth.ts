import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireVerifiedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { user: null, supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!user.email_confirmed_at) {
    return { user: null, supabase, error: NextResponse.json({ error: 'Please verify your email before interacting.' }, { status: 403 }) }
  }
  return { user, supabase, error: null }
}
