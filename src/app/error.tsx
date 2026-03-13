'use client'

import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Something went wrong</h1>
        <p className="text-[#6b6b6b] mb-6">
          An unexpected error occurred. Please try again.
        </p>

        <button
          onClick={() => reset()}
          className="inline-block bg-[#1a1a1a] text-white px-6 py-2 rounded-full font-medium hover:bg-[#333] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
