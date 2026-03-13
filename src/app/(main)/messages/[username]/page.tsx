import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConversationView } from '@/components/messages/ConversationView'

export const revalidate = 0

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: other } = await supabase
    .from('profiles')
    .select('id, username, public_key')
    .eq('username', username)
    .single()

  if (!other) notFound()

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('public_key')
    .eq('id', user.id)
    .single()

  return (
    <ConversationView
      currentUserId={user.id}
      currentUserPublicKey={currentProfile?.public_key ?? null}
      otherUsername={other.username}
      otherUserId={other.id}
      otherPublicKey={other.public_key ?? null}
    />
  )
}
