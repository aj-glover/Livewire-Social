import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { PostCard } from '@/components/feed/PostCard'
import type { PostWithProfile, Profile } from '@/lib/supabase/types'

export const revalidate = 0

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  let userIsAdult = false
  if (currentUser) {
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('date_of_birth')
      .eq('id', currentUser.id)
      .single()
    if (currentUserProfile?.date_of_birth) {
      const dob = new Date(currentUserProfile.date_of_birth)
      const now = new Date()
      userIsAdult = now.getFullYear() - dob.getFullYear() >= 18
    }
  }

  // Fetch profile — cast explicitly to work around TS narrowing after notFound()
  const profileRes = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profileRes.data) notFound()

  const profile = profileRes.data as Profile

  const [
    { count: postCount },
    { count: followerCount },
    { count: followingCount },
    { data: posts },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
    supabase
      .from('posts')
      .select('*, profiles(id, username, avatar_url), likes(id, user_id), comments(id), bookmarks(user_id), repost_post:repost_of(id, content, image_url, created_at, profiles(id, username, avatar_url))')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
  ])

  // Check if current user is following, blocking, or muting this profile
  let isFollowing = false
  let isBlocked = false
  let isMuted = false

  if (currentUser && currentUser.id !== profile.id) {
    const [{ data: followRow }, { data: blockRow }, { data: muteRow }] = await Promise.all([
      supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)
        .single(),
      supabase
        .from('blocks')
        .select('blocker_id')
        .eq('blocker_id', currentUser.id)
        .eq('blocked_id', profile.id)
        .single(),
      supabase
        .from('mutes')
        .select('muter_id')
        .eq('muter_id', currentUser.id)
        .eq('muted_id', profile.id)
        .single(),
    ])
    isFollowing = !!followRow
    isBlocked = !!blockRow
    isMuted = !!muteRow
  }

  const enrichedProfile = {
    ...profile,
    postCount: postCount ?? 0,
    followerCount: followerCount ?? 0,
    followingCount: followingCount ?? 0,
  }

  return (
    <div>
      <ProfileHeader
        profile={enrichedProfile}
        isOwnProfile={currentUser?.id === profile.id}
        initialIsFollowing={isFollowing}
        initialIsBlocked={isBlocked}
        initialIsMuted={isMuted}
      />

      <div className="px-6 py-4">
        <h3 className="text-[#6b6b6b] text-sm">Recent Signals</h3>
      </div>

      {!posts || posts.length === 0 ? (
        <p className="py-8 text-center text-[#9b9b9b] text-sm">No signals yet.</p>
      ) : (
        <div className="divide-y divide-[#e5e5e5]">
          {(posts as PostWithProfile[]).map((post, i) => (
            <PostCard key={post.id} post={post} currentUserId={currentUser?.id} index={i} userIsAdult={userIsAdult} />
          ))}
        </div>
      )}
    </div>
  )
}
