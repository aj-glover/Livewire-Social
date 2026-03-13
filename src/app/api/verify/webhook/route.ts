import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Didit status → our internal status
function mapStatus(diditStatus: string): string {
  switch (diditStatus) {
    case 'Approved': return 'approved'
    case 'Declined': return 'declined'
    case 'In Review': return 'in_review'
    case 'Expired': return 'expired'
    case 'Abandoned': return 'abandoned'
    default: return 'pending'
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // Verify webhook signature if secret is configured
  const webhookSecret = process.env.DIDIT_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = request.headers.get('x-signature-simple')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const expected = createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (signature !== expected) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let payload: {
    session_id: string
    status: string
    vendor_data: string
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { session_id, status: diditStatus, vendor_data: userId } = payload

  if (!session_id || !diditStatus || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const status = mapStatus(diditStatus)

  // Update verification record
  const { error: updateError } = await adminSupabase
    .from('verifications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      rejection_reason: diditStatus === 'Declined' ? 'Declined by automated review' : null,
    })
    .eq('didit_session_id', session_id)

  if (updateError) {
    console.error('Webhook verification update error:', updateError)
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }

  // If approved, mark profile as verified
  if (status === 'approved') {
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile verification update error:', profileError)
    }
  }

  return NextResponse.json({ ok: true })
}
