import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAdminUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return null

  return { user, profile }
}

export async function GET() {
  const supabase = await createClient()
  const admin = await getAdminUser(supabase)

  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: verifications, error } = await supabase
    .from('verifications')
    .select('*, profiles(id, username, avatar_url)')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  if (error) {
    console.error('Admin verifications fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch verifications.' }, { status: 500 })
  }

  return NextResponse.json({ verifications })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const admin = await getAdminUser(supabase)

  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { id: string; action: 'approve' | 'reject'; reason?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { id, action, reason } = body

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  if (action === 'approve') {
    // Fetch verification to get user_id
    const { data: verification, error: fetchError } = await supabase
      .from('verifications')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !verification) {
      return NextResponse.json({ error: 'Verification not found.' }, { status: 404 })
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from('verifications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewer_id: admin.user.id,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Approve verification error:', updateError)
      return NextResponse.json({ error: 'Failed to approve verification.' }, { status: 500 })
    }

    // Update profile is_verified flag
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', verification.user_id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json({ error: 'Failed to update profile verification status.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, action: 'approved' })
  }

  // Reject
  if (!reason || reason.trim() === '') {
    return NextResponse.json({ error: 'A rejection reason is required.' }, { status: 400 })
  }

  const { error: rejectError } = await supabase
    .from('verifications')
    .update({
      status: 'rejected',
      rejection_reason: reason.trim(),
      reviewed_at: new Date().toISOString(),
      reviewer_id: admin.user.id,
    })
    .eq('id', id)

  if (rejectError) {
    console.error('Reject verification error:', rejectError)
    return NextResponse.json({ error: 'Failed to reject verification.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, action: 'rejected' })
}
