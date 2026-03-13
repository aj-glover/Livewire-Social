'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const MAX_CHARS = 500

function calcOriginalityPreview(text: string): number {
  if (text.length < 20) return 0
  const base = Math.min(text.length / 2, 85)
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size
  return Math.min(Math.round(base + Math.min(uniqueWords, 15)), 99)
}

export function CreatePostForm() {
  const router = useRouter()
  const supabase = createClient()
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isAdultContent, setIsAdultContent] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const charsRemaining = MAX_CHARS - content.length
  const originality = calcOriginalityPreview(content)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !imageFile) return
    setSubmitting(true)

    let image_url: string | null = null

    if (imageFile) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be signed in.')
        setSubmitting(false)
        return
      }
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('post-images').upload(path, imageFile)
      if (uploadError) {
        toast.error('Image upload failed: ' + uploadError.message)
        setSubmitting(false)
        return
      }
      const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), image_url, is_adult_content: isAdultContent }),
    })

    const json = await res.json()

    if (!res.ok) {
      if (res.status === 409 && json.duplicatePostId) {
        toast.error(`Too similar to a signal by @${json.duplicateAuthor}. Make it more original.`)
      } else {
        toast.error(json.error ?? 'Something went wrong.')
      }
      setSubmitting(false)
      return
    }

    toast.success('Signal sent!')
    setContent('')
    removeImage()
    router.push('/')
    router.refresh()
  }

  const barColor =
    originality > 80 ? '#10b981' : originality > 50 ? '#2563eb' : '#9b9b9b'

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col bg-white">
      {/* Composer toolbar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#e5e5e5]">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit as unknown as React.MouseEventHandler}
          disabled={submitting || (!content.trim() && !imageFile)}
          className="bg-[#1a1a1a] text-white px-6 py-2 rounded-full hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          {submitting ? 'Checking…' : 'Publish Signal'}
        </button>
      </div>

      {/* Textarea */}
      <div className="flex-1 px-6 py-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder="What's on your mind?"
          autoFocus
          className="w-full h-48 bg-transparent text-[#1a1a1a] placeholder:text-[#9b9b9b] resize-none focus:outline-none font-mono text-lg leading-relaxed"
        />

        {imagePreview && (
          <div className="relative w-fit mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="max-h-64 rounded-2xl object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-[#e5e5e5] space-y-4">
        {/* Originality bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#6b6b6b]">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm">Originality preview</span>
            </div>
            <span className="text-sm" style={{ color: barColor }}>
              {originality}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${originality}%` }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
            />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <label className="cursor-pointer text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
            Add image
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          <span className={`text-sm ${charsRemaining < 50 ? 'text-[#dc2626]' : 'text-[#9b9b9b]'}`}>
            {charsRemaining} left
          </span>
        </div>

        {/* Adult content toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#6b6b6b]">
          <input
            type="checkbox"
            checked={isAdultContent}
            onChange={(e) => setIsAdultContent(e.target.checked)}
            className="w-4 h-4 rounded accent-[#dc2626]"
          />
          <span>Mark as 18+ content</span>
        </label>
      </div>
    </div>
  )
}
