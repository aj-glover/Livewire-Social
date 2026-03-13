'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zap, TrendingUp, Award, MapPin, Ban, VolumeX, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/Avatar'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import type { Profile } from '@/lib/supabase/types'

interface ProfileHeaderProps {
  profile: Profile & {
    postCount: number | null
    followerCount: number | null
    followingCount: number | null
  }
  isOwnProfile: boolean
  initialIsFollowing: boolean
  initialIsBlocked?: boolean
  initialIsMuted?: boolean
}

const CHIP_COLORS: Record<string, string> = {
  'Very Liberal': 'bg-blue-50 text-blue-700',
  'Liberal': 'bg-blue-50 text-blue-600',
  'Moderate': 'bg-gray-100 text-gray-600',
  'Conservative': 'bg-red-50 text-red-600',
  'Very Conservative': 'bg-red-50 text-red-700',
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  initialIsFollowing,
  initialIsBlocked = false,
  initialIsMuted = false,
}: ProfileHeaderProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked)
  const [isMuted, setIsMuted] = useState(initialIsMuted)
  const [followerCount, setFollowerCount] = useState(profile.followerCount ?? 0)
  const [loading, setLoading] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [muteLoading, setMuteLoading] = useState(false)

  async function toggleFollow() {
    setLoading(true)
    const method = isFollowing ? 'DELETE' : 'POST'
    const res = await fetch(`/api/users/${profile.username}/follow`, { method })

    if (!res.ok && res.status !== 409) {
      toast.error('Could not update follow status.')
      setLoading(false)
      return
    }

    if (isFollowing) {
      setIsFollowing(false)
      setFollowerCount((n) => n - 1)
    } else {
      setIsFollowing(true)
      setFollowerCount((n) => n + 1)
    }
    setLoading(false)
  }

  async function toggleBlock() {
    setBlockLoading(true)
    const method = isBlocked ? 'DELETE' : 'POST'
    const res = await fetch(`/api/users/${profile.username}/block`, { method })

    if (!res.ok) {
      toast.error('Could not update block status.')
      setBlockLoading(false)
      return
    }

    if (isBlocked) {
      setIsBlocked(false)
      toast.success('Unblocked.')
    } else {
      setIsBlocked(true)
      toast.success('User blocked.')
    }
    setBlockLoading(false)
  }

  async function toggleMute() {
    setMuteLoading(true)
    const method = isMuted ? 'DELETE' : 'POST'
    const res = await fetch(`/api/users/${profile.username}/mute`, { method })

    if (!res.ok) {
      toast.error('Could not update mute status.')
      setMuteLoading(false)
      return
    }

    if (isMuted) {
      setIsMuted(false)
      toast.success('Unmuted.')
    } else {
      setIsMuted(true)
      toast.success('User muted.')
    }
    setMuteLoading(false)
  }

  const chips = [profile.gender, profile.ethnicity, profile.political_lean].filter(Boolean) as string[]

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 py-10 bg-white"
      >
        <div className="flex items-start gap-6">
          <Avatar username={profile.username} avatarUrl={profile.avatar_url} size="xl" />

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl text-[#1a1a1a] mb-1 flex items-center">
              @{profile.username}
              {profile.is_verified && <VerifiedBadge size="md" />}
            </h1>

            {profile.bio && (
              <p className="text-[#6b6b6b] text-sm mb-3 leading-relaxed">{profile.bio}</p>
            )}

            {profile.location && (
              <div className="flex items-center gap-1.5 text-[#6b6b6b] text-sm mb-3">
                <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span>{profile.location}</span>
              </div>
            )}

            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className={`text-xs px-2.5 py-1 rounded-full ${CHIP_COLORS[chip] ?? 'bg-[#f3f4f6] text-[#6b6b6b]'}`}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#6b6b6b] text-sm">
              <Award className="w-4 h-4" strokeWidth={1.5} />
              <span>{followerCount} followers · {profile.followingCount ?? 0} following</span>
              <span className="text-[#d4d4d4]">·</span>
              <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex flex-col items-end gap-3 shrink-0">
              {/* Primary action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/messages/${profile.username}`)}
                  className="px-5 py-2 rounded-full text-sm border border-[#e5e5e5] text-[#6b6b6b] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors"
                >
                  Message
                </button>
                <button
                  onClick={toggleFollow}
                  disabled={loading}
                  className={`px-5 py-2 rounded-full text-sm transition-colors disabled:opacity-50 ${
                    isFollowing
                      ? 'border border-[#e5e5e5] text-[#6b6b6b] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#333]'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>

              {/* Block and Mute secondary actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleMute}
                  disabled={muteLoading}
                  className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-[#dc2626] transition-colors disabled:opacity-50"
                >
                  {isMuted ? (
                    <Volume2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={toggleBlock}
                  disabled={blockLoading}
                  className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-[#dc2626] transition-colors disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 px-6 py-6">
        {[
          { icon: Zap, color: '#2563eb', value: profile.postCount ?? 0, label: 'Signals' },
          { icon: TrendingUp, color: '#10b981', value: followerCount, label: 'Followers' },
          { icon: Award, color: '#f59e0b', value: profile.followingCount ?? 0, label: 'Following' },
        ].map(({ icon: Icon, color, value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
            className="bg-white rounded-2xl p-6 text-center"
          >
            <Icon className="w-6 h-6 mx-auto mb-2" style={{ color }} strokeWidth={1.5} />
            <p className="text-2xl text-[#1a1a1a] mb-1">{value}</p>
            <p className="text-[#9b9b9b] text-sm">{label}</p>
          </motion.div>
        ))}
      </div>
    </>
  )
}
