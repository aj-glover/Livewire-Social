import Image from 'next/image'

interface AvatarProps {
  username: string
  avatarUrl: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
}

export function Avatar({ username, avatarUrl, size = 'md' }: AvatarProps) {
  const classes = sizeClasses[size]

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={username}
        className={`${classes} rounded-full object-cover shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${classes} rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center shrink-0`}
    >
      <span className="text-white">{username[0].toUpperCase()}</span>
    </div>
  )
}
