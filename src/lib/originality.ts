import { createClient } from './supabase/server'

export interface OriginalityResult {
  isOriginal: boolean
  duplicatePostId?: string
  duplicateAuthor?: string
  similarityScore?: number
}

export async function checkOriginality(content: string): Promise<OriginalityResult> {
  if (!content || content.trim().length < 10) {
    return { isOriginal: true }
  }

  const supabase = await createClient()
  const threshold = parseFloat(process.env.ORIGINALITY_THRESHOLD ?? '0.65')

  const { data, error } = await supabase.rpc('check_post_similarity', {
    input_content: content.trim(),
    similarity_threshold: threshold,
  })

  if (error) {
    console.error('Originality check error:', error)
    // Fail open — if check errors, allow the post
    return { isOriginal: true }
  }

  if (data && data.length > 0) {
    const match = data[0]
    return {
      isOriginal: false,
      duplicatePostId: match.post_id,
      duplicateAuthor: match.author_username,
      similarityScore: match.similarity_score,
    }
  }

  return { isOriginal: true }
}
