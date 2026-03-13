// E2E encryption using Web Crypto API (ECDH P-256 + AES-256-GCM)
// Private keys are stored in IndexedDB and never sent to the server.

const DB_NAME = 'livewire-keys'
const DB_STORE = 'private-keys'
const DB_VERSION = 1

function openKeyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function storePrivateKey(userId: string, key: CryptoKey): Promise<void> {
  const db = await openKeyDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite')
    tx.objectStore(DB_STORE).put(key, userId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPrivateKey(userId: string): Promise<CryptoKey | null> {
  const db = await openKeyDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly')
    const req = tx.objectStore(DB_STORE).get(userId)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    false, // private key is not extractable
    ['deriveKey']
  )
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('spki', key)
  return btoa(String.fromCharCode(...new Uint8Array(raw)))
}

export async function importPublicKey(b64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  return crypto.subtle.importKey(
    'spki',
    raw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )
}

async function deriveAesKey(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
  const sharedSecret = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  )
  // HKDF to get AES-256-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32),
      info: new TextEncoder().encode('livewire-dm-v1'),
    },
    sharedSecret,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptMessage(
  plaintext: string,
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const aesKey = await deriveAesKey(myPrivateKey, theirPublicKey)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoded)
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  }
}

export async function decryptMessage(
  ciphertext: string,
  iv: string,
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<string> {
  const aesKey = await deriveAesKey(myPrivateKey, theirPublicKey)
  const ctBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, aesKey, ctBytes)
  return new TextDecoder().decode(decrypted)
}
