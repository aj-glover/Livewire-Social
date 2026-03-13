import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { AvatarUploadWrapper } from '@/components/profile/AvatarUploadWrapper'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const revalidate = 0

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl text-[#1a1a1a]">Edit profile</h1>
        <p className="mt-1 text-[#6b6b6b] text-sm">Update your public profile information.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#e5e5e5]">
          <AvatarUploadWrapper
            userId={profile.id}
            initialAvatarUrl={profile.avatar_url}
            username={profile.username}
          />
          <div>
            <p className="text-[#1a1a1a]">@{profile.username}</p>
            <p className="text-sm text-[#6b6b6b]">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <EditProfileForm profile={profile} />

        {/* Verification status */}
        <div className="mt-8 pt-6 border-t border-[#e5e5e5] flex items-center justify-between">
          <div>
            <p className="text-sm text-[#1a1a1a]">Identity verification</p>
            {profile.is_verified ? (
              <p className="text-xs text-[#16a34a] mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Identity verified
              </p>
            ) : (
              <p className="text-xs text-[#6b6b6b] mt-0.5">Not yet verified</p>
            )}
          </div>
          {!profile.is_verified && (
            <Link
              href="/verify"
              className="text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
            >
              Verify your identity →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
