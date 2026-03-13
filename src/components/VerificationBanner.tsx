'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface VerificationBannerProps {
  email: string
}

export function VerificationBanner({ email }: VerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  if (dismissed) return null

  async function handleResend() {
    setSending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) {
        toast.error('Could not resend email. Try again later.')
      } else {
        toast.success('Verification email sent!')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-amber-800 text-sm">
        Please verify your email to interact with LiveWire. Check your inbox at{' '}
        <span className="font-medium">{email}</span>.
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleResend}
          disabled={sending}
          className="text-sm text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Resend email'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-900 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
