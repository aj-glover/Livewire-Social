import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: post_id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content } = body

  if (!content || typeof content !== 'string' || content.trim().length < 1) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id, user_id: user.id, content: content.trim() })
    .select('*, profiles(id, username, avatar_url)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comment: data }, { status: 201 })
}
