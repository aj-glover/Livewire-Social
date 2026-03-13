'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  generateKeyPair,
  exportPublicKey,
  storePrivateKey,
  getPrivateKey,
} from '@/lib/crypto'

export function CryptoInit({ userId }: { userId: string }) {
  useEffect(() => {
    async function init() {
      try {
        // Check if we already have a private key
        const existing = await getPrivateKey(userId)
        if (existing) return

        // Generate new key pair
        const keyPair = await generateKeyPair()
        const publicKeyB64 = await exportPublicKey(keyPair.publicKey)

        // Store private key in IndexedDB
        await storePrivateKey(userId, keyPair.privateKey)

        // Upload public key to Supabase
        const supabase = createClient()
        await supabase
          .from('profiles')
          .update({ public_key: publicKeyB64 })
          .eq('id', userId)
      } catch (err) {
        console.error('CryptoInit failed:', err)
      }
    }
    init()
  }, [userId])

  return null
}
