'use client'

import { useState } from 'react'
import { AdminVerificationCard } from '@/components/admin/AdminVerificationCard'
import type { Verification } from '@/lib/supabase/types'

type VerificationWithProfile = Verification & {
  profiles: {
    id: string
    username: string
    avatar_url: string | null
  } | null
}

interface AdminVerificationListProps {
  initialVerifications: VerificationWithProfile[]
}

export function AdminVerificationList({ initialVerifications }: AdminVerificationListProps) {
  const [verifications, setVerifications] = useState(initialVerifications)

  function handleResolved(id: string) {
    // Remove resolved item after a short delay for UX feedback
    setTimeout(() => {
      setVerifications((prev) => prev.filter((v) => v.id !== id))
    }, 1500)
  }

  if (verifications.length === 0) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-10 text-center">
        <p className="text-[#6b6b6b] text-sm">All caught up — no pending verifications.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {verifications.map((verification) => (
        <AdminVerificationCard
          key={verification.id}
          verification={verification}
          onResolved={handleResolved}
        />
      ))}
    </div>
  )
}
