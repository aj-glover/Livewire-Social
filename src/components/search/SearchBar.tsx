'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keep input in sync when URL changes externally
  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    } else {
      router.push('/search')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search
        className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9b9b9b] w-5 h-5 pointer-events-none"
        strokeWidth={1.5}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search users and wires…"
        className="w-full bg-white border border-[#e5e5e5] rounded-2xl pl-12 pr-6 py-4 text-[#1a1a1a] placeholder-[#9b9b9b] focus:outline-none focus:border-[#2563eb] transition-colors"
      />
      {value && (
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#1a1a1a] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#333] transition-colors"
        >
          Search
        </button>
      )}
    </form>
  )
}
