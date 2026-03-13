'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'

const AGE_RANGES = [
  { label: 'Teens (13–17)', value: '13-17' },
  { label: '18–25', value: '18-25' },
  { label: '26–35', value: '26-35' },
  { label: '36–50', value: '36-50' },
  { label: '51+', value: '51-999' },
]

const GENDERS = [
  { label: 'Man', value: 'Man' },
  { label: 'Woman', value: 'Woman' },
  { label: 'Non-binary', value: 'Non-binary' },
  { label: 'Other', value: 'Other' },
]

const POLITICS = [
  { label: 'Very Liberal', value: 'Very Liberal' },
  { label: 'Liberal', value: 'Liberal' },
  { label: 'Moderate', value: 'Moderate' },
  { label: 'Conservative', value: 'Conservative' },
  { label: 'Very Conservative', value: 'Very Conservative' },
]

const ETHNICITIES = [
  { label: 'Asian', value: 'Asian' },
  { label: 'Black / African American', value: 'Black' },
  { label: 'Hispanic / Latino', value: 'Hispanic' },
  { label: 'Middle Eastern', value: 'Middle Eastern' },
  { label: 'Native American', value: 'Native American' },
  { label: 'Pacific Islander', value: 'Pacific Islander' },
  { label: 'White / Caucasian', value: 'White' },
  { label: 'Multiracial', value: 'Multiracial' },
  { label: 'Other', value: 'Other' },
]

const selectCls =
  'bg-white border border-[#e5e5e5] rounded-full px-4 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2563eb] transition-colors cursor-pointer appearance-none pr-8'

export function FeedFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const get = (key: string) => searchParams.get(key) ?? ''

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  const hasFilters =
    get('ageRange') || get('location') || get('gender') || get('politics') || get('ethnicity')

  function clearAll() {
    router.push('/')
  }

  return (
    <div className="px-4 py-3 bg-white border-b border-[#e5e5e5] flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {/* Age */}
      <div className="relative shrink-0">
        <select
          value={get('ageRange')}
          onChange={(e) => update('ageRange', e.target.value)}
          className={selectCls}
        >
          <option value="">All ages</option>
          {AGE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9b9b] text-xs">▾</span>
      </div>

      {/* Location */}
      <div className="relative shrink-0">
        <input
          type="text"
          placeholder="Location…"
          value={get('location')}
          onChange={(e) => update('location', e.target.value)}
          className="bg-white border border-[#e5e5e5] rounded-full px-4 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2563eb] transition-colors w-36"
        />
      </div>

      {/* Gender */}
      <div className="relative shrink-0">
        <select
          value={get('gender')}
          onChange={(e) => update('gender', e.target.value)}
          className={selectCls}
        >
          <option value="">Any gender</option>
          {GENDERS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9b9b] text-xs">▾</span>
      </div>

      {/* Politics */}
      <div className="relative shrink-0">
        <select
          value={get('politics')}
          onChange={(e) => update('politics', e.target.value)}
          className={selectCls}
        >
          <option value="">Any politics</option>
          {POLITICS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9b9b] text-xs">▾</span>
      </div>

      {/* Ethnicity */}
      <div className="relative shrink-0">
        <select
          value={get('ethnicity')}
          onChange={(e) => update('ethnicity', e.target.value)}
          className={selectCls}
        >
          <option value="">Any ethnicity</option>
          {ETHNICITIES.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9b9b] text-xs">▾</span>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-sm text-[#dc2626] border border-[#dc2626]/30 hover:bg-[#dc2626]/5 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  )
}
