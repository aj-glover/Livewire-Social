import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get most recent message per conversation partner
  const { data: sent } = await supabase
    .from('direct_messages')
    .select('recipient_id, created_at')
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  const { data: received } = await supabase
    .from('direct_messages')
    .select('sender_id, created_at')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })

  // Collect unique partner IDs
  const partnerIds = new Set<string>()
  sent?.forEach(m => partnerIds.add(m.recipient_id))
  received?.forEach(m => partnerIds.add(m.sender_id))

  if (partnerIds.size === 0) return NextResponse.json({ conversations: [] })

  const { data: partners } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', Array.from(partnerIds))

  return NextResponse.json({ conversations: partners ?? [] })
}
