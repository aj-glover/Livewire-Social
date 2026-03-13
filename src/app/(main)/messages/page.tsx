import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MessageCircle } from 'lucide-react'

export const revalidate = 0

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get distinct conversation partners via raw query approach
  const { data: sent } = await supabase
    .from('direct_messages')
    .select('recipient_id')
    .eq('sender_id', user.id)

  const { data: received } = await supabase
    .from('direct_messages')
    .select('sender_id')
    .eq('recipient_id', user.id)

  const partnerIds = new Set<string>()
  sent?.forEach(m => partnerIds.add(m.recipient_id))
  received?.forEach(m => partnerIds.add(m.sender_id))

  let partners: { id: string; username: string }[] = []
  if (partnerIds.size > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', Array.from(partnerIds))
    partners = data ?? []
  }

  return (
    <div className="bg-white min-h-[calc(100vh-65px)]">
      <div className="px-6 py-6 border-b border-[#e5e5e5]">
        <h2 className="text-xl text-[#1a1a1a]">Messages</h2>
        <p className="text-sm text-[#9b9b9b] mt-1">End-to-end encrypted</p>
      </div>

      {partners.length === 0 ? (
        <div className="py-24 text-center">
          <MessageCircle className="w-10 h-10 text-[#e5e5e5] mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-[#9b9b9b] text-sm">No conversations yet.</p>
          <p className="text-[#9b9b9b] text-sm mt-1">Visit someone's profile to message them.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#e5e5e5]">
          {partners.map((p) => (
            <li key={p.id}>
              <Link
                href={`/messages/${p.username}`}
                className="flex items-center gap-4 px-6 py-5 hover:bg-[#f9f9f9] transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm">{p.username[0].toUpperCase()}</span>
                </div>
                <span className="text-[#1a1a1a]">{p.username}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
