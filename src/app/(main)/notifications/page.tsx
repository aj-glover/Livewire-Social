import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { MarkAllReadButton } from '@/components/notifications/MarkAllReadButton'

export const revalidate = 0

type NotificationWithActor = {
  id: string
  type: 'like' | 'comment' | 'follow'
  post_id: string | null
  is_read: boolean
  created_at: string
  actor: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, actor:profiles!actor_id(id, username, avatar_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  const items = (notifications ?? []) as NotificationWithActor[]

  function getMessage(n: NotificationWithActor) {
    switch (n.type) {
      case 'like':
        return (
          <>
            <Link href={`/profile/${n.actor.username}`} className="text-[#1a1a1a] hover:underline">
              @{n.actor.username}
            </Link>{' '}
            <span className="text-[#6b6b6b]">liked your wire</span>
          </>
        )
      case 'comment':
        return (
          <>
            <Link href={`/profile/${n.actor.username}`} className="text-[#1a1a1a] hover:underline">
              @{n.actor.username}
            </Link>{' '}
            <span className="text-[#6b6b6b]">commented on your wire</span>
          </>
        )
      case 'follow':
        return (
          <>
            <Link href={`/profile/${n.actor.username}`} className="text-[#1a1a1a] hover:underline">
              @{n.actor.username}
            </Link>{' '}
            <span className="text-[#6b6b6b]">followed you</span>
          </>
        )
    }
  }

  function getHref(n: NotificationWithActor) {
    if (n.type === 'follow') return `/profile/${n.actor.username}`
    if (n.post_id) return `/post/${n.post_id}`
    return '#'
  }

  const hasUnread = items.some((n) => !n.is_read)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-6 py-6 border-b border-[#e5e5e5] flex items-center justify-between">
        <h1 className="text-xl text-[#1a1a1a]">Notifications</h1>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-xl text-[#1a1a1a]">All quiet.</p>
          <p className="mt-3 text-[#6b6b6b] text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#e5e5e5]">
          {items.map((n) => (
            <Link
              key={n.id}
              href={getHref(n)}
              className={`flex items-start gap-4 px-6 py-5 hover:bg-[#f9f9f9] transition-colors ${
                !n.is_read ? 'bg-[#eff6ff] border-l-2 border-[#2563eb]' : 'bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center shrink-0">
                <span className="text-white text-sm">{n.actor.username[0].toUpperCase()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed">{getMessage(n)}</p>
                <p className="mt-1 text-xs text-[#9b9b9b]">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-[#2563eb] mt-2 shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
