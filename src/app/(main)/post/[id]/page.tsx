import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/feed/PostCard'
import { CommentSection } from '@/components/post/CommentSection'
import type { PostWithProfile } from '@/lib/supabase/types'

export const revalidate = 0

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const { data: post } = await supabase
    .from('posts')
    .select(
      '*, profiles(id, username, avatar_url), likes(id, user_id), comments(id)'
    )
    .eq('id', id)
    .single()

  if (!post) notFound()

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(id, username, avatar_url)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="divide-y divide-[#e5e5e5]">
      <PostCard post={post as PostWithProfile} currentUserId={user?.id} userIsAdult={userIsAdult} />
      <CommentSection
        postId={id}
        initialComments={comments ?? []}
        currentUserId={user?.id}
      />
    </div>
  )
}
