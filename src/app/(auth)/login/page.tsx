'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-10">
            <Zap className="w-7 h-7 text-[#2563eb]" strokeWidth={1.5} />
            <span className="text-2xl text-[#1a1a1a]">LiveWire</span>
          </div>

          <h2 className="text-3xl text-[#1a1a1a] mb-2">Welcome back</h2>
          <p className="text-[#6b6b6b] mb-10">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-white border border-[#e5e5e5] rounded-2xl px-6 py-4 text-[#1a1a1a] placeholder:text-[#9b9b9b] focus:outline-none focus:border-[#2563eb] transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-white border border-[#e5e5e5] rounded-2xl px-6 py-4 text-[#1a1a1a] placeholder:text-[#9b9b9b] focus:outline-none focus:border-[#2563eb] transition-colors"
            />
            {error && <p className="text-sm text-[#dc2626]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-4 rounded-full hover:bg-[#333] transition-colors mt-4 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => router.push('/signup')}
            className="w-full text-[#6b6b6b] mt-6 hover:text-[#1a1a1a] transition-colors text-sm"
          >
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#2563eb]">Sign up</Link>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
