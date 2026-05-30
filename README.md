# The CoderJournal 📝

A full-stack blog platform built with Next.js + TypeScript. Dark, minimal, editorial vibes. Built from scratch — no templates, no shortcuts.

---

## What is this?

CoderJournal is a place where developers can write and share blog posts. Think Medium but darker and cooler. You sign in with Google, write in MDX format, tag your posts, and publish. Other people can read, comment, and share.

Built this entirely from scratch over multiple sessions. Every component, every API route, every Supabase table — all custom.

---

## Tech Stack

- **Framework** — Next.js (Pages Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS
- **Auth** — NextAuth.js (Google OAuth)
- **Database** — Supabase
- **Content** — MDX format
- **Deployment** — Vercel
- **Fonts** — Playfair Display + DM Sans

---

## Features

### Writing
- MDX editor with live preview toggle
- Custom tags — type your own or pick from suggestions (max 5)
- Auto read time calculation
- Auto slug generation

### Reading
- Trending blogs — calculated by read time + comments + shares
- Latest posts feed — real posts from Supabase + mock data
- Tag filtered pages — click any tag to see related posts
- Full blog post page with syntax highlighted code blocks

### Auth & Users
- Google OAuth sign in/out
- Persistent display name — set your own username, survives refresh
- Switch account support
- Profile settings page

### Community
- Comments section on every post
- Notifications — get notified when someone comments on your post
- Share link button — copies URL to clipboard

### Moderation
- Server-side content moderation on every publish
- Banned words loaded from JSON file — easy to update
- Flagged posts get blocked before saving

### Management
- My Posts in settings — see all your published posts
- Delete posts — with confirmation so no accidents

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- Google Cloud OAuth credentials

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/coderjournal.git
cd coderjournal
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Tables

Run these in your Supabase SQL editor:

```sql
-- Profiles
create table public.profiles (
  email text primary key,
  name text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Posts
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null,
  author_name text,
  author_email text,
  tags text[] default '{}',
  read_time int default 1,
  published boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Comments
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_slug text,
  author_name text not null,
  author_email text,
  text text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_email text not null,
  type text not null,
  message text not null,
  post_slug text,
  post_title text,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);
```

### Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're good to go.

---

## Project Structure

```
coderjournal/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── SidePane.tsx
│   │   └── Navbar.tsx
│   └── ui/
│       └── ThemeToggle.tsx
├── pages/
│   ├── index.tsx
│   ├── blog/[slug].tsx
│   ├── tag/[tag].tsx
│   ├── editor/index.tsx
│   ├── settings/index.tsx
│   ├── notifications/index.tsx
│   ├── auth/signin.tsx
│   └── api/
│       ├── auth/[...nextauth].ts
│       ├── publish.ts
│       ├── comment.ts
│       ├── delete-post.ts
│       ├── get-profile.ts
│       ├── get-tags.ts
│       ├── moderate.ts
│       └── update-profile.ts
├── lib/
│   ├── posts.ts
│   ├── mdx.ts
│   ├── supabase.ts
│   └── banned-words.json
├── posts/
│   └── *.mdx
└── styles/
    └── globals.css
```

---

## Deployment

Deployed on Vercel. Just connect your GitHub repo, add the environment variables in the Vercel dashboard, and deploy.

Don't forget to update your Google OAuth callback URL to your production domain:
```
https://your-domain.vercel.app/api/auth/callback/google
```

---

## Design

Dark editorial magazine vibe. Non-negotiable.

- Background `#0f0e0c`
- Text `#e8e4dc`  
- Gold accent `#c9a96e`
- Playfair Display for headings
- DM Sans for body text

---

Built with way too much coffee and a lot of debugging sessions ☕
