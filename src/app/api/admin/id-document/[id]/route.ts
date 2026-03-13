import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  // Fetch verification to get document path
  const { data: verification, error: fetchError } = await supabase
    .from('verifications')
    .select('id_document_path')
    .eq('id', id)
    .single()

  if (fetchError || !verification) {
    return NextResponse.json({ error: 'Verification not found.' }, { status: 404 })
  }

  // Download file using service role (private bucket)
  const { data: fileData, error: downloadError } = await adminSupabase.storage
    .from('id-documents')
    .download(verification.id_document_path)

  if (downloadError || !fileData) {
    console.error('Storage download error:', downloadError)
    return NextResponse.json({ error: 'Failed to retrieve document.' }, { status: 500 })
  }

  // Determine content type from path extension
  const ext = verification.id_document_path.split('.').pop()?.toLowerCase() ?? ''
  const contentTypeMap: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  }
  const contentType = contentTypeMap[ext] ?? 'application/octet-stream'

  const arrayBuffer = await fileData.arrayBuffer()

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="id-document.${ext}"`,
      'Cache-Control': 'no-store',
    },
  })
}
