import Link from 'next/link'
import { Zap } from 'lucide-react'

export function LandingHero() {
  return (
    <div className="bg-gradient-to-b from-white to-[#fafafa] border-b border-[#e5e5e5] px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-[#1a1a1a] rounded-full">
            <Zap className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">
          LiveWire
        </h1>

        <p className="text-lg text-[#6b6b6b] mb-2">
          Where every signal must be original
        </p>

        <p className="text-sm text-[#9b9b9b] mb-6">
          Join a community of real people sharing authentic ideas. Verified identity. Original thoughts. No noise.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-3">
          <Link
            href="/signup"
            className="inline-block bg-[#1a1a1a] text-white px-6 py-2 rounded-full font-medium hover:bg-[#333] transition-colors text-sm"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-block bg-white border border-[#e5e5e5] text-[#1a1a1a] px-6 py-2 rounded-full font-medium hover:bg-[#fafafa] transition-colors text-sm"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
