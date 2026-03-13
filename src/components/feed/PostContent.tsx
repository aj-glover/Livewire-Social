import Link from 'next/link'

interface PostContentProps {
  content: string
  className?: string
}

export function PostContent({ content, className }: PostContentProps) {
  const parts = content.split(/(#[a-zA-Z0-9_]+)/g)

  return (
    <p className={`whitespace-pre-wrap break-words ${className ?? ''}`}>
      {parts.map((part, i) => {
        if (/^#[a-zA-Z0-9_]+$/.test(part)) {
          const tag = part.slice(1).toLowerCase()
          return (
            <Link
              key={i}
              href={`/hashtag/${tag}`}
              className="text-[#2563eb] hover:underline"
            >
              {part}
            </Link>
          )
        }
        return part
      })}
    </p>
  )
}
