# LiveWire Social

> *Where ideas go live.*

A social network built around signal integrity — every post is checked for originality, every identity can be verified, and every direct message is end-to-end encrypted. LiveWire is designed for communities that value authenticity over volume.

---

## Core Concepts

| Term | Meaning |
|---|---|
| **Signal** | A post on LiveWire |
| **Originality Check** | Automatic similarity scan against existing content before a signal is published |
| **Verified** | Identity-confirmed account badge (via document verification) |
| **Trending / Latest / Following** | Three feed modes with configurable time windows |

---

## Features

### Feed & Discovery
- **Three feed modes** — Latest, Trending, Following — each with time-window filters (hour / day / month / year)
- **Profile-based filtering** — surface signals by age, location, gender, political lean, or ethnicity
- **Hashtag pages** — browse by topic with `#tag` routing
- **Infinite scroll** — cursor-based pagination for performant loading at scale
- **Adult content gate** — age-verified users only; enforced server-side

### Signals (Posts)
- Text + image support
- Like, comment, bookmark, repost
- **Originality enforcement** — PostgreSQL trigram similarity (`pg_trgm`) rejects near-duplicate content above a configurable threshold (default 0.65)
- Report system for inappropriate content (pending / reviewed / dismissed)

### Identity & Trust
- **Email verification** required before posting
- **ID verification** powered by [Didit](https://didit.me) — document scan → admin review → verified badge
- **Admin dashboard** — two-tier approval flow (user initiates, admin approves/rejects)
- Verification data: full name, DOB, location, ID type, document scan

### Privacy & Safety
- **End-to-end encrypted DMs** — ECDH P-256 key exchange + AES-256-GCM encryption; private keys stored in IndexedDB and never leave the browser
- **Block / mute** any account
- **Row-Level Security (RLS)** enforced across all sensitive Supabase tables
- Follows, blocks, and mutes are invisible to affected parties

### Profiles
- Username, bio, avatar, location, gender, political lean, ethnicity, date of birth
- Follow / follower counts
- Post history with repost threading

### Notifications
- Types: follow, like, comment, mention, bookmark
- Read / unread state with bulk mark-all-as-read

---

## Tech Stack

| Component | Details |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Backend / DB | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password + email confirmation) |
| UI | Tailwind CSS 4 · shadcn/ui · Framer Motion |
| Encryption | Web Crypto API — ECDH P-256 + AES-256-GCM |
| Originality | PostgreSQL `pg_trgm` trigram similarity |
| ID Verification | Didit webhook integration |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login · Signup
│   ├── (main)/              # Protected routes
│   │   ├── admin/           # Verification review dashboard
│   │   ├── bookmarks/
│   │   ├── create/          # Signal composer
│   │   ├── hashtag/[tag]/
│   │   ├── messages/        # E2E encrypted DMs
│   │   ├── notifications/
│   │   ├── post/[id]/       # Signal detail + comments
│   │   ├── profile/[username]/
│   │   ├── search/
│   │   ├── settings/
│   │   ├── verify/          # ID verification flow
│   │   └── page.tsx         # Home feed
│   └── api/                 # 20 API route handlers
├── components/
│   ├── admin/               # Verification UI
│   ├── feed/                # Feed + infinite scroll
│   ├── messages/            # Conversation view
│   ├── post/                # Post creation + comments
│   ├── profile/             # Profile editor + avatar upload
│   ├── search/
│   ├── verify/              # Didit integration UI
│   └── ui/                  # shadcn/ui primitives
├── lib/
│   ├── supabase/            # Client · Server · TypeScript types
│   ├── auth.ts
│   ├── crypto.ts            # E2E encryption helpers
│   └── originality.ts       # Content similarity utilities
└── supabase/
    └── migrations/          # 13 SQL migration files
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User data, verification status, admin flag, filter attributes |
| `posts` | Signals with optional image, repost metadata, adult-content flag |
| `likes` | Post reactions (unique per user per post) |
| `comments` | Nested post replies |
| `follows` | Follow graph |
| `bookmarks` | Saved signals |
| `blocks` / `mutes` | Safety controls |
| `reports` | Content / account reports |
| `direct_messages` | Encrypted ciphertext + IV (keys never stored server-side) |
| `notifications` | Activity feed entries |
| `verifications` | ID check records — pending / approved / rejected |

**Key DB features:**
- `check_post_similarity()` — RPC function called before every post to enforce originality
- Trigram index on `posts.content` for fast similarity queries
- B-tree indexes on all profile filter columns

---

## Getting Started

**Requirements:** Node.js 18+ · A Supabase project

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# Add DIDIT_* webhook credentials if using ID verification

# 3. Apply database migrations
# Run each file in supabase/migrations/ in order via the Supabase SQL editor or CLI

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-only) |
| `DIDIT_*` | Optional | Didit webhook credentials for ID verification |

---

## Roadmap

- [ ] Real-time feed updates via Supabase Realtime
- [ ] Push notifications (web + mobile)
- [ ] Cloud key backup for E2E message recovery (opt-in, zero-knowledge)
- [ ] Mobile apps (React Native)
- [ ] OAuth providers (Google, Apple)
- [ ] Group messaging
- [ ] Clinician / sponsor portal with anonymized trend export

---

> **Disclaimer:** LiveWire Social is not a certified identity verification or compliance tool. The verified badge indicates a completed ID check, not any legal certification.
