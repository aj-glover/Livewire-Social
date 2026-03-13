'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Other']
const POLITICS = ['Very Liberal', 'Liberal', 'Moderate', 'Conservative', 'Very Conservative']
const ETHNICITIES = [
  'Asian', 'Black / African American', 'Hispanic / Latino', 'Middle Eastern',
  'Native American', 'Pacific Islander', 'White / Caucasian', 'Multiracial', 'Other',
]

export default function SignupPage() {
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState('')
  const [politicalLean, setPoliticalLean] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (username.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('Only lowercase letters, numbers, and underscores.')
      return
    }

    if (!dateOfBirth) {
      setError('Date of birth is required.')
      return
    }

    const dob = new Date(dateOfBirth)
    const now = new Date()
    const age = now.getFullYear() - dob.getFullYear()
    const hadBirthdayThisYear =
      now.getMonth() > dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate())
    const actualAge = hadBirthdayThisYear ? age : age - 1

    if (actualAge < 13) {
      setError('You must be at least 13 years old to join LiveWire.')
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          date_of_birth: dateOfBirth,
          phone: phone.trim() || null,
          location: location.trim() || null,
          gender: gender || null,
          political_lean: politicalLean || null,
          ethnicity: ethnicity || null,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  const inputCls = 'w-full bg-white border border-[#e5e5e5] rounded-2xl px-6 py-4 text-[#1a1a1a] placeholder:text-[#9b9b9b] focus:outline-none focus:border-[#2563eb] transition-colors'
  const selectCls = `${inputCls} appearance-none cursor-pointer`

  if (submitted) {
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

            <h2 className="text-3xl text-[#1a1a1a] mb-2">Check your email</h2>
            <p className="text-[#6b6b6b] leading-relaxed">
              We sent a confirmation link to <span className="text-[#1a1a1a]">{email}</span>. Click it to activate your account.
            </p>
          </motion.div>
        </div>
      </div>
    )
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

          <h2 className="text-3xl text-[#1a1a1a] mb-2">Join LiveWire</h2>
          <p className="text-[#6b6b6b] mb-10">Create your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
              autoComplete="username"
              className={inputCls}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputCls}
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
              className={inputCls}
            />
            <div>
              <label className="block text-[#6b6b6b] text-sm mb-1 px-1">Date of birth</label>
              <input
                type="date"
                max={today}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className={inputCls}
            />

            {/* Optional profile dimensions for feed filtering */}
            <p className="text-xs text-[#9b9b9b] px-1 pt-2">
              Optional — helps others find your signals
            </p>

            <input
              type="text"
              placeholder="Location (city, state, or country)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoComplete="country-name"
              className={inputCls}
            />

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={selectCls}
            >
              <option value="">Gender (optional)</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            <select
              value={politicalLean}
              onChange={(e) => setPoliticalLean(e.target.value)}
              className={selectCls}
            >
              <option value="">Political lean (optional)</option>
              {POLITICS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={ethnicity}
              onChange={(e) => setEthnicity(e.target.value)}
              className={selectCls}
            >
              <option value="">Ethnicity (optional)</option>
              {ETHNICITIES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>

            {error && <p className="text-sm text-[#dc2626]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-4 rounded-full hover:bg-[#333] transition-colors mt-4 disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-[#6b6b6b] mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2563eb] hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
