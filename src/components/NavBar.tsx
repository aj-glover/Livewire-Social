'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, Edit3, User, MessageCircle, Search, Settings, Bookmark, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import type { Profile } from '@/lib/supabase/types'

interface NavBarProps {
  profile: Profile | null
}

export function NavBar({ profile }: NavBarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-xl border-b border-[#e5e5e5]">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-[#2563eb]" strokeWidth={1.5} />
          <span className="text-xl text-[#1a1a1a]">LiveWire</span>
        </Link>

        <div className="flex items-center gap-5">
          {profile ? (
            <>
              <Link
                href="/create"
                className="text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                title="New signal"
              >
                <Edit3 className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/search"
                className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/messages"
                className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                title="Messages"
              >
                <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/bookmarks"
                className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                title="Bookmarks"
              >
                <Bookmark className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/verify"
                className={`transition-colors ${
                  profile.is_verified ? 'text-green-600 hover:text-green-700' : 'text-amber-500 hover:text-amber-600'
                }`}
                title={profile.is_verified ? 'Verified' : 'Get verified'}
              >
                <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <NotificationBell />
              <Link
                href="/settings"
                className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <Link
                href={`/profile/${profile.username}`}
                className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                title={`@${profile.username}`}
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <button
                onClick={signOut}
                className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-[#1a1a1a] text-white text-sm px-5 py-2 rounded-full hover:bg-[#333] transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
