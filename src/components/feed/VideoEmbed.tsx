'use client'

interface VideoEmbedProps {
  content: string
}

interface VideoMatch {
  type: 'youtube' | 'vimeo'
  id: string
}

function extractVideoUrl(content: string): VideoMatch | null {
  // YouTube: watch?v=ID
  const ytWatch = content.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:[^&\s]*&)*v=([A-Za-z0-9_-]{11})/)
  if (ytWatch) return { type: 'youtube', id: ytWatch[1] }

  // YouTube: youtu.be/ID
  const ytShort = content.match(/(?:https?:\/\/)?youtu\.be\/([A-Za-z0-9_-]{11})/)
  if (ytShort) return { type: 'youtube', id: ytShort[1] }

  // YouTube: shorts/ID
  const ytShortsPath = content.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/)
  if (ytShortsPath) return { type: 'youtube', id: ytShortsPath[1] }

  // Vimeo: vimeo.com/ID
  const vimeo = content.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)
  if (vimeo) return { type: 'vimeo', id: vimeo[1] }

  return null
}

export function VideoEmbed({ content }: VideoEmbedProps) {
  const match = extractVideoUrl(content)
  if (!match) return null

  const src =
    match.type === 'youtube'
      ? `https://www.youtube.com/embed/${match.id}`
      : `https://player.vimeo.com/video/${match.id}`

  return (
    <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-2xl mb-4">
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded video"
      />
    </div>
  )
}
