'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Zap, MessageCircle, Bookmark, Repeat2, MoreHorizontal, Trash2, Flag } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PostWithProfile } from '@/lib/supabase/types'
import { Avatar } from '@/components/Avatar'
import { PostContent } from '@/components/feed/PostContent'
import { VideoEmbed } from '@/components/feed/VideoEmbed'

interface PostCardProps {
  post: PostWithProfile
  currentUserId?: string
  index?: number
  userIsAdult?: boolean
}

const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Hate speech',
  'Misinformation',
  'Adult content',
  'Other',
]

export function PostCard({ post, currentUserId, index = 0, userIsAdult }: PostCardProps) {
  const profile = post.profiles
  const [isDeleted, setIsDeleted] = useState(false)
  const [likes, setLikes] = useState(post.likes)
  const [isBookmarked, setIsBookmarked] = useState(
    currentUserId ? (post.bookmarks?.some((b) => b.user_id === currentUserId) ?? false) : false
  )
  const [showRepostMenu, setShowRepostMenu] = useState(false)
  const [showQuoteInput, setShowQuoteInput] = useState(false)
  const [quoteText, setQuoteText] = useState('')
  const [quoteSubmitting, setQuoteSubmitting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0])
  const [reportSubmitting, setReportSubmitting] = useState(false)

  const repostMenuRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const isLiked = currentUserId ? likes.some((l) => l.user_id === currentUserId) : false
  const isOwnPost = currentUserId === post.user_id

  // Close repost menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (repostMenuRef.current && !repostMenuRef.current.contains(e.target as Node)) {
        setShowRepostMenu(false)
      }
    }
    if (showRepostMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showRepostMenu])

  // Close more menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  async function handleDelete() {
    setShowMenu(false)
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    if (res.ok || res.status === 204) {
      setIsDeleted(true)
      toast.success('Signal deleted.')
    } else {
      toast.error('Could not delete.')
    }
  }

  async function handleReportSubmit() {
    setReportSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, postId: post.id }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        toast.error(json.error ?? 'Could not submit report.')
        return
      }
      toast.success('Report submitted.')
      setShowReportForm(false)
      setReportReason(REPORT_REASONS[0])
    } finally {
      setReportSubmitting(false)
    }
  }

  async function toggleLike() {
    if (!currentUserId) {
      toast.error('Sign in to signal this post.')
      return
    }

    const method = isLiked ? 'DELETE' : 'POST'
    const res = await fetch(`/api/posts/${post.id}/like`, { method })

    if (!res.ok && res.status !== 409) {
      toast.error('Something went wrong.')
      return
    }

    if (isLiked) {
      setLikes((prev) => prev.filter((l) => l.user_id !== currentUserId))
    } else {
      setLikes((prev) => [...prev, { id: 'optimistic', user_id: currentUserId }])
    }
  }

  async function toggleBookmark() {
    if (!currentUserId) {
      toast.error('Sign in to bookmark posts.')
      return
    }

    const method = isBookmarked ? 'DELETE' : 'POST'
    const res = await fetch(`/api/posts/${post.id}/bookmark`, { method })

    if (!res.ok) {
      toast.error('Something went wrong.')
      return
    }

    setIsBookmarked((prev) => !prev)
    if (!isBookmarked) {
      toast.success('Signal saved.')
    }
  }

  async function handleRepost() {
    if (!currentUserId) {
      toast.error('Sign in to repost.')
      return
    }
    setShowRepostMenu(false)
    const res = await fetch(`/api/posts/${post.id}/repost`, { method: 'POST' })
    if (res.status === 409) {
      toast.error('Already reposted.')
      return
    }
    if (!res.ok) {
      toast.error('Repost failed.')
      return
    }
    toast.success('Reposted')
  }

  async function handleQuoteSubmit() {
    if (!currentUserId) {
      toast.error('Sign in to quote.')
      return
    }
    if (!quoteText.trim()) return

    setQuoteSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: quoteText.trim(), repost_of: post.id }),
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? 'Failed to post quote.')
        return
      }

      toast.success('Quote posted')
      setQuoteText('')
      setShowQuoteInput(false)
    } finally {
      setQuoteSubmitting(false)
    }
  }

  if (isDeleted) return null

  if (post.is_adult_content && !userIsAdult) {
    return (
      <div className="px-6 py-8 bg-white border-b border-[#e5e5e5]">
        <div className="rounded-2xl border border-[#e5e5e5] p-6 text-center space-y-2">
          <p className="text-[#dc2626] text-sm font-medium">18+ Content</p>
          <p className="text-[#9b9b9b] text-sm">This signal is restricted to verified adults.</p>
        </div>
      </div>
    )
  }

  const isQuotePost = !post.is_repost && post.repost_of && post.repost_post

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group px-6 py-8 bg-white hover:bg-[#f9f9f9] transition-colors"
    >
      {/* Repost indicator */}
      {post.is_repost && (
        <div className="flex items-center gap-2 mb-3 text-[#6b6b6b] text-sm">
          <Repeat2 className="w-4 h-4" strokeWidth={1.5} />
          <span>{profile.username} reposted</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href={`/profile/${profile.username}`} className="flex items-center gap-3">
          <Avatar username={profile.username} avatarUrl={profile.avatar_url} size="md" />
          <div>
            <p className="text-[#1a1a1a] hover:underline">{profile.username}</p>
            <p className="text-[#9b9b9b] text-sm">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {/* Header right: originality badge + more menu */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-[#f0f9ff] border border-[#bfdbfe]">
            <span className="text-[#2563eb] text-sm">original</span>
          </div>

          {/* More menu — only show when user is logged in */}
          {currentUserId && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="p-1.5 rounded-full text-[#9b9b9b] hover:text-[#1a1a1a] hover:bg-[#f0f0f0] transition-colors opacity-0 group-hover:opacity-100"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
              </button>

              {showMenu && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-[#e5e5e5] rounded-2xl shadow-lg overflow-hidden z-20">
                  {isOwnPost ? (
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-3 text-sm text-[#dc2626] hover:bg-[#fff5f5] transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        setShowReportForm(true)
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors flex items-center gap-2"
                    >
                      <Flag className="w-4 h-4" strokeWidth={1.5} />
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content — only shown when it's not a pure repost (no content) */}
      {post.content && (
        <PostContent
          content={post.content}
          className="text-[#1a1a1a] leading-relaxed mb-6 text-lg"
        />
      )}

      {/* Video embed (YouTube / Vimeo) */}
      {post.content && <VideoEmbed content={post.content} />}

      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image_url}
          alt="Signal image"
          className="mb-6 max-h-96 w-full rounded-2xl object-cover"
        />
      )}

      {/* Quoted / reposted post preview */}
      {(post.is_repost || isQuotePost) && post.repost_post && (
        <Link
          href={`/post/${post.repost_post.id}`}
          className="block border border-[#e5e5e5] rounded-2xl p-4 mt-2 mb-6 hover:bg-[#f5f5f5] transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Avatar
              username={post.repost_post.profiles.username}
              avatarUrl={post.repost_post.profiles.avatar_url}
              size="sm"
            />
            <span className="text-sm text-[#1a1a1a]">@{post.repost_post.profiles.username}</span>
            <span className="text-xs text-[#9b9b9b]">
              · {formatDistanceToNow(new Date(post.repost_post.created_at), { addSuffix: true })}
            </span>
          </div>
          {post.repost_post.content && (
            <p className="text-[#1a1a1a] text-sm leading-relaxed line-clamp-3">
              {post.repost_post.content.slice(0, 200)}
              {post.repost_post.content.length > 200 ? '…' : ''}
            </p>
          )}
          {post.repost_post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.repost_post.image_url}
              alt="Quoted image"
              className="mt-3 max-h-48 w-full rounded-xl object-cover"
            />
          )}
        </Link>
      )}

      {/* Fallback for repost with missing original */}
      {post.is_repost && !post.repost_post && post.repost_of && (
        <div className="border border-[#e5e5e5] rounded-2xl p-4 mt-2 mb-6 text-[#9b9b9b] text-sm">
          ↺ Original signal unavailable
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? 'text-[#2563eb]' : 'text-[#9b9b9b] hover:text-[#2563eb]'
            }`}
          >
            <Zap className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm">{likes.length}</span>
          </button>

          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-2 text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors"
          >
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm">{post.comments.length}</span>
          </Link>

          {/* Repost button with dropdown */}
          <div className="relative" ref={repostMenuRef}>
            <button
              onClick={() => {
                if (!currentUserId) {
                  toast.error('Sign in to repost.')
                  return
                }
                setShowRepostMenu((prev) => !prev)
              }}
              className="flex items-center gap-2 text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors"
            >
              <Repeat2 className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {showRepostMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-36 bg-white border border-[#e5e5e5] rounded-2xl shadow-lg overflow-hidden z-10">
                <button
                  onClick={handleRepost}
                  className="w-full text-left px-4 py-3 text-sm text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors flex items-center gap-2"
                >
                  <Repeat2 className="w-4 h-4" strokeWidth={1.5} />
                  Repost
                </button>
                <button
                  onClick={() => {
                    setShowRepostMenu(false)
                    setShowQuoteInput(true)
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors border-t border-[#e5e5e5]"
                >
                  Quote
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bookmark button — right side */}
        <button
          onClick={toggleBookmark}
          className={`flex items-center gap-2 transition-colors ${
            isBookmarked ? 'text-[#2563eb]' : 'text-[#9b9b9b] hover:text-[#2563eb]'
          }`}
        >
          <Bookmark
            className="w-5 h-5"
            strokeWidth={1.5}
            fill={isBookmarked ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Quote input */}
      {showQuoteInput && (
        <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
          <textarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="Add your take..."
            rows={3}
            className="w-full rounded-2xl border border-[#e5e5e5] px-4 py-3 text-[#1a1a1a] text-sm placeholder-[#9b9b9b] focus:outline-none focus:border-[#2563eb] resize-none"
          />
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              onClick={() => {
                setShowQuoteInput(false)
                setQuoteText('')
              }}
              className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleQuoteSubmit}
              disabled={!quoteText.trim() || quoteSubmitting}
              className="bg-[#1a1a1a] text-white text-sm px-5 py-2 rounded-full hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {quoteSubmitting ? 'Posting…' : 'Quote'}
            </button>
          </div>
        </div>
      )}

      {/* Report form */}
      {showReportForm && (
        <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
          <p className="text-sm text-[#1a1a1a] mb-3 font-medium">Report this signal</p>
          <div className="flex flex-col gap-2 mb-3">
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`report-reason-${post.id}`}
                  value={reason}
                  checked={reportReason === reason}
                  onChange={() => setReportReason(reason)}
                  className="accent-[#2563eb]"
                />
                <span className="text-sm text-[#1a1a1a]">{reason}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setShowReportForm(false)
                setReportReason(REPORT_REASONS[0])
              }}
              className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReportSubmit}
              disabled={reportSubmitting}
              className="bg-[#dc2626] text-white text-sm px-5 py-2 rounded-full hover:bg-[#b91c1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportSubmitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </div>
      )}
    </motion.article>
  )
}
