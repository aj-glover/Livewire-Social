'use client'

import { useState } from 'react'
import { AvatarUpload } from '@/components/profile/AvatarUpload'

interface AvatarUploadWrapperProps {
  userId: string
  initialAvatarUrl: string | null
  username: string
}

export function AvatarUploadWrapper({ userId, initialAvatarUrl, username }: AvatarUploadWrapperProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)

  return (
    <AvatarUpload
      userId={userId}
      currentAvatarUrl={avatarUrl}
      username={username}
      onUploadComplete={setAvatarUrl}
    />
  )
}
