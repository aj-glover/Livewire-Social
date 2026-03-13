import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/feed/PostCard'
import type { PostWithProfile } from '@/lib/supabase/types'

export const revalidate = 0

function getDateForAge(age: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - age)
  return d.toISOString().split('T')[0]
}

export default async function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params

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
      const cutoff = getDateForAge(18)
      userIsAdult = profile.date_of_birth <= cutoff
    }
  }

  const { data } = await supabase
    .from('posts')
    .select('*, profiles(id, username, avatar_url), likes(id, user_id), comments(id), bookmarks(user_id), repost_post:repost_of(id, content, image_url, created_at, profiles(id, username, avatar_url))')
    .ilike('content', `%#${tag}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  const posts = (data ?? []) as PostWithProfile[]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-6 py-8 border-b border-[#e5e5e5]">
        <h1 className="text-2xl text-[#1a1a1a]">#{tag}</h1>
        <p className="mt-1 text-[#6b6b6b] text-sm">{posts.length} signal{posts.length !== 1 ? 's' : ''}</p>
      </div>

      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-xl text-[#1a1a1a]">No signals tagged #{tag} yet.</p>
          <p className="mt-3 text-[#6b6b6b] text-sm">Be the first to use this hashtag.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#e5e5e5]">
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              index={i}
              userIsAdult={userIsAdult}
            />
          ))}
        </div>
      )}
    </div>
  )
}
