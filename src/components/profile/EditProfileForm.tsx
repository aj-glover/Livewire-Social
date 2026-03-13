'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Profile } from '@/lib/supabase/types'

interface EditProfileFormProps {
  profile: Profile
}

const inputCls =
  'w-full bg-white border border-[#e5e5e5] rounded-2xl px-6 py-4 text-[#1a1a1a] placeholder-[#9b9b9b] focus:outline-none focus:border-[#2563eb] transition-colors'

const selectCls =
  'w-full bg-white border border-[#e5e5e5] rounded-2xl px-6 py-4 text-[#1a1a1a] focus:outline-none focus:border-[#2563eb] transition-colors cursor-pointer appearance-none'

const labelCls = 'block text-sm text-[#6b6b6b] mb-2'

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Other']
const POLITICS = ['Very Liberal', 'Liberal', 'Moderate', 'Conservative', 'Very Conservative']
const ETHNICITIES = [
  'Asian',
  'Black / African American',
  'Hispanic / Latino',
  'Middle Eastern',
  'Native American',
  'Pacific Islander',
  'White / Caucasian',
  'Multiracial',
  'Other',
]

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(profile.username ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [location, setLocation] = useState(profile.location ?? '')
  const [gender, setGender] = useState(profile.gender ?? '')
  const [politicalLean, setPoliticalLean] = useState(profile.political_lean ?? '')
  const [ethnicity, setEthnicity] = useState(profile.ethnicity ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!username.trim()) {
      toast.error('Username is required')
      return
    }

    const usernameRegex = /^[a-z0-9_]{3,}$/
    if (!usernameRegex.test(username.trim())) {
      toast.error('Username must be at least 3 characters: lowercase letters, numbers, underscores only')
      return
    }

    if (bio.length > 160) {
      toast.error('Bio must be 160 characters or fewer')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          bio: bio.trim() || null,
          location: location.trim() || null,
          gender: gender || null,
          political_lean: politicalLean || null,
          ethnicity: ethnicity || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to update profile')
        return
      }

      toast.success('Profile updated')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username */}
      <div>
        <label className={labelCls}>Username *</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          placeholder="your_username"
          required
          minLength={3}
          className={inputCls}
        />
        <p className="mt-1.5 text-xs text-[#9b9b9b]">Lowercase letters, numbers, and underscores only. Min 3 characters.</p>
      </div>

      {/* Bio */}
      <div>
        <label className={labelCls}>Bio</label>
        <div className="relative">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the wire about yourself…"
            rows={3}
            maxLength={160}
            className={`${inputCls} resize-none`}
          />
          <span className={`absolute bottom-3 right-4 text-xs ${bio.length > 140 ? 'text-[#dc2626]' : 'text-[#9b9b9b]'}`}>
            {bio.length}/160
          </span>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className={labelCls}>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, State or Country"
          className={inputCls}
        />
      </div>

      {/* Gender */}
      <div>
        <label className={labelCls}>Gender</label>
        <div className="relative">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={selectCls}
          >
            <option value="">Prefer not to say</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#9b9b9b] text-xs">▾</span>
        </div>
      </div>

      {/* Political lean */}
      <div>
        <label className={labelCls}>Political lean</label>
        <div className="relative">
          <select
            value={politicalLean}
            onChange={(e) => setPoliticalLean(e.target.value)}
            className={selectCls}
          >
            <option value="">Prefer not to say</option>
            {POLITICS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#9b9b9b] text-xs">▾</span>
        </div>
      </div>

      {/* Ethnicity */}
      <div>
        <label className={labelCls}>Ethnicity</label>
        <div className="relative">
          <select
            value={ethnicity}
            onChange={(e) => setEthnicity(e.target.value)}
            className={selectCls}
          >
            <option value="">Prefer not to say</option>
            {ETHNICITIES.map((eth) => (
              <option key={eth} value={eth}>{eth}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#9b9b9b] text-xs">▾</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1a1a1a] text-white py-4 rounded-full hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
