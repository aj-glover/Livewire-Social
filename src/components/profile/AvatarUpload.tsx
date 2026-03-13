'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { createClient } from '@/lib/supabase/client'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl: string | null
  username: string
  onUploadComplete: (url: string) => void
}

export function AvatarUpload({ userId, currentAvatarUrl, username, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller.')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `avatars/${userId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        toast.error('Upload failed: ' + uploadError.message)
        return
      }

      const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? 'Failed to save avatar.')
        return
      }

      setPreviewUrl(publicUrl)
      onUploadComplete(publicUrl)
      toast.success('Avatar updated')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="relative inline-block cursor-pointer group" onClick={() => !uploading && inputRef.current?.click()}>
      <Avatar username={username} avatarUrl={previewUrl} size="xl" />

      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-white" strokeWidth={1.5} />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
    </div>
  )
}
