import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminVerificationList } from '@/components/admin/AdminVerificationList'
import type { Verification } from '@/lib/supabase/types'

export const revalidate = 0

type VerificationWithProfile = Verification & {
  profiles: {
    id: string
    username: string
    avatar_url: string | null
  } | null
}

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  const { data: verifications } = await supabase
    .from('verifications')
    .select('*, profiles(id, username, avatar_url)')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  const items = (verifications ?? []) as VerificationWithProfile[]

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl text-[#1a1a1a]">Verification review</h1>
        <p className="mt-1 text-[#6b6b6b] text-sm">
          {items.length === 0
            ? 'No pending verifications.'
            : `${items.length} pending verification${items.length === 1 ? '' : 's'} to review.`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-10 text-center">
          <p className="text-[#6b6b6b] text-sm">All caught up — no pending verifications.</p>
        </div>
      ) : (
        <AdminVerificationList initialVerifications={items} />
      )}
    </div>
  )
}
