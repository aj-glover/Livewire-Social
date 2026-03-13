import { NextRequest, NextResponse } from 'next/server'
import { requireVerifiedUser } from '@/lib/auth'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: post_id } = await params

  const { user, supabase, error } = await requireVerifiedUser()
  if (error) return error

  const { error: insertError } = await supabase.from('likes').insert({ post_id, user_id: user!.id })

  if (insertError) {
    // Unique constraint violation = already liked
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 })
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 201 })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: post_id } = await params

  const { user, supabase, error } = await requireVerifiedUser()
  if (error) return error

  const { error: deleteError } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', post_id)
    .eq('user_id', user!.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
