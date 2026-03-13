import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Email must be confirmed
  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { error: 'You must verify your email address before submitting identity verification.' },
      { status: 403 }
    )
  }

  // Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const full_name = formData.get('full_name') as string | null
  const date_of_birth = formData.get('date_of_birth') as string | null
  const location = formData.get('location') as string | null
  const id_type = formData.get('id_type') as string | null
  const id_document = formData.get('id_document') as File | null

  if (!full_name || !date_of_birth || !location || !id_type || !id_document) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const allowedTypes = ['passport', 'drivers_license', 'national_id', 'state_id']
  if (!allowedTypes.includes(id_type)) {
    return NextResponse.json({ error: 'Invalid ID type.' }, { status: 400 })
  }

  // Check for existing non-rejected verification
  const { data: existing } = await supabase
    .from('verifications')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (existing && (existing.status === 'pending' || existing.status === 'approved')) {
    const message =
      existing.status === 'pending'
        ? 'Your verification is already pending review.'
        : 'Your account is already verified.'
    return NextResponse.json({ error: message }, { status: 409 })
  }

  // Determine file extension
  const originalName = id_document.name ?? 'document'
  const ext = originalName.includes('.') ? originalName.split('.').pop() ?? 'bin' : 'bin'
  const storagePath = `${user.id}/${Date.now()}.${ext}`

  // Convert file to buffer
  const arrayBuffer = await id_document.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload to private storage bucket using service role
  const { error: uploadError } = await adminSupabase.storage
    .from('id-documents')
    .upload(storagePath, buffer, {
      contentType: id_document.type,
      upsert: true,
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload document. Please try again.' }, { status: 500 })
  }

  // Insert verification record using user's client (RLS: verif_insert allows it)
  const { data: verification, error: insertError } = await supabase
    .from('verifications')
    .insert({
      user_id: user.id,
      full_name,
      date_of_birth,
      location,
      id_type,
      id_document_path: storagePath,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Verification insert error:', insertError)
    return NextResponse.json({ error: 'Failed to submit verification. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ verification: { status: 'pending', id: verification.id } }, { status: 201 })
}
