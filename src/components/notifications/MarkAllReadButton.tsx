'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function MarkAllReadButton() {
  const router = useRouter()

  useEffect(() => {
    // Auto-mark all as read on mount
    fetch('/api/notifications', { method: 'PATCH' })
      .then(() => router.refresh())
      .catch(() => {})
  }, [router])

  return (
    <button
      onClick={() => {
        fetch('/api/notifications', { method: 'PATCH' }).then(() => router.refresh())
      }}
      className="text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
    >
      Mark all as read
    </button>
  )
}
