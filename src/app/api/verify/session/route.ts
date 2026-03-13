import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getDiditToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.DIDIT_CLIENT_ID}:${process.env.DIDIT_API_KEY}`
  ).toString('base64')

  const res = await fetch('https://apx.didit.me/auth/v2/token/', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Didit auth error:', text)
    throw new Error('Failed to authenticate with Didit')
  }

  const data = await res.json()
  return data.access_token as string
}

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { error: 'Please verify your email before starting identity verification.' },
      { status: 403 }
    )
  }

  // Check if user already has an approved/pending verification
  const { data: existing } = await supabase
    .from('verifications')
    .select('id, status, didit_session_id')
    .eq('user_id', user.id)
    .single()

  if (existing?.status === 'approved') {
    return NextResponse.json({ error: 'Your account is already verified.' }, { status: 409 })
  }

  if (existing?.status === 'pending' || existing?.status === 'in_review') {
    return NextResponse.json(
      { error: 'A verification is already in progress.' },
      { status: 409 }
    )
  }

  // Get Didit access token
  let token: string
  try {
    token = await getDiditToken()
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Could not connect to identity verification service.' },
      { status: 502 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Create Didit verification session
  const sessionRes = await fetch('https://verification.didit.me/v3/session/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: process.env.DIDIT_WORKFLOW_ID,
      callback: `${appUrl}/verify`,
      vendor_data: user.id,
    }),
  })

  if (!sessionRes.ok) {
    const text = await sessionRes.text()
    console.error('Didit session creation error:', text)
    return NextResponse.json(
      { error: 'Failed to create verification session.' },
      { status: 502 }
    )
  }

  const session = await sessionRes.json()

  // Upsert verification record (replace declined/expired/abandoned)
  if (existing) {
    await adminSupabase
      .from('verifications')
      .update({
        didit_session_id: session.session_id,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        rejection_reason: null,
      })
      .eq('id', existing.id)
  } else {
    await adminSupabase.from('verifications').insert({
      user_id: user.id,
      didit_session_id: session.session_id,
      status: 'pending',
    })
  }

  return NextResponse.json({ verification_url: session.verification_url })
}
