'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { ArrowLeft, Lock } from 'lucide-react'
import {
  getPrivateKey,
  importPublicKey,
  encryptMessage,
  decryptMessage,
} from '@/lib/crypto'

interface Message {
  id: string
  sender_id: string
  ciphertext: string
  iv: string
  created_at: string
  plaintext?: string
}

interface Props {
  currentUserId: string
  currentUserPublicKey: string | null
  otherUsername: string
  otherUserId: string
  otherPublicKey: string | null
}

export function ConversationView({
  currentUserId,
  currentUserPublicKey,
  otherUsername,
  otherUserId,
  otherPublicKey,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        if (!otherPublicKey) {
          setError("This user hasn't set up encryption keys yet.")
          return
        }

        const res = await fetch(`/api/messages/${otherUsername}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)

        const myPrivateKey = await getPrivateKey(currentUserId)
        if (!myPrivateKey) {
          setError('Encryption keys not found. Try refreshing the page.')
          return
        }

        const theirPubKey = await importPublicKey(otherPublicKey)

        const decrypted = await Promise.all(
          (json.messages as Message[]).map(async (msg) => {
            try {
              // For messages I sent: use their public key (same shared secret)
              // For messages they sent: use their public key (same ECDH result)
              const plaintext = await decryptMessage(
                msg.ciphertext,
                msg.iv,
                myPrivateKey,
                theirPubKey
              )
              return { ...msg, plaintext }
            } catch {
              return { ...msg, plaintext: '[could not decrypt]' }
            }
          })
        )

        setMessages(decrypted)
        setReady(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages')
      }
    }
    load()
  }, [currentUserId, currentUserPublicKey, otherPublicKey, otherUsername])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !otherPublicKey) return
    setSubmitting(true)

    try {
      const myPrivateKey = await getPrivateKey(currentUserId)
      if (!myPrivateKey) throw new Error('Private key not found')

      const theirPubKey = await importPublicKey(otherPublicKey)
      const { ciphertext, iv } = await encryptMessage(input.trim(), myPrivateKey, theirPubKey)

      const res = await fetch(`/api/messages/${otherUsername}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciphertext, iv }),
      })

      if (!res.ok) throw new Error('Failed to send')

      const json = await res.json()
      setMessages(prev => [...prev, { ...json.message, plaintext: input.trim() }])
      setInput('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e5e5e5]">
        <Link href="/messages" className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Link>
        <Link href={`/profile/${otherUsername}`} className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center shrink-0">
            <span className="text-white text-sm">{otherUsername[0].toUpperCase()}</span>
          </div>
          <span className="text-[#1a1a1a]">{otherUsername}</span>
        </Link>
        <div className="flex items-center gap-1 text-[#10b981] text-xs">
          <Lock className="w-3 h-3" strokeWidth={2} />
          <span>E2E encrypted</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {error ? (
          <p className="text-sm text-[#dc2626] text-center">{error}</p>
        ) : !ready ? (
          <p className="text-sm text-[#9b9b9b] text-center">Decrypting messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[#9b9b9b] text-center">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] space-y-1`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#1a1a1a] text-white rounded-br-sm'
                        : 'bg-[#f5f5f5] text-[#1a1a1a] rounded-bl-sm'
                    }`}
                  >
                    {msg.plaintext}
                  </div>
                  <p className={`text-xs text-[#9b9b9b] ${isMe ? 'text-right' : 'text-left'}`}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 px-6 py-4 border-t border-[#e5e5e5]">
        <input
          placeholder={otherPublicKey ? 'Send an encrypted message…' : 'User has no encryption keys'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!otherPublicKey || !ready}
          maxLength={2000}
          className="flex-1 bg-[#f5f5f5] rounded-2xl px-4 py-3 text-[#1a1a1a] placeholder:text-[#9b9b9b] focus:outline-none focus:ring-1 focus:ring-[#2563eb] text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={submitting || !input.trim() || !otherPublicKey || !ready}
          className="bg-[#1a1a1a] text-white px-5 py-2 rounded-full text-sm hover:bg-[#333] transition-colors disabled:opacity-40"
        >
          {submitting ? '…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
