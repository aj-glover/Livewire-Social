'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { PostCard } from './PostCard'
import type { PostWithProfile } from '@/lib/supabase/types'

interface InfinitePostFeedProps {
  initialPosts: PostWithProfile[]
  filterParams: Record<string, string>
  currentUserId?: string
  userIsAdult: boolean
}

export function InfinitePostFeed({
  initialPosts,
  filterParams,
  currentUserId,
  userIsAdult,
}: InfinitePostFeedProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 30)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    const lastPost = posts[posts.length - 1]
    if (!lastPost) return

    loadingRef.current = true
    setLoading(true)

    const params = new URLSearchParams({ cursor: lastPost.created_at, limit: '30' })
    Object.entries(filterParams).forEach(([k, v]) => { if (v) params.set(k, v) })

    try {
      const res = await fetch(`/api/posts?${params}`)
      if (res.ok) {
        const { posts: newPosts } = await res.json()
        if (newPosts.length < 30) setHasMore(false)
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          return [...prev, ...newPosts.filter((p: PostWithProfile) => !existingIds.has(p.id))]
        })
      }
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [posts, hasMore, filterParams])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  // Reset when filters change
  useEffect(() => {
    setPosts(initialPosts)
    setHasMore(initialPosts.length >= 30)
  }, [initialPosts])

  return (
    <div className="divide-y divide-[#e5e5e5]">
      {posts.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          index={i}
          userIsAdult={userIsAdult}
        />
      ))}
      <div ref={sentinelRef} className="py-10 text-center">
        {loading && (
          <div className="flex justify-center">
            <div className="w-5 h-5 border-2 border-[#e5e5e5] border-t-[#2563eb] rounded-full animate-spin" />
          </div>
        )}
        {!loading && !hasMore && posts.length > 0 && (
          <p className="text-[#9b9b9b] text-sm">You&apos;ve seen it all.</p>
        )}
      </div>
    </div>
  )
}
