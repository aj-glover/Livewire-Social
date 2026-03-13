import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getTargetProfile(supabase: Awaited<ReturnType<typeof createClient>>, username: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()
  return data
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const target = await getTargetProfile(supabase, username)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.id === user.id) return NextResponse.json({ error: 'Cannot mute yourself' }, { status: 400 })

  const { error } = await supabase
    .from('mutes')
    .insert({ muter_id: user.id, muted_id: target.id })

  if (error && error.code !== '23505') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const target = await getTargetProfile(supabase, username)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error } = await supabase
    .from('mutes')
    .delete()
    .eq('muter_id', user.id)
    .eq('muted_id', target.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 200 })
}
