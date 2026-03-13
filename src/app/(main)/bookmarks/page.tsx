import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PostCard } from '@/components/feed/PostCard'
import type { PostWithProfile } from '@/lib/supabase/types'

export const revalidate = 0

function getDateForAge(age: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - age)
  return d.toISOString().split('T')[0]
}

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let userIsAdult = false
  const { data: profile } = await supabase
    .from('profiles')
    .select('date_of_birth')
    .eq('id', user.id)
    .single()

  if (profile?.date_of_birth) {
    const cutoff = getDateForAge(18)
    userIsAdult = profile.date_of_birth <= cutoff
  }

  const { data: bookmarkRows } = await supabase
    .from('bookmarks')
    .select('post_id, created_at, posts(*, profiles(id, username, avatar_url), likes(id, user_id), comments(id), bookmarks(user_id))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const posts: PostWithProfile[] = (bookmarkRows ?? [])
    .map((row) => row.posts as unknown as PostWithProfile)
    .filter(Boolean)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-6 py-8 border-b border-[#e5e5e5]">
        <h1 className="text-2xl text-[#1a1a1a]">Saved signals</h1>
        <p className="mt-1 text-[#6b6b6b] text-sm">Signals you&apos;ve bookmarked.</p>
      </div>

      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-xl text-[#1a1a1a]">No saved signals yet.</p>
          <p className="mt-3 text-[#6b6b6b] text-sm">Bookmark signals to find them here.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#e5e5e5]">
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user.id}
              index={i}
              userIsAdult={userIsAdult}
            />
          ))}
        </div>
      )}
    </div>
  )
}
