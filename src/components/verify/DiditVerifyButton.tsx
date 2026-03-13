'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ShieldCheck, Loader2 } from 'lucide-react'

export function DiditVerifyButton() {
  const [loading, setLoading] = useState(false)

  async function startVerification() {
    setLoading(true)
    try {
      const res = await fetch('/api/verify/session', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Could not start verification.')
        return
      }

      window.location.href = data.verification_url
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={startVerification}
      disabled={loading}
      className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-sm hover:bg-[#333] transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
      )}
      {loading ? 'Starting…' : 'Start Identity Verification'}
    </button>
  )
}
