import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: other } = await supabase
    .from('profiles')
    .select('id, username, public_key')
    .eq('username', username)
    .single()

  if (!other) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${other.id}),and(sender_id.eq.${other.id},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: messages ?? [], other })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ciphertext, iv } = await req.json()
  if (!ciphertext || !iv) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: recipient } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!recipient) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: message, error } = await supabase
    .from('direct_messages')
    .insert({ sender_id: user.id, recipient_id: recipient.id, ciphertext, iv })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message })
}
