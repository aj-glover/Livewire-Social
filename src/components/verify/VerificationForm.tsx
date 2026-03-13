'use client'

import { useRef, useState } from 'react'
import { Upload, FileText, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/lib/supabase/types'

interface VerificationFormProps {
  profile: Profile
}

const INPUT_CLASS =
  'w-full bg-white border border-[#e5e5e5] rounded-2xl px-6 py-4 text-[#1a1a1a] placeholder-[#9b9b9b] focus:outline-none focus:border-[#2563eb] transition-colors'

const LABEL_CLASS = 'block text-sm text-[#1a1a1a] mb-2'

export function VerificationForm({ profile }: VerificationFormProps) {
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth ?? '')
  const [location, setLocation] = useState(profile.location ?? '')
  const [idType, setIdType] = useState('passport')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB.')
      e.target.value = ''
      return
    }

    setFile(selected)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (!dropped) return

    if (dropped.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB.')
      return
    }

    setFile(dropped)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      toast.error('Please upload your ID document.')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('full_name', fullName)
    formData.append('date_of_birth', dateOfBirth)
    formData.append('location', location)
    formData.append('id_type', idType)
    formData.append('id_document', file)

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        body: formData,
        // No Content-Type header — let browser set multipart boundary
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Submission failed. Please try again.')
        return
      }

      setSubmitted(true)
      toast.success('Verification submitted successfully!')
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
        <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-[#1a1a1a] font-medium">Verification submitted</p>
          <p className="text-sm text-[#6b6b6b] mt-0.5">
            We&apos;ll review your documents and notify you. This usually takes 1–2 business days.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Legal Name */}
      <div>
        <label htmlFor="full_name" className={LABEL_CLASS}>
          Full legal name
        </label>
        <input
          id="full_name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="As it appears on your ID"
          className={INPUT_CLASS}
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="date_of_birth" className={LABEL_CLASS}>
          Date of birth
        </label>
        <input
          id="date_of_birth"
          type="date"
          required
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className={LABEL_CLASS}>
          Location
        </label>
        <input
          id="location"
          type="text"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, State, Country"
          className={INPUT_CLASS}
        />
      </div>

      {/* ID Type */}
      <div>
        <label htmlFor="id_type" className={LABEL_CLASS}>
          ID type
        </label>
        <select
          id="id_type"
          required
          value={idType}
          onChange={(e) => setIdType(e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="passport">Passport</option>
          <option value="drivers_license">Driver&apos;s License</option>
          <option value="national_id">National ID</option>
          <option value="state_id">State ID</option>
        </select>
      </div>

      {/* ID Document Upload */}
      <div>
        <label className={LABEL_CLASS}>ID document</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="cursor-pointer border-2 border-dashed border-[#e5e5e5] rounded-2xl p-8 text-center hover:border-[#2563eb] transition-colors"
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-[#2563eb] shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <p className="text-sm text-[#1a1a1a] break-all">{file.name}</p>
                <p className="text-xs text-[#6b6b6b] mt-0.5">{formatFileSize(file.size)}</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-[#9b9b9b] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-[#1a1a1a]">Click to upload or drag and drop</p>
              <p className="text-xs text-[#9b9b9b] mt-1">PNG, JPG, PDF up to 10MB</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2563eb] text-white rounded-full py-4 text-sm hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit for verification'}
      </button>
    </form>
  )
}
