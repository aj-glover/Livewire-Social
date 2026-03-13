import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { DiditVerifyButton } from '@/components/verify/DiditVerifyButton'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import Link from 'next/link'

export const revalidate = 0

export default async function VerifyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verified')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const { data: verification } = await supabase
    .from('verifications')
    .select('status, rejection_reason')
    .eq('user_id', user.id)
    .single()

  const canRestart =
    !verification ||
    verification.status === 'declined' ||
    verification.status === 'expired' ||
    verification.status === 'abandoned'

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl text-[#1a1a1a]">Verify your identity</h1>
        <p className="mt-1 text-[#6b6b6b] text-sm">
          Complete a quick identity check to get a verified badge on your profile.
          We use Didit&apos;s secure verification service — your documents are never stored on our servers.
        </p>
      </div>

      {profile.is_verified ? (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#dcfce7] shrink-0">
            <CheckCircle className="w-5 h-5 text-[#16a34a]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-[#1a1a1a] font-medium">You&apos;re verified</p>
              <VerifiedBadge size="md" />
            </div>
            <p className="text-sm text-[#6b6b6b] mt-0.5">
              Your identity has been confirmed. A verified badge appears on your profile.
            </p>
          </div>
        </div>
      ) : verification?.status === 'pending' || verification?.status === 'in_review' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 shrink-0">
            <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[#1a1a1a] font-medium">Verification in progress</p>
            <p className="text-sm text-[#6b6b6b] mt-0.5">
              {verification.status === 'in_review'
                ? 'Your verification is under review. We\'ll update your profile once complete.'
                : 'Your verification is being processed. This usually takes just a few minutes.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 space-y-6">
          {(verification?.status === 'declined' || verification?.status === 'expired' || verification?.status === 'abandoned') && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-[#dc2626] shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-[#1a1a1a]">
                  {verification.status === 'declined'
                    ? 'Verification declined'
                    : verification.status === 'expired'
                    ? 'Verification expired'
                    : 'Verification not completed'}
                </p>
                {verification.rejection_reason && (
                  <p className="text-sm text-[#6b6b6b] mt-0.5">
                    {verification.rejection_reason}
                  </p>
                )}
                <p className="text-sm text-[#6b6b6b] mt-1">
                  Please try again below.
                </p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-base text-[#1a1a1a] mb-1">What you&apos;ll need</h2>
            <ul className="text-sm text-[#6b6b6b] space-y-1 list-disc list-inside">
              <li>A government-issued ID (passport, driver&apos;s license, or national ID)</li>
              <li>A device with a camera for a quick selfie</li>
              <li>Good lighting and a few minutes of your time</li>
            </ul>
          </div>

          {canRestart && (
            <div className="pt-2">
              <DiditVerifyButton />
              <p className="text-xs text-[#9b9b9b] mt-3">
                Powered by{' '}
                <span className="text-[#6b6b6b]">Didit</span>
                {' '}— your documents are processed securely and never shared with third parties.
              </p>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-[#9b9b9b] text-center">
        Need help?{' '}
        <Link href="/settings" className="text-[#2563eb] hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  )
}
