'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/notifications')
        if (!res.ok) return
        const data = await res.json()
        const notifications = data.notifications ?? []
        const unread = notifications.filter((n: { is_read: boolean }) => !n.is_read).length
        setUnreadCount(unread)
      } catch {
        // silently ignore
      }
    }
    fetchCount()
  }, [])

  return (
    <Link
      href="/notifications"
      className="relative text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
      title="Notifications"
    >
      <Bell className="w-5 h-5" strokeWidth={1.5} />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#dc2626] text-white text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
