import { Check } from 'lucide-react'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md'
}

export function VerifiedBadge({ size = 'md' }: VerifiedBadgeProps) {
  const containerClass =
    size === 'sm'
      ? 'w-4 h-4 inline-flex items-center justify-center rounded-full bg-[#2563eb] ml-1 shrink-0'
      : 'w-5 h-5 inline-flex items-center justify-center rounded-full bg-[#2563eb] ml-1 shrink-0'

  const iconClass = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'

  return (
    <span className={containerClass} title="Verified">
      <Check className={`${iconClass} text-white`} strokeWidth={3} />
    </span>
  )
}
