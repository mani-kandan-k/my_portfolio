# Portfolio CMS

A personal portfolio site with a full admin CMS — every section, color, and SEO tag is
editable from a browser, with zero redeploys.

## Features

- **Public portfolio** — hero, about, skills, experience, projects, education, contact and
  footer sections rendered from the database in admin-defined order; hidden/empty sections
  drop out cleanly. Project detail pages at `/projects/<slug>`.
- **Admin panel** (`/admin`) — content CRUD, drag-and-drop section/item ordering, visibility
  toggles, live two-color theme manager, SEO defaults + per-page overrides, comment
  moderation, analytics dashboard, and a contact-message inbox.
- **GitHub OAuth** — one allowlisted admin account (`ADMIN_GITHUB_USERNAME`); any other
  GitHub user can sign in to like and comment on projects.
- **Engagement** — likes and comments on project pages (optimistic UI, rate-limited,
  plain-text only).
- **Privacy-friendly analytics** — cookieless pageview tracking (HMAC of IP+UA with a
  daily-rotating salt), honors `DNT: 1`, never tracks `/admin`/`/api` or the admin's own
  visits; dashboard with 7/30/90-day ranges.
- **Contact form** — honeypot + per-IP rate limit; messages are stored in the DB inbox and
  emailed via Resend (stored even when delivery fails).
- **SEO** — per-page meta/OG/Twitter tags, generated OG image cards (static image wins when
  configured), `sitemap.xml` (includes project slugs), `robots.txt`, canonical URLs, themed
  404/error pages.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 3 (Vue 3, TypeScript, SSR) |
| UI | Tailwind CSS + daisyUI v4 (custom two-color light/dark themes) |
| Database | Prisma 7 + `@prisma/adapter-libsql` — local SQLite file in dev, Turso (libSQL) in prod |
| Auth | `nuxt-auth-utils` GitHub OAuth, sealed-cookie sessions |
| SEO | `@nuxtjs/seo` (sitemap, robots, OG image, link checker) |
| Email | Resend |
| Charts | Chart.js (admin analytics only, code-split) |
| Validation | zod v4 schemas shared between client forms and server routes |
| Hosting | Vercel |

## Prerequisites

- Node.js 20+ and npm
- A GitHub OAuth app (see below)
- Optional: Resend account (contact form email delivery), Turso account (production DB)

## Local setup

```bash
npm install
cp .env.example .env    # fill in the values (table below)
npm run db:migrate      # prisma migrate dev — creates dev.db
npm run db:seed         # default settings, sections, placeholder content
npm run dev             # http://localhost:3000
```

Quality gates: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run preview`.
Database tooling: `npm run db:studio` (Prisma Studio), `npm run db:migrate`, `npm run db:seed`.

## Environment variables

All variables live in `.env` (gitignored); `.env.example` documents each one.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma datasource — `file:./dev.db` in dev, `libsql://…` in prod |
| `TURSO_DATABASE_URL` | Turso connection URL (prod; when set, the app uses Turso instead of the local file) |
| `TURSO_AUTH_TOKEN` | Turso auth token (prod) |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `ADMIN_GITHUB_USERNAME` | GitHub username of the single allowlisted admin |
| `NUXT_SESSION_PASSWORD` | ≥ 32-char secret sealing session cookies (`openssl rand -hex 32`) |
| `RESEND_API_KEY` | Resend API key for contact-form delivery (empty = store only, no email) |
| `CONTACT_TO_EMAIL` | Inbox that receives contact-form emails |
| `ANALYTICS_SALT` | Optional HMAC salt seed for visitor hashes (rotates daily regardless) |
| `ANALYTICS_RETENTION_MONTHS` | Pageview retention window, default `12` |
| `NUXT_PUBLIC_SITE_URL` | Canonical site URL used for sitemap/canonical/og:url (e.g. `https://example.com`) |

## GitHub OAuth setup

GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**:

- **Dev app**: homepage `http://localhost:3000`, callback
  `http://localhost:3000/api/auth/github`. Client ID/secret go into `.env`.
- **Prod app**: separate app, callback `https://<your-domain>/api/auth/github`.
  Credentials go into Vercel env vars (never committed).

Set `ADMIN_GITHUB_USERNAME` to your GitHub username, restart the dev server, then sign in —
that account gets `role=admin`; everyone else gets engagement-only access.

## Admin panel tour (`/admin`)

| Page | What it manages |
|---|---|
| `/admin` | Dashboard — sections, item counts, visibility at a glance |
| `/admin/settings` | Site identity: name, role, tagline, avatar/favicon/resume paths, contact email |
| `/admin/sections` | Reorder home sections (drag-and-drop), toggle visibility |
| `/admin/hero` | Greeting, sub-headline, CTA buttons |
| `/admin/about` | Bio, portrait path, highlight stats |
| `/admin/skills` | Skill CRUD (name, icon, category, proficiency) |
| `/admin/experience` | Experience CRUD (company, role, period, bullets, tech) |
| `/admin/projects` | Project CRUD (title, slug, summary, description, hero image, links, featured) |
| `/admin/education` | Education CRUD |
| `/admin/links` | Social/contact links |
| `/admin/contact` | Contact blurb + footer text |
| `/admin/theme` | Primary/Accent colors with live light/dark preview and contrast warning |
| `/admin/seo` | Default title/description/OG image + per-page overrides |
| `/admin/comments` | Comment moderation (soft delete) |
| `/admin/analytics` | Views, uniques, top pages/referrers, device/browser split, 7/30/90-day chart |
| `/admin/messages` | Contact-form inbox with delivery status |

## Adding assets

Two ways to attach images/files in the admin panel:

- **Upload (images)** — every asset field has an Upload button. The image is stored in the
  database (`Media` table, so uploads work on serverless deploys) and served at
  `/api/media/<id>` with immutable cache headers. Limits: PNG/JPEG/WebP/AVIF/GIF, 2 MB max.
  A new upload gets a new URL, so replacing an image never hits stale caches.
- **Repo-committed files** — drop the file under `public/assets/` (git commit) and reference
  it as `/assets/<filename>`; fields validate existence and show an inline preview. Use this
  for non-image files like `resume.pdf`.

## Admin recovery

If the wrong GitHub account was allowlisted (or you locked yourself out):

1. Edit `.env` (or the Vercel env var) and set `ADMIN_GITHUB_USERNAME` to the correct GitHub username.
2. Restart the app (redeploy on Vercel).
3. Sign in again — sessions are sealed cookies, so the role is recomputed from the env var at login.

## Production deploy

### 1. Turso (production database)

```bash
brew install tursodatabase/tap/turso   # or see https://docs.turso.tech
turso auth signup && turso auth login
turso db create portfolio
turso db show portfolio --url          # → libsql://portfolio-….turso.io
turso db tokens create portfolio       # → auth token
```

Set in Vercel (or your shell for the migration step):

```
TURSO_DATABASE_URL=libsql://portfolio-….turso.io
TURSO_AUTH_TOKEN=<token>
```

Apply schema + seed against prod (run locally with the prod values inline — keep them
OUT of your local `.env`, otherwise the dev server starts using the prod database):

```bash
# Prisma's CLI can't speak libsql:// (P1013), so prod migrations go through
# scripts/migrate-prod.ts — applies pending prisma/migrations/* via the libSQL
# client with the same _prisma_migrations bookkeeping; safe to re-run.
TURSO_DATABASE_URL="$TURSO_DATABASE_URL" TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN" npm run db:migrate:prod
TURSO_DATABASE_URL="$TURSO_DATABASE_URL" TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN" npm run db:seed
```

The seed script targets Turso automatically when `TURSO_DATABASE_URL` is set and never
overwrites existing rows (safe to re-run).

### 2. Vercel

1. Import the repo into Vercel (Nuxt is auto-detected; Nitro uses the `vercel` preset).
2. Add all env vars from the table above. Generate the session password with
   `openssl rand -hex 32`.
3. Create the **prod** GitHub OAuth app (callback `https://<domain>/api/auth/github`) and set
   its credentials.
4. Attach your custom domain and set `NUXT_PUBLIC_SITE_URL=https://<domain>` — canonical URLs,
   sitemap and og:image absolute URLs all derive from it.
5. Deploy. Admin edits go live within ~5 seconds (public API cache TTL), no rebuilds needed.

### 3. Resend (contact-form email)

1. Add and verify your sending domain in Resend (SPF/DKIM records).
2. The default sender in `server/utils/email.ts` is `onboarding@resend.dev` (Resend's shared
   test sender — fine for trying it out). Replace it with an address on your verified domain.
3. Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL`.

Messages are always stored in the admin inbox first, so a Resend outage never loses a
submission (`emailDelivered=false` is surfaced in the inbox).

## Known limits

- **In-memory rate limiter** — the token bucket (auth/comment/like/contact endpoints) resets
  on every serverless cold start and is per-instance, so limits are approximate on Vercel.
  Upgrade path: swap `server/utils/rateLimit.ts` for a KV-backed store (e.g. Vercel KV /
  Upstash Redis).
- **Analytics retention purge** — old pageviews are purged on instance startup and then every
  24 h by an in-process interval; on serverless it piggybacks cold starts, so a warm-free
  period simply delays the purge until the next cold start (never loses data early — it only
  deletes rows older than `ANALYTICS_RETENTION_MONTHS`).
- **SQLite ↔ Turso** — dev and prod share the same `@prisma/adapter-libsql` adapter; the only
  difference is the connection URL (`file:` vs `libsql://`), selected by env vars in
  `server/utils/db.ts`.
- **Repo assets need a commit; uploads don't** — files under `public/assets/` are committed,
  while admin-uploaded images live in the `Media` table and are served from `/api/media/<id>`
  (works on serverless, where `public/` is read-only).

## Project docs

- `PRD.md` — product requirements (features, data model, metrics)
- `DEV_PLAN.md` — milestone plan, technical decisions log, progress tracker
