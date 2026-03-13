import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/feed/PostCard'
import { FeedFilter } from '@/components/feed/FeedFilter'
import { FeedTabs } from '@/components/feed/FeedTabs'
import { InfinitePostFeed } from '@/components/feed/InfinitePostFeed'
import { LandingHero } from '@/components/LandingHero'
import Link from 'next/link'
import { Suspense } from 'react'
import type { PostWithProfile } from '@/lib/supabase/types'

export const revalidate = 0

function getDateForAge(age: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - age)
  return d.toISOString().split('T')[0]
}

function getWindowCutoff(win: string): string {
  const now = new Date()
  switch (win) {
    case 'hour': now.setHours(now.getHours() - 1); break
    case 'month': now.setDate(now.getDate() - 30); break
    case 'year': now.setDate(now.getDate() - 365); break
    default: now.setHours(now.getHours() - 24); break
  }
  return now.toISOString()
}

const POST_SELECT = '*, profiles(id, username, avatar_url), likes(id, user_id), comments(id), bookmarks(user_id), repost_post:repost_of(id, content, image_url, created_at, profiles(id, username, avatar_url))'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const { ageRange, location, gender, politics, ethnicity } = params
  const tab = params.tab ?? 'latest'
  const win = params.window ?? 'day'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userIsAdult = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('date_of_birth')
      .eq('id', user.id)
      .single()
    if (profile?.date_of_birth) {
      const dob = new Date(profile.date_of_birth)
      const now = new Date()
      userIsAdult = now.getFullYear() - dob.getFullYear() >= 18
    }
  }

  // Fetch blocked and muted user IDs when logged in
  let excludedIds: string[] = []
  if (user) {
    const [{ data: blockedRows }, { data: mutedRows }] = await Promise.all([
      supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id),
      supabase.from('mutes').select('muted_id').eq('muter_id', user.id),
    ])
    excludedIds = [
      ...(blockedRows?.map((r) => r.blocked_id) ?? []),
      ...(mutedRows?.map((r) => r.muted_id) ?? []),
    ]
  }

  const hasFilter = ageRange || location || gender || politics || ethnicity
  let filteredUserIds: string[] | null = null

  if (hasFilter) {
    let profileQuery = supabase.from('profiles').select('id')
    if (gender) profileQuery = profileQuery.eq('gender', gender)
    if (location) profileQuery = profileQuery.ilike('location', `%${location}%`)
    if (politics) profileQuery = profileQuery.eq('political_lean', politics)
    if (ethnicity) profileQuery = profileQuery.eq('ethnicity', ethnicity)
    if (ageRange) {
      const parts = ageRange.split('-')
      const minAge = parseInt(parts[0])
      const maxAge = parseInt(parts[1])
      profileQuery = profileQuery.lte('date_of_birth', getDateForAge(minAge))
      if (maxAge < 999) profileQuery = profileQuery.gt('date_of_birth', getDateForAge(maxAge + 1))
    }
    const { data: matchingProfiles } = await profileQuery
    filteredUserIds = matchingProfiles?.map((p) => p.id) ?? []
  }

  let posts: PostWithProfile[] = []
  const noMatchingUsers = filteredUserIds !== null && filteredUserIds.length === 0

  // Following tab — special handling
  if (tab === 'following') {
    if (!user) {
      return (
        <div>
          <LandingHero />
          <Suspense><FeedFilter /></Suspense>
          <Suspense><FeedTabs /></Suspense>
          <div className="py-24 text-center">
            <p className="text-xl text-[#1a1a1a]">Sign in to see posts from people you follow.</p>
            <p className="mt-3 text-[#6b6b6b]">
              <Link href="/login" className="text-[#2563eb] hover:underline">Sign in</Link>
              {' '}or{' '}
              <Link href="/signup" className="text-[#2563eb] hover:underline">Join LiveWire</Link>.
            </p>
          </div>
        </div>
      )
    }

    const { data: followRows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = followRows?.map((r) => r.following_id) ?? []

    if (followingIds.length === 0) {
      return (
        <div>
          <Suspense><FeedFilter /></Suspense>
          <Suspense><FeedTabs /></Suspense>
          <div className="py-24 text-center">
            <p className="text-xl text-[#1a1a1a]">You&apos;re not following anyone yet.</p>
            <p className="mt-3 text-[#6b6b6b]">Discover people to follow.</p>
          </div>
        </div>
      )
    }

    let followingQuery = supabase
      .from('posts')
      .select(POST_SELECT)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(30)

    if (excludedIds.length > 0) {
      followingQuery = followingQuery.not('user_id', 'in', `(${excludedIds.join(',')})`)
    }

    const { data: followingPosts } = await followingQuery
    posts = (followingPosts ?? []) as PostWithProfile[]

    const filterParams = Object.fromEntries(
      Object.entries({ ageRange, location, gender, politics, ethnicity, tab: 'following' }).filter(([, v]) => !!v)
    ) as Record<string, string>

    if (excludedIds.length > 0) {
      filterParams.excludeIds = excludedIds.join(',')
    }

    return (
      <div>
        <Suspense><FeedFilter /></Suspense>
        <Suspense><FeedTabs /></Suspense>
        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-xl text-[#1a1a1a]">No signals from your network yet.</p>
            <p className="mt-3 text-[#6b6b6b] text-sm">The people you follow haven&apos;t posted recently.</p>
          </div>
        ) : (
          <InfinitePostFeed
            initialPosts={posts}
            filterParams={filterParams}
            currentUserId={user?.id}
            userIsAdult={userIsAdult}
          />
        )}
      </div>
    )
  }

  // Latest / Trending tabs
  if (!noMatchingUsers) {
    if (tab === 'trending') {
      let query = supabase.from('posts').select(POST_SELECT).gte('created_at', getWindowCutoff(win)).limit(100)
      if (filteredUserIds !== null) query = query.in('user_id', filteredUserIds)
      if (excludedIds.length > 0) query = query.not('user_id', 'in', `(${excludedIds.join(',')})`)
      const { data } = await query
      posts = ((data ?? []) as PostWithProfile[]).sort((a, b) => b.likes.length - a.likes.length).slice(0, 30)
    } else {
      let query = supabase.from('posts').select(POST_SELECT).order('created_at', { ascending: false }).limit(30)
      if (filteredUserIds !== null) query = query.in('user_id', filteredUserIds)
      if (excludedIds.length > 0) query = query.not('user_id', 'in', `(${excludedIds.join(',')})`)
      const { data } = await query
      posts = (data ?? []) as PostWithProfile[]
    }
  }

  const filterParams = Object.fromEntries(
    Object.entries({ ageRange, location, gender, politics, ethnicity }).filter(([, v]) => !!v)
  ) as Record<string, string>

  if (excludedIds.length > 0) {
    filterParams.excludeIds = excludedIds.join(',')
  }

  const emptyState = (
    <div className="py-24 text-center">
      {tab === 'trending' ? (
        <>
          <p className="text-xl text-[#1a1a1a]">Nothing trending yet.</p>
          <p className="mt-3 text-[#6b6b6b] text-sm">Try a longer time window.</p>
        </>
      ) : (
        <>
          <p className="text-xl text-[#1a1a1a]">The wire is quiet.</p>
          {user ? (
            <p className="mt-3 text-[#6b6b6b]">Be the first — <Link href="/create" className="text-[#2563eb] hover:underline">send a signal</Link>.</p>
          ) : (
            <p className="mt-3 text-[#6b6b6b]"><Link href="/signup" className="text-[#2563eb] hover:underline">Join LiveWire</Link> to start broadcasting.</p>
          )}
        </>
      )}
    </div>
  )

  return (
    <div>
      {!user && <LandingHero />}
      <Suspense><FeedFilter /></Suspense>
      <Suspense><FeedTabs /></Suspense>

      {noMatchingUsers ? (
        <div className="py-24 text-center">
          <p className="text-xl text-[#1a1a1a]">No signals match your filters.</p>
          <p className="mt-3 text-[#6b6b6b] text-sm">Try broadening your search.</p>
        </div>
      ) : posts.length === 0 ? emptyState : tab === 'trending' ? (
        // Trending: static list (already sorted by likes, no infinite scroll needed)
        <div className="divide-y divide-[#e5e5e5]">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} index={i} userIsAdult={userIsAdult} />
          ))}
        </div>
      ) : (
        // Latest: infinite scroll
        <InfinitePostFeed
          initialPosts={posts}
          filterParams={filterParams}
          currentUserId={user?.id}
          userIsAdult={userIsAdult}
        />
      )}
    </div>
  )
}
