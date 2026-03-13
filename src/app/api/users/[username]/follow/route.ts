import { NextRequest, NextResponse } from 'next/server'
import { requireVerifiedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

async function getTargetUser(supabase: Awaited<ReturnType<typeof createClient>>, username: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()
  return data
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const { user, supabase, error } = await requireVerifiedUser()
  if (error) return error

  const target = await getTargetUser(supabase, username)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.id === user!.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

  const { error: insertError } = await supabase
    .from('follows')
    .insert({ follower_id: user!.id, following_id: target.id })

  if (insertError) {
    if (insertError.code === '23505') return NextResponse.json({ error: 'Already following' }, { status: 409 })
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 201 })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const { user, supabase, error } = await requireVerifiedUser()
  if (error) return error

  const target = await getTargetUser(supabase, username)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error: deleteError } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user!.id)
    .eq('following_id', target.id)

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
