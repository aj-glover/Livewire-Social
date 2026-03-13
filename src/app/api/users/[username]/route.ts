import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Get post count and follower/following counts
  const [{ count: postCount }, { count: followerCount }, { count: followingCount }] =
    await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id),
    ])

  return NextResponse.json({
    profile: { ...profile, postCount, followerCount, followingCount },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { bio, avatar_url, username: newUsername } = body

  const updates: Record<string, string> = {}
  if (bio !== undefined) updates.bio = bio
  if (avatar_url !== undefined) updates.avatar_url = avatar_url
  if (newUsername !== undefined) updates.username = newUsername

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .eq('username', username)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
