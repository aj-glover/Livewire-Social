import { NextRequest, NextResponse } from 'next/server'
import { requireVerifiedUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await requireVerifiedUser()
  if (error) return error

  const body = await request.json()
  const { reason, postId, userId } = body

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
  }

  if (!postId && !userId) {
    return NextResponse.json({ error: 'Either postId or userId is required' }, { status: 400 })
  }

  const { error: insertError } = await supabase.from('reports').insert({
    reporter_id: user!.id,
    reported_post_id: postId ?? null,
    reported_user_id: userId ?? null,
    reason: reason.trim(),
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
