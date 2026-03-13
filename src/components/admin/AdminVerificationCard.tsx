'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ExternalLink, Check, X, User } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import type { Verification } from '@/lib/supabase/types'

interface VerificationWithProfile extends Verification {
  profiles: {
    id: string
    username: string
    avatar_url: string | null
  } | null
}

interface AdminVerificationCardProps {
  verification: VerificationWithProfile
  onResolved: (id: string) => void
}

const ID_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  drivers_license: "Driver's License",
  national_id: 'National ID',
  state_id: 'State ID',
}

export function AdminVerificationCard({ verification, onResolved }: AdminVerificationCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [resolved, setResolved] = useState<'approved' | 'rejected' | null>(null)

  const profile = verification.profiles

  async function handleApprove() {
    setLoading('approve')
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: verification.id, action: 'approve' }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to approve.')
        return
      }

      setResolved('approved')
      toast.success(`Approved @${profile?.username ?? 'user'}`)
      onResolved(verification.id)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.')
      return
    }

    setLoading('reject')
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: verification.id,
          action: 'reject',
          reason: rejectionReason.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to reject.')
        return
      }

      setResolved('rejected')
      toast.success(`Rejected @${profile?.username ?? 'user'}`)
      onResolved(verification.id)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (resolved) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 opacity-60">
        <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
          {resolved === 'approved' ? (
            <Check className="w-4 h-4 text-[#16a34a]" strokeWidth={2} />
          ) : (
            <X className="w-4 h-4 text-[#dc2626]" strokeWidth={2} />
          )}
          <span>
            {resolved === 'approved' ? 'Approved' : 'Rejected'} — @{profile?.username ?? 'user'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
      {/* User info */}
      <div className="flex items-center gap-3">
        {profile ? (
          <Avatar username={profile.username} avatarUrl={profile.avatar_url} size="md" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center">
            <User className="w-5 h-5 text-[#9b9b9b]" strokeWidth={1.5} />
          </div>
        )}
        <div>
          <p className="text-[#1a1a1a] font-medium">@{profile?.username ?? 'Unknown'}</p>
          <p className="text-xs text-[#6b6b6b]">
            Submitted {new Date(verification.submitted_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Verification details */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-[#6b6b6b]">Full name</dt>
          <dd className="text-[#1a1a1a] mt-0.5">{verification.full_name}</dd>
        </div>
        <div>
          <dt className="text-[#6b6b6b]">Date of birth</dt>
          <dd className="text-[#1a1a1a] mt-0.5">
            {new Date(verification.date_of_birth).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </dd>
        </div>
        <div>
          <dt className="text-[#6b6b6b]">Location</dt>
          <dd className="text-[#1a1a1a] mt-0.5">{verification.location}</dd>
        </div>
        <div>
          <dt className="text-[#6b6b6b]">ID type</dt>
          <dd className="text-[#1a1a1a] mt-0.5">
            {ID_TYPE_LABELS[verification.id_type] ?? verification.id_type}
          </dd>
        </div>
      </dl>

      {/* View document */}
      <a
        href={`/api/admin/id-document/${verification.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
      >
        <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
        View ID Document
      </a>

      {/* Actions */}
      {!showRejectForm ? (
        <div className="flex items-center gap-3 pt-2 border-t border-[#e5e5e5]">
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16a34a] text-white text-sm hover:bg-[#15803d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            {loading === 'approve' ? 'Approving...' : 'Approve'}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading !== null}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#dc2626] text-white text-sm hover:bg-[#b91c1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" strokeWidth={2} />
            Reject
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-[#e5e5e5] space-y-3">
          <label className="block text-sm text-[#1a1a1a]">Rejection reason</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why the verification was rejected..."
            rows={3}
            className="w-full bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#9b9b9b] focus:outline-none focus:border-[#2563eb] transition-colors resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              disabled={loading !== null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#dc2626] text-white text-sm hover:bg-[#b91c1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" strokeWidth={2} />
              {loading === 'reject' ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false)
                setRejectionReason('')
              }}
              disabled={loading !== null}
              className="px-5 py-2.5 rounded-full border border-[#e5e5e5] text-sm text-[#6b6b6b] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
