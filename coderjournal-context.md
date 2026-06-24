# CoderJournal — Project Context for New Chat

## What we're building
A full-stack blog platform called **"The CoderJournal"** built with Next.js + TypeScript.

---

## Tech Stack
- **Framework**: Next.js (Pages Router, NOT App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js (Google OAuth)
- **Database**: Supabase
- **Content**: MDX format for blog posts

---

## Current Status
- Fresh project just created: `coderjournal`
- Created with: `npx create-next-app@latest coderjournal --typescript --tailwind --no-eslint --no-app`
- Pages Router confirmed ✅
- Currently inside: `cd coderjournal`
- Nothing else installed or configured yet
- User is on **Windows PowerShell** (use PowerShell commands, not bash)
- Use `New-Item` instead of `touch`, `Rename-Item` instead of `mv`, `Remove-Item -Recurse -Force` instead of `rm -rf`

---

## UI Theme (MUST KEEP — user loves this)
- **Dark background**: `#0f0e0c`
- **Text**: `#e8e4dc`
- **Accent/Gold**: `#c9a96e`
- **Subtle borders**: `#1e1d1b` and `#2a2825`
- **Fonts**: Playfair Display (headings) + DM Sans (body) from Google Fonts
- **Vibe**: Dark editorial magazine, minimal, sophisticated
- **Light theme** also needed with a toggle (Dark/Light mode switch)
- **Pixelated images** here and there as design accents

---

## Full Feature Plan

### Phase 1 — UI with mock/static data
1. **Layout** with toggleable side pane (Claude-style, toggled by user, works on both desktop and mobile)
2. **Landing/main page** showing "Trending Blogs" (calculated by read time + comments + shares — mock data for now)
3. **Side pane** (always hidden until toggled):
   - Top left: "The CoderJournal" logo/title
   - "Explore Tags" section — list of popular tags, clicking navigates to tag-filtered blog list
   - "+ Create your new blog" button — navigates to editorial page
   - Bottom: User management section (Settings, Switch Account, Logout) — like Claude's bottom user section
4. **Blog listing by tag** — when a tag is clicked, shows trending blogs in that tag
5. **Blog post page**:
   - Reading time estimate
   - Comments section at the bottom
   - Share via link button
6. **MDX Editorial/writing page**:
   - User writes in MDX format
   - "Preview" button to see how it looks to others
   - Tags input before publishing
   - Content moderation policy check before posting
7. **Dark/Light mode toggle**
8. **Pixelated design touches** for aesthetic

### Phase 2 — Auth & Backend
- Google OAuth via NextAuth.js
- Supabase database for: users, posts, comments, shares, read time tracking
- Real trending calculation (read time + comments + shares)
- User profile management
- Content moderation before publishing (no sensitive/nudity/violence)

### Phase 3 — Polish
- Settings page
- Switch account
- Newsletter signup
- Notifications

---

## Layout Design
- Side pane: **toggleable on both desktop and mobile** (hidden by default, user opens it)
- Side pane design inspired by Claude's side pane
- Anyone logged in can publish blogs
- Authors tag their own blogs for filtering

---

## Folder Structure to Set Up (Next Step)
```
coderjournal/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── SidePane.tsx
│   │   └── Navbar.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogPost.tsx
│   │   └── CommentSection.tsx
│   └── ui/
│       ├── ThemeToggle.tsx
│       └── TagBadge.tsx
├── pages/
│   ├── index.tsx          # Landing + Trending blogs
│   ├── blog/
│   │   └── [slug].tsx     # Individual blog post
│   ├── tag/
│   │   └── [tag].tsx      # Blogs filtered by tag
│   └── editor/
│       └── index.tsx      # MDX editorial page
├── lib/
│   └── posts.ts
├── styles/
│   └── globals.css
├── posts/                 # MDX files (mock data for now)
└── public/
```

---

## Important Notes for Assistant
- User is a **beginner-intermediate** developer, learning as they go
- Be encouraging and explain things clearly
- When errors occur, diagnose carefully
- User is on **Windows** — always use PowerShell-compatible commands
- The project was previously a tutorial `my-blog` but we started fresh for cleaner structure
- Previous `my-blog` had issues: App Router installed by default, missing tailwind config, next.config.js vs .ts mismatch — all avoided in fresh project
- Install packages one step at a time and confirm before moving on
- The UI theme is non-negotiable — user loves it deeply 😄

---

## Packages to Install (in order)
1. `npm install @next/mdx @mdx-js/loader @mdx-js/react`
2. `npm install --save-dev @types/mdx`
3. `npm install gray-matter`
4. `npm install remark remark-html`
5. `npm install @tailwindcss/typography`
6. `npm install next-themes` (for dark/light mode)
7. `npm install next-auth` (Phase 2)
8. `npm install @supabase/supabase-js` (Phase 2)

---

## Start Here in New Chat
1. Confirm fresh `coderjournal` project is created with Pages Router
2. Install all Phase 1 packages
3. Set up folder structure
4. Configure next.config.ts, tailwind.config.js, globals.css
5. Build Layout with Side Pane first
6. Then build pages one by one
