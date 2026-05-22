# HyPack

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat&logo=clerk&logoColor=white)](https://clerk.com)
[![Supabase](https://img.shields.io/badge/Supabase-DB%20%26%20Storage-3FCF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Bun](https://img.shields.io/badge/Bun-Runtime-000000?style=flat&logo=bun&logoColor=white)](https://bun.sh)

**Build, share, and export Hytale modpacks** — powered by CurseForge discovery and a simple web UI.

HyPack lets players search Hytale mods on CurseForge, assemble modpacks, choose visibility (private, unlisted, or public), and download a ready-to-use ZIP with mod files and a generated `config.json`. Creators can share packs on Explore, collect likes, and manage everything from a personal dashboard.

Live site: [hypack.ca](https://www.hypack.ca)

## Features

### Modpack builder
- **Create & edit modpacks** — name, description, custom icon (JPEG/PNG, max 2 MB)
- **CurseForge mod search** — find and add Hytale mods from the API
- **Visibility** — Private (owner only), Unlisted (link-only), or Public (discoverable on Explore)
- **Export** — download a ZIP with mod files, `config.json`, and a README
- **Duplicate** — fork your own or someone else’s public/unlisted pack

### Community
- **Explore** — browse and search public modpacks
- **Likes** — save favorite packs to **My likes**
- **Creator profiles** — public pages per user (`/users/[userId]`)

### Content (markdown)
- **Blog** — `content/blog/`
- **Changelog** — `content/changelog/`
- **Guides** — `content/guides/` (subfolders become nav categories)

### Auth
- Sign in / sign up via [Clerk](https://clerk.com) (email, Google, GitHub, Discord, etc. — configured in your Clerk dashboard)
- Protected routes for managing your modpacks

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth | Clerk |
| Database & storage | Supabase (Postgres + Storage) |
| Mod metadata | [CurseForge API](https://docs.curseforge.com/) |
| Markdown content | gray-matter + react-markdown |

## Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20+
- A [Clerk](https://dashboard.clerk.com/) application
- A [Supabase](https://supabase.com/dashboard) project
- A [CurseForge API key](https://console.curseforge.com/)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/blushell/HyPack.git
cd HyPack
bun install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key (server only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `CURSEFORGE_API_KEY` | CurseForge API token |

Optional:

| Variable | Description |
|----------|-------------|
| `HYPACK_FEATURED_CLERK_USER_ID` | Clerk user ID for homepage featured modpacks (defaults to username `hypack`) |
| `HYTALE_MOD_COUNT_CACHE_SECONDS` | Cache duration for homepage mod count (default `21600`) |

Clerk redirect URLs are documented in `.env.example`. For local dev, use your `pk_test_` / `sk_test_` keys.

### 3. Supabase

1. Create a Supabase project.
2. Run [`supabase/setup.sql`](supabase/setup.sql) in the SQL Editor.
3. See [`supabase/README.md`](supabase/README.md) for details.

### 4. Run locally

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production deployment (Vercel + Clerk)

**Git pushes do not auto-deploy.** [`vercel.json`](vercel.json) sets `git.deploymentEnabled` to `false` so only manual triggers deploy production.

### Deploy when you are ready

**Option A — Vercel dashboard**

1. [vercel.com](https://vercel.com) → your HyPack project → **Deployments**
2. Open the latest production deployment → **⋯** → **Redeploy** (or **Create Deployment** and pick the branch/commit)

**Option B — Vercel CLI**

```bash
npx vercel deploy --prod
```

**Option C — GitHub Actions** (recommended)

1. Add these [repository secrets](https://github.com/blushell/HyPack/settings/secrets/actions):
   - `VERCEL_TOKEN` — [Vercel account token](https://vercel.com/account/settings/tokens)
   - `VERCEL_ORG_ID` — Project **Settings** → General → Team / Personal ID, or `.vercel/project.json` → `orgId`
   - `VERCEL_PROJECT_ID` — same page or `.vercel/project.json` → `projectId`
2. On GitHub: **Actions** → **Deploy to Production** → **Run workflow** (pick branch, then **Run workflow**)

Workflow file: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

**Option D — Deploy Hook**

1. Project **Settings** → **Deploy Hooks** → create a hook for the `main` branch
2. POST to the hook URL when you want a release

### First-time / env setup

1. **Vercel** — set all env vars for **Production** (`pk_live_` / `sk_live_`, Supabase, CurseForge, etc.). Redeploy after changing `NEXT_PUBLIC_*` vars.
2. **Clerk domains** — add `hypack.ca`, `www.hypack.ca`, and DNS for the Clerk Frontend API host (e.g. `clerk.hypack.ca`).
3. **OAuth** — configure **Production** social connections (Google, GitHub, Discord, …) with Clerk’s redirect URI (`https://clerk.<your-domain>/v1/oauth_callback`).

To turn automatic deploys back on, set `"deploymentEnabled": true` in `vercel.json` (or per-branch — see [Vercel git configuration](https://vercel.com/docs/project-configuration/git-configuration)).

## Project structure

```
HyPack/
├── content/              # Markdown: blog, changelog, guides
├── public/               # Static assets (logo, hero image)
├── src/
│   ├── app/              # Next.js routes & API handlers
│   │   ├── api/          # REST API (modpacks, mods search, …)
│   │   ├── blog/         # Blog listing & posts
│   │   ├── changelog/    # Release notes
│   │   ├── explore/      # Public modpack discovery
│   │   ├── guides/       # Documentation (with categories)
│   │   └── modpacks/     # Creator dashboard & pack pages
│   ├── components/       # React UI
│   └── lib/              # Server logic (CurseForge, modpacks, Clerk, Supabase)
├── supabase/
│   └── setup.sql         # Database schema & storage bucket
└── proxy.ts              # Clerk middleware (protected routes)
```

## Adding content

### Blog or changelog

Add a `.md` file under `content/blog/` or `content/changelog/`:

```md
---
title: Post title
date: 2025-06-01
---

Your markdown content here.
```

The filename (without `.md`) becomes the URL slug.

### Guides (with categories)

- Root file: `content/guides/overview.md` → `/guides/overview`
- Category folder: `content/guides/getting-started/welcome.md` → `/guides/getting-started/welcome`

Subfolders appear in the **Guides** nav dropdown. See [`content/guides/README.md`](content/guides/README.md).

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun run build` | Production build |
| `bun run start` | Run production server locally |
| `bun run lint` | Run ESLint |

## API overview

| Endpoint | Purpose |
|----------|---------|
| `GET/POST /api/modpacks` | List / create modpacks |
| `GET/PATCH/DELETE /api/modpacks/[id]` | Modpack CRUD |
| `POST /api/modpacks/[id]/export` | Export modpack ZIP |
| `POST /api/modpacks/[id]/like` | Toggle like |
| `POST /api/modpacks/[id]/duplicate` | Duplicate modpack |
| `POST /api/modpacks/[id]/icon` | Upload icon |
| `GET /api/mods/search` | CurseForge mod search |

All modpack mutations require an authenticated Clerk session.

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0).

## Links

- [Repository](https://github.com/blushell/HyPack)
- [Changelog](/changelog) (on the running site)
