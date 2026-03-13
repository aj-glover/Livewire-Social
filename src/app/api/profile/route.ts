import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { username, bio, location, gender, political_lean, ethnicity, avatar_url } = body

  // Avatar-only update path — no username required
  if (avatar_url !== undefined && !username) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatar_url || null })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  }

  if (!username || typeof username !== 'string') {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  const usernameRegex = /^[a-z0-9_]{3,}$/
  if (!usernameRegex.test(username)) {
    return NextResponse.json(
      { error: 'Username must be at least 3 characters and contain only lowercase letters, numbers, and underscores' },
      { status: 400 }
    )
  }

  // Check if username is taken by someone else
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
  }

  const updateData: Record<string, string | null> = {
    username,
    bio: bio || null,
    location: location || null,
    gender: gender || null,
    political_lean: political_lean || null,
    ethnicity: ethnicity || null,
    avatar_url: avatar_url || null,
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile })
}
