import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Verify original post exists
  const { data: original, error: fetchError } = await supabase
    .from('posts')
    .select('id')
    .eq('id', id)
    .single()

  if (fetchError || !original) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Check if user already reposted
  const { data: existing } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', user.id)
    .eq('repost_of', id)
    .eq('is_repost', true)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already reposted' }, { status: 409 })
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content: '',
      repost_of: id,
      is_repost: true,
    })
    .select('*, profiles(id, username, avatar_url), likes(id, user_id), comments(id), bookmarks(user_id), repost_post:repost_of(id, content, image_url, created_at, profiles(id, username, avatar_url))')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post }, { status: 201 })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('user_id', user.id)
    .eq('repost_of', id)
    .eq('is_repost', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
