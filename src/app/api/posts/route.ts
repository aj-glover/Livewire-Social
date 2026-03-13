import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkOriginality } from '@/lib/originality'
import { requireVerifiedUser } from '@/lib/auth'

// GET /api/posts?cursor=<created_at>&limit=20&gender=X&location=X&politics=X&ethnicity=X&ageRange=X&tab=X&excludeIds=X
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 50)
  const tab = searchParams.get('tab')

  const gender = searchParams.get('gender')
  const location = searchParams.get('location')
  const politics = searchParams.get('politics')
  const ethnicity = searchParams.get('ethnicity')
  const ageRange = searchParams.get('ageRange')

  const excludeIdsParam = searchParams.get('excludeIds')
  const excludeIds = excludeIdsParam ? excludeIdsParam.split(',').filter(Boolean) : []

  // Handle following tab
  if (tab === 'following') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: followRows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = followRows?.map((r) => r.following_id) ?? []
    if (followingIds.length === 0) {
      return NextResponse.json({ posts: [] })
    }

    let query = supabase
      .from('posts')
      .select('*, profiles(id, username, avatar_url), likes(id, user_id), comments(id), bookmarks(user_id), repost_post:repost_of(id, content, image_url, created_at, profiles(id, username, avatar_url))')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (cursor) query = query.lt('created_at', cursor)
    if (excludeIds.length > 0) query = query.not('user_id', 'in', `(${excludeIds.join(',')})`)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ posts: data })
  }

  // Build filtered user IDs from profile attributes
  const hasFilter = gender || location || politics || ethnicity || ageRange
  let filteredUserIds: string[] | null = null

  if (hasFilter) {
    let profileQuery = supabase.from('profiles').select('id')
    if (gender) profileQuery = profileQuery.eq('gender', gender)
    if (location) profileQuery = profileQuery.ilike('location', `%${location}%`)
    if (politics) profileQuery = profileQuery.eq('political_lean', politics)
    if (ethnicity) profileQuery = profileQuery.eq('ethnicity', ethnicity)
    if (ageRange) {
      const parts = ageRange.split('-')
      const minAge = parseInt(parts[0])
      const maxAge = parseInt(parts[1])
      const now = new Date()
      const maxDate = new Date(now); maxDate.setFullYear(now.getFullYear() - minAge)
      profileQuery = profileQuery.lte('date_of_birth', maxDate.toISOString().split('T')[0])
      if (maxAge < 999) {
        const minDate = new Date(now); minDate.setFullYear(now.getFullYear() - (maxAge + 1))
        profileQuery = profileQuery.gt('date_of_birth', minDate.toISOString().split('T')[0])
      }
    }
    const { data: matchingProfiles } = await profileQuery
    filteredUserIds = matchingProfiles?.map((p) => p.id) ?? []
    if (filteredUserIds.length === 0) return NextResponse.json({ posts: [] })
  }

  let query = supabase
    .from('posts')
    .select('*, profiles(id, username, avatar_url), likes(id, user_id), comments(id), bookmarks(user_id), repost_post:repost_of(id, content, image_url, created_at, profiles(id, username, avatar_url))')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) query = query.lt('created_at', cursor)
  if (filteredUserIds !== null) query = query.in('user_id', filteredUserIds)
  if (excludeIds.length > 0) query = query.not('user_id', 'in', `(${excludeIds.join(',')})`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ posts: data })
}

// POST /api/posts — create a new post (requires verified auth)
export async function POST(request: NextRequest) {
  const { user, supabase, error } = await requireVerifiedUser()
  if (error) return error

  const body = await request.json()
  const { content, image_url, is_adult_content, repost_of, is_repost } = body

  // For reposts, content can be empty
  if (is_repost !== true) {
    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Content must be 2000 characters or fewer' }, { status: 400 })
    }

    // Originality check (skip for quote posts that are very short or reposts)
    const result = await checkOriginality(content)

    if (!result.isOriginal) {
      return NextResponse.json(
        {
          error: 'This content is too similar to an existing post.',
          duplicatePostId: result.duplicatePostId,
          duplicateAuthor: result.duplicateAuthor,
          similarityScore: result.similarityScore,
        },
        { status: 409 }
      )
    }
  }

  const insertContent = is_repost === true ? '' : (content ?? '').trim()

  const { data: post, error: insertError } = await supabase
    .from('posts')
    .insert({
      user_id: user!.id,
      content: insertContent,
      image_url: image_url ?? null,
      is_adult_content: is_adult_content === true,
      repost_of: repost_of ?? null,
      is_repost: is_repost === true,
    })
    .select('*, profiles(id, username, avatar_url), likes(id, user_id), comments(id), bookmarks(user_id), repost_post:repost_of(id, content, image_url, created_at, profiles(id, username, avatar_url))')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ post }, { status: 201 })
}
