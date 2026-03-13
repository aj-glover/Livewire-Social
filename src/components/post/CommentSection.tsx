'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    id: string
    username: string
    avatar_url: string | null
  }
}

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
  currentUserId?: string
}

export function CommentSection({ postId, initialComments, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !currentUserId) return

    setSubmitting(true)

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input.trim() }),
    })

    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error ?? 'Could not add reply.')
      setSubmitting(false)
      return
    }

    setComments((prev) => [...prev, json.comment])
    setInput('')
    setSubmitting(false)
  }

  return (
    <section className="px-6 py-6 bg-white border-t border-[#e5e5e5] space-y-6">
      <h3 className="text-[#6b6b6b] text-sm">Replies ({comments.length})</h3>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            placeholder="Add a reply…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            className="flex-1 bg-[#f5f5f5] rounded-2xl px-4 py-3 text-[#1a1a1a] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-1 focus:ring-[#2563eb] text-sm"
          />
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="bg-[#1a1a1a] text-white px-5 py-2 rounded-full text-sm hover:bg-[#333] transition-colors disabled:opacity-40"
          >
            {submitting ? '…' : 'Reply'}
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-[#9b9b9b]">No replies yet.</p>
      ) : (
        <ul className="space-y-5">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center shrink-0">
                <span className="text-white text-xs">{comment.profiles.username[0].toUpperCase()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <Link
                    href={`/profile/${comment.profiles.username}`}
                    className="text-[#1a1a1a] text-sm hover:underline"
                  >
                    {comment.profiles.username}
                  </Link>
                  <span className="text-xs text-[#9b9b9b]">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-[#1a1a1a] text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
