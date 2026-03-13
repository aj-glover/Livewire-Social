import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search/SearchBar'
import { PostCard } from '@/components/feed/PostCard'
import Link from 'next/link'
import { Suspense } from 'react'
import type { PostWithProfile } from '@/lib/supabase/types'

export const revalidate = 0

function getDateForAge(age: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - age)
  return d.toISOString().split('T')[0]
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
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

  let users: { id: string; username: string; avatar_url: string | null; bio: string | null }[] = []
  let posts: PostWithProfile[] = []

  if (q && q.trim()) {
    const [usersResult, postsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .ilike('username', `%${q}%`)
        .limit(10),
      supabase
        .from('posts')
        .select('*, profiles(id, username, avatar_url), likes(id, user_id), comments(id)')
        .ilike('content', `%${q}%`)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    users = usersResult.data ?? []
    posts = (postsResult.data ?? []) as PostWithProfile[]
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-6 py-6 border-b border-[#e5e5e5]">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {q && q.trim() ? (
        <div>
          {/* People section */}
          {users.length > 0 && (
            <section className="border-b border-[#e5e5e5]">
              <div className="px-6 py-4">
                <h2 className="text-sm text-[#6b6b6b] uppercase tracking-wider">
                  People
                  <span className="ml-2 text-[#9b9b9b]">({users.length})</span>
                </h2>
              </div>
              <div className="divide-y divide-[#e5e5e5]">
                {users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-4 px-6 py-4 bg-white hover:bg-[#f9f9f9] transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center shrink-0">
                      <span className="text-white">{u.username[0].toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#1a1a1a] hover:underline">@{u.username}</p>
                      {u.bio && (
                        <p className="text-sm text-[#6b6b6b] truncate mt-0.5">{u.bio}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts section */}
          {posts.length > 0 && (
            <section>
              <div className="px-6 py-4 border-b border-[#e5e5e5]">
                <h2 className="text-sm text-[#6b6b6b] uppercase tracking-wider">
                  Posts
                  <span className="ml-2 text-[#9b9b9b]">({posts.length})</span>
                </h2>
              </div>
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
            </section>
          )}

          {users.length === 0 && posts.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-xl text-[#1a1a1a]">No results for &ldquo;{q}&rdquo;</p>
              <p className="mt-3 text-[#6b6b6b] text-sm">Try a different search term.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-[#6b6b6b]">Search for people or wires on LiveWire.</p>
        </div>
      )}
    </div>
  )
}
