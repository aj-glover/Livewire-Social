import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { NavBar } from '@/components/NavBar'
import { CryptoInit } from '@/components/CryptoInit'
import { VerificationBanner } from '@/components/VerificationBanner'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'LiveWire — Where ideas go live',
  description: 'A social network where every signal must be original.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const needsVerification = user && !user.email_confirmed_at

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#fafafa] font-sans antialiased">
        <NavBar profile={profile} />
        {user && <CryptoInit userId={user.id} />}
        {needsVerification && <VerificationBanner email={user.email ?? ''} />}
        <main className="mx-auto max-w-2xl">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
