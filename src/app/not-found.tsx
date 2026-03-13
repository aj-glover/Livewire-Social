import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-[#f0f0f0] rounded-full">
            <Zap className="w-8 h-8 text-[#6b6b6b]" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">404</h1>
        <p className="text-xl text-[#1a1a1a] mb-2">Signal not found</p>
        <p className="text-[#6b6b6b] mb-6">
          The page you&apos;re looking for isn&apos;t broadcasting. It may have been deleted or moved.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-block bg-[#1a1a1a] text-white px-6 py-2 rounded-full font-medium hover:bg-[#333] transition-colors"
          >
            Back to feed
          </Link>
          <Link
            href="/search"
            className="inline-block text-[#2563eb] hover:underline"
          >
            Search for content
          </Link>
        </div>
      </div>
    </div>
  )
}
