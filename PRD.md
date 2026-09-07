# PRD — Personal Portfolio Website with Admin CMS

| | |
|---|---|
| **Document** | Product Requirements Document |
| **Version** | 1.2 |
| **Date** | 2026-09-03 |
| **Status** | Draft |
| **Owner** | Manikandan K |

**Changelog**
- **1.2** — Resolved all open questions: Turso (SQLite/libSQL) for production DB, image assets committed to repo (minimal usage), comments scoped to project pages only, Vercel hosting, Resend for email delivery.
- **1.1** — Added visitor engagement (comments & likes via public GitHub login), built-in visitor analytics dashboard, and a contact form with email delivery.

---

## 1. Overview

A personal portfolio website built with **Nuxt 3 (Vue 3 + Vite)**, styled with **Tailwind CSS + daisyUI**, deployed on **Vercel**. All content and UI elements of the portfolio are managed through a protected **Admin Panel** — no content is hardcoded. Access to the admin panel is restricted to a single admin via **GitHub OAuth login**.

Visitors can optionally **sign in with their own GitHub account** to **like projects and post comments** (project pages only). The site includes a **built-in, privacy-friendly visitor analytics** pipeline with an **admin dashboard**, and a **contact form** that delivers messages to the owner's email via **Resend**.

The site follows a **modern, minimal** design language driven by exactly two brand colors — a **Primary** color and an **Accent** color — configured in the admin panel, on top of a neutral (light/dark) base. Images are used sparingly, only where they add real value, and are committed to the repo as static assets.

## 2. Goals & Objectives

- Present work, experience, skills, and contact information on a fast, polished public site.
- Allow the admin (site owner) to create, edit, reorder, hide, and delete **every UI element/section** of the portfolio without touching code or redeploying.
- Secure the admin area with GitHub OAuth — no password management.
- Let visitors engage (like, comment) using their GitHub identity — no custom account system.
- Give the admin visibility into traffic through a built-in analytics dashboard (page views, visitors, referrers) without third-party trackers.
- Let visitors email the owner directly through a contact form.
- Ship a distinctive yet minimal visual identity with a strict two-color system.
- Achieve excellent SEO, performance (Lighthouse ≥ 90), and accessibility (WCAG 2.1 AA).

## 3. Non-Goals (Out of Scope)

- Multi-admin support (exactly one admin; public users get engagement-only accounts via GitHub).
- Public accounts with email/password — GitHub OAuth is the only public sign-in method.
- Site-wide guestbook or comments outside project pages.
- Media library / runtime image uploads in the admin — image assets are committed to the repo instead.
- Comment threading/replies and email notifications for comment activity (v2).
- Blog engine with markdown editor (may be a future phase — see §12).
- E-commerce, newsletter subscriptions.
- Localization/i18n (English only for v1).

## 4. Target Users

| User | Description | Needs |
|---|---|---|
| **Visitor** | Recruiters, hiring managers, peers, clients | Quickly understand who the owner is, see work/projects, and contact them |
| **Engaged visitor** | A visitor who signs in with GitHub | Like projects, post comments on project pages, manage their own comments |
| **Admin** | The site owner (single user) | Update any portfolio content/theme, moderate comments, view analytics and contact messages — all from a browser, with zero deployments |

## 5. User Stories

**Visitor**
- As a visitor, I can view the home page with hero, about, skills, experience, projects, education, and contact sections in a clean, readable layout.
- As a visitor, I can open individual project detail pages.
- As a visitor, I can see like counts and comments on projects without signing in.
- As a visitor, I can toggle light/dark mode, and my preference persists.
- As a visitor, I can reach the owner via contact links **or a contact form that emails the owner**.
- As a visitor, sections the admin has hidden are not rendered anywhere.

**Engaged visitor (GitHub-authenticated)**
- As an engaged visitor, I can sign in/out with my GitHub account.
- As an engaged visitor, I can like/unlike a project (one like per user per project).
- As an engaged visitor, I can post a comment on a project page and delete my own comments.
- As an engaged visitor, my GitHub username and avatar appear next to my comments.

**Admin**
- As the admin, I can log in with my GitHub account; only my allowlisted account gets admin rights.
- As the admin, I can see a dashboard listing all manageable sections.
- As the admin, I can edit site identity (name, role, tagline, avatar/logo, favicon).
- As the admin, I can add/edit/reorder/hide/delete items in every section (skills, experience, projects, education, social links).
- As the admin, I can reorder sections themselves on the home page and toggle their visibility.
- As the admin, I can change the Primary and Accent colors and see them applied site-wide instantly.
- As the admin, I can manage SEO metadata (title, description, OG image) per page.
- As the admin, I can view and delete any comment (moderation).
- As the admin, I can view an analytics dashboard: page views, unique visitors, top pages, top referrers, device/browser breakdown, over selectable date ranges.
- As the admin, I can read contact form submissions in an inbox (even if email delivery fails).
- As the admin, I can log out, and my session expires automatically.

## 6. Functional Requirements

### 6.1 Public Site

| ID | Requirement | Priority |
|---|---|---|
| PUB-1 | Single-page home composed of ordered sections: Hero, About, Skills, Experience, Projects, Education, Contact, Footer — order & visibility driven by admin config | Must |
| PUB-2 | Each section renders from the database; empty/hidden sections are omitted cleanly (no blank gaps) | Must |
| PUB-3 | Project detail page per project: `/projects/:slug` with description, tech stack, links, and an optional hero image | Must |
| PUB-4 | Light/dark mode toggle; preference persisted (localStorage + SSR-safe, no flash) | Must |
| PUB-5 | Responsive: mobile-first, breakpoints for tablet/desktop | Must |
| PUB-6 | SEO: per-page meta/OG/Twitter tags, `sitemap.xml`, `robots.txt`, semantic HTML | Must |
| PUB-7 | Contact section renders admin-configured links (email, GitHub, LinkedIn, X, etc.) | Must |
| PUB-8 | **Contact form**: fields name, email, message → validates, sends email to the owner via Resend, stores the message in the DB inbox, shows success/error state | Must |
| PUB-9 | Contact form spam protection: honeypot field + per-IP rate limiting | Must |
| PUB-10 | Project cards and detail pages display like counts and comment counts | Must |
| PUB-11 | GitHub sign-in/out control in the site header; signed-in state shows avatar + username | Must |
| PUB-12 | 404 and error pages styled consistently with the theme | Should |
| PUB-13 | Resume/CV download link (PDF committed under `public/assets/`, path configurable in admin) | Should |
| PUB-14 | Subtle scroll-reveal animations, respecting `prefers-reduced-motion` | Could |

### 6.2 Admin Panel (`/admin`)

| ID | Requirement | Priority |
|---|---|---|
| ADM-1 | `/admin` routes are fully protected; unauthenticated users are redirected to GitHub login; non-admin authenticated users get 403 | Must |
| ADM-2 | Dashboard: overview of sections, item counts, visibility state | Must |
| ADM-3 | **Site Identity**: edit name, role/headline, tagline, avatar path, favicon path | Must |
| ADM-4 | **Section Manager**: reorder home sections (drag-and-drop), toggle visibility per section | Must |
| ADM-5 | **Hero**: edit greeting, headline, sub-headline, CTA button(s) (label + link) | Must |
| ADM-6 | **About**: rich text bio, portrait photo path, highlight stats (e.g., years of experience) | Must |
| ADM-7 | **Skills**: CRUD with name, optional icon, category, proficiency; reorder within category | Must |
| ADM-8 | **Experience**: CRUD with company, role, period, location, description bullets, tech tags, logo path; reorder | Must |
| ADM-9 | **Projects**: CRUD with title, slug, summary, rich description, optional hero image path, tech tags, repo/live links, featured flag; reorder | Must |
| ADM-10 | **Education**: CRUD with institution, degree, period, notes | Must |
| ADM-11 | **Social/Contact Links**: CRUD with label, URL, icon | Must |
| ADM-12 | **Theme**: pick Primary and Accent colors (color picker + hex input); applies site-wide immediately; light/dark variants preview | Must |
| ADM-13 | **SEO settings**: default title/description/OG image path + per-page overrides | Should |
| ADM-14 | **Asset references**: image fields (avatar, project hero, OG image, logos) accept a repo path under `public/assets/` or an uploaded image (DB blob in `Media` table, served at `/api/media/<id>`), with inline preview and an upload button | Must |
| ADM-15 | Resume PDF path configurable (default `/assets/resume.pdf`) | Should |
| ADM-16 | All admin forms validated (client + server), with success/error toasts | Must |
| ADM-17 | Unsaved-changes guard on forms | Should |
| ADM-18 | No public caching issues: public site reflects admin changes within seconds (ISR on-demand revalidation or SSR) | Must |
| ADM-19 | **Comment moderation**: list all comments (newest first, filterable by project), delete any comment; deleted comments are soft-deleted and hidden publicly | Must |
| ADM-20 | **Analytics dashboard**: page views, unique visitors, top pages, top referrers, device/browser split, time-series chart; date-range selector (7/30/90 days) | Must |
| ADM-21 | **Contact inbox**: list messages from the contact form (name, email, message, date, delivery status), mark read/unread, delete | Must |

### 6.3 Authentication (GitHub OAuth)

| ID | Requirement | Priority |
|---|---|---|
| AUTH-1 | Sign-in exclusively via GitHub OAuth using `nuxt-auth-utils` (`oauth.github` event handler), for both admin and public users | Must |
| AUTH-2 | The GitHub account matching `ADMIN_GITHUB_USERNAME` (env var) is granted `role=admin`; all other GitHub users are granted `role=user` (engagement only) — admin routes return 403 for them | Must |
| AUTH-3 | Sessions are secure, sealed, HTTP-only cookies (default of `nuxt-auth-utils`) with configurable max age | Must |
| AUTH-4 | Server middleware protects every `/api/admin/*` route — never rely on client-side guards alone | Must |
| AUTH-5 | Logout clears the session | Must |
| AUTH-6 | CSRF protection on all mutating routes (admin and engagement) | Must |
| AUTH-7 | OAuth app credentials (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`) come from environment variables, never committed | Must |
| AUTH-8 | Minimal OAuth scopes (read-only user profile); store only GitHub id, username, avatar URL | Must |
| AUTH-9 | Rate limiting on auth, comment, reaction, and contact endpoints | Must |

### 6.4 Engagement — Comments & Likes

Scope: **project pages only** — no site-wide guestbook in v1.

| ID | Requirement | Priority |
|---|---|---|
| ENG-1 | Like/unlike button on project cards and detail pages; one like per GitHub user per project; counts visible publicly | Must |
| ENG-2 | Comment composer on project detail pages, visible only to signed-in users; anonymous visitors see a "Sign in with GitHub to comment" prompt | Must |
| ENG-3 | Comments list: GitHub avatar + username, relative timestamp, newest first, paginated (e.g., 20/page) | Must |
| ENG-4 | Users can delete their own comments (soft delete); admin can delete any comment | Must |
| ENG-5 | Comment validation: 1–1000 chars, plain text (no HTML rendering), trimmed; per-user rate limit (e.g., 10/hour) | Must |
| ENG-6 | Optimistic UI for like toggle with server reconciliation | Should |
| ENG-7 | Live-like feel without websockets; refetch on focus is acceptable for v1 | Could |

### 6.5 Visitor Analytics (Built-in)

| ID | Requirement | Priority |
|---|---|---|
| ANA-1 | Server-side pageview tracking on public routes via middleware: path, referrer, timestamp, device/browser (parsed from UA), anonymized visitor id (HMAC-hashed IP + UA + daily salt) | Must |
| ANA-2 | **Privacy**: no tracking cookies, no PII stored, honor `DNT: 1`, never track `/admin` or `/api` routes, never track the admin's own visits | Must |
| ANA-3 | Admin dashboard (`/admin/analytics`): total views, unique visitors, views-over-time chart, top pages, top referrers, device/browser split; ranges 7/30/90 days | Must |
| ANA-4 | Data retention: automatic purge of raw pageviews older than 12 months (configurable via env) | Should |
| ANA-5 | Tracking adds negligible overhead (< 5 ms per request, async insert, non-blocking) | Must |

## 7. Design Requirements

### 7.1 Visual Language

- **Modern & minimal**: generous whitespace, strong typographic hierarchy, no decorative clutter, subtle borders/dividers, restrained animation.
- **Two-color system** (hard constraint):
  - **Primary** — brand identity: headings accents, primary buttons, links, key highlights.
  - **Accent** — sparing use: CTAs, active states, hover highlights, badges, like/comment icons, small flourishes.
  - Everything else is **neutral** — background, surface, text (grays derived from a neutral scale, not a third brand color).
- Dark mode: neutrals invert; Primary/Accent remain recognizable with adjusted lightness for contrast.
- **Imagery is minimal by design** — only where it adds real value: avatar, project hero images, OG image, company logos. Prefer typography, icons, and color over photos elsewhere.

### 7.2 Implementation (Tailwind + daisyUI)

- daisyUI custom theme mapped to semantic tokens: `primary`, `accent`, `neutral`, `base-100/200/300` (neutrals only).
- Admin-set colors are injected at runtime as CSS custom properties (e.g., `--p`, `--a` overrides), so theme changes need no rebuild.
- Typography: one geometric/humanist sans (e.g., Inter, or system stack) with a modular scale.
- Icons: a single consistent set (e.g., `lucide` / `simple-icons` for brand icons).
- Layout: max-width container (~72rem), consistent vertical rhythm, sticky minimal navbar with section links and the GitHub sign-in control.
- Analytics charts: minimal SVG/Chart.js styling using only Primary/Accent tints, consistent with the two-color rule.

### 7.3 Accessibility

- Color contrast for Primary/Accent against backgrounds must meet WCAG AA (4.5:1 for text); admin color picker warns when contrast fails.
- Keyboard-navigable admin and public UI; visible focus states; semantic landmarks; alt text enforced on every image used.
- Comment composer and contact form have proper labels, error announcements, and work without a mouse.

## 8. Technical Requirements

### 8.1 Stack

| Layer | Choice |
|---|---|
| Framework | **Nuxt 3** (Vue 3, `<script setup>`, TypeScript) |
| UI | **Tailwind CSS** (`@nuxtjs/tailwindcss`) + **daisyUI** |
| Auth | `nuxt-auth-utils` GitHub OAuth (admin + public roles) |
| Server | Nitro server routes (`/api/...`) |
| Database | **SQLite via Prisma** in dev; **Turso (libSQL)** in production — the lightest serverless-friendly option, queried over HTTP |
| Validation | `zod` schemas shared between client forms and server routes |
| Email | **Resend** (transactional email API) called from a Nitro server route; `RESEND_API_KEY` via env |
| Analytics | Self-built: server middleware + `PageView` table + Chart.js (or hand-rolled SVG) for the dashboard |
| Images/assets | **Hybrid**: files committed under `public/assets/` (optimized via `@nuxt/image`) plus admin runtime image uploads stored in the DB (`Media` table), served at `/api/media/<id>` |
| Deployment | **Vercel** (Nitro `vercel` preset) with a custom domain |

### 8.2 Data Model (indicative)

- `SiteSettings` (singleton): name, role, tagline, avatarPath, faviconPath, resumePath, primaryColor, accentColor, seo defaults, contactEmail
- `Section`: key (hero/about/skills/...), title, subtitle, order, visible
- `Skill`: name, icon, category, proficiency, order
- `Experience`: company, role, location, startDate, endDate?, bullets[], tech[], logoPath, order
- `Project`: title, slug (unique), summary, description, heroImagePath?, tech[], repoUrl?, liveUrl?, featured, order
- `Education`: institution, degree, startDate, endDate?, notes, order
- `SocialLink`: label, url, icon, order
- `User`: githubId (unique), username, avatarUrl, role (`ADMIN` | `USER`), createdAt
- `Reaction`: userId, projectId, unique(userId + projectId), createdAt
- `Comment`: projectId, userId, body, createdAt, deletedAt? (soft delete)
- `ContactMessage`: name, email, message, createdAt, readAt?, emailDelivered (bool)
- `PageView`: path, referrer?, device, browser, visitorHash, createdAt

### 8.3 API Surface (indicative)

- Public:
  - `GET /api/public/site` — full public payload (settings + visible ordered sections with items, like/comment counts)
  - `POST /api/contact` — contact form submit (validated, rate-limited, emails via Resend + stores)
  - `GET /api/projects/:slug/comments` — paginated comments
  - `POST/DELETE /api/projects/:slug/like` — toggle like (auth: user)
  - `POST /api/projects/:slug/comments` — post comment (auth: user)
  - `DELETE /api/comments/:id` — delete own comment (or admin)
- Auth:
  - `GET/POST /api/auth/github`, `GET /api/auth/logout`, `GET /api/auth/session`
- Admin (`/api/admin/*`, role=admin):
  - CRUD for each entity, reorder endpoints
  - `GET /api/admin/comments`, `DELETE /api/admin/comments/:id`
  - `GET /api/admin/analytics?range=7|30|90`
  - `GET /api/admin/messages`, `PATCH /api/admin/messages/:id` (read/unread), `DELETE /api/admin/messages/:id`

### 8.4 Non-Functional

- **Performance**: SSR/SSG with on-demand revalidation; Lighthouse ≥ 90 on all categories; minimal imagery by design, optimized via `@nuxt/image`; total page weight < 500 KB excluding images; analytics tracking non-blocking.
- **Security**: server-side session checks, zod validation on all inputs, rate limiting on auth/contact/comment/reaction routes, plain-text-only comments (escape on render), no secrets in client bundle, dependency pinning.
- **Privacy**: cookieless analytics, anonymized visitor hashes with daily-rotating salt, DNT honored, documented in a small privacy note in the footer.
- **Reliability**: DB migrations via Prisma against Turso (run in CI/build step); seed script for initial content; contact messages persist in DB even when Resend fails (`emailDelivered=false`, surfaced in inbox).
- **Configuration**: all secrets via env on Vercel — `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ADMIN_GITHUB_USERNAME`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `RESEND_API_KEY`, `NUXT_SESSION_PASSWORD`.
- **Maintainability**: TypeScript strict, ESLint + Prettier, conventional commits.

## 9. Success Metrics

- Admin can perform all §6.2 "Must" operations with zero code changes and see results publicly in < 5 seconds.
- A visitor can sign in with GitHub, like a project, and post a comment in under 30 seconds; counts update immediately.
- Contact form submissions reach the owner's inbox ≥ 99% of the time; failures are still captured in the admin inbox.
- Analytics dashboard loads 30-day stats in < 1.5 s and shows data within 1 minute of a visit.
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100 on the home page.
- Unauthorized access attempts to `/admin` and `/api/admin/*` always result in 401/403; non-admin GitHub users can never reach admin APIs.
- Zero hardcoded portfolio content in the codebase (all from DB); zero runtime-uploaded media (all assets from the repo).

## 10. Milestones

| Phase | Deliverable |
|---|---|
| **M1 — Foundation** | Nuxt 3 scaffold, Tailwind + daisyUI theme with two-color system, Prisma schema + migrations (SQLite dev / Turso prod), seed data, `public/assets/` structure |
| **M2 — Public Site** | All public sections rendering from DB, responsive layout, light/dark mode, SEO basics |
| **M3 — Auth** | GitHub OAuth via `nuxt-auth-utils`, admin allowlist + public user role, protected API middleware |
| **M4 — Admin Panel** | Dashboard + CRUD for every section, drag-and-drop reordering, visibility toggles, asset-path fields with preview |
| **M5 — Theme Manager** | Admin color picker for Primary/Accent, runtime CSS-variable injection, contrast warning |
| **M6 — Engagement** | Public GitHub sign-in UI, likes, comments (project pages only), rate limiting, admin comment moderation |
| **M7 — Analytics & Contact** | Pageview tracking middleware, admin analytics dashboard, contact form with Resend delivery + inbox |
| **M8 — Polish & Launch** | SEO hardening (sitemap/robots/OG), 404/error pages, performance pass, accessibility audit, privacy note, deploy to Vercel with custom domain |

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Vercel's read-only serverless filesystem can't persist a local SQLite file | Turso (libSQL) over HTTP for production; Prisma datasource URL switched via env; migrations run in CI |
| Uploaded images bloat the DB | 2 MB cap + image-only mimes + 30/hour upload rate limit; free-tier Turso (5 GB) fits thousands of uploads; immutable serving keeps reads minimal |
| Comment spam/abuse by signed-in users | GitHub-auth gate, per-user rate limits, soft-delete moderation, length limits, no HTML rendering |
| Analytics privacy concerns / GDPR-ish exposure | Cookieless design, anonymized rotating hashes, DNT honored, no cross-site tracking, retention purge |
| Email deliverability failures (Resend API key misconfig, domain not verified) | Messages always stored in DB inbox with `emailDelivered` flag; setup documented; sender domain verification checklist in README |
| Runtime theming conflicts with daisyUI's build-time theme | Drive colors through CSS custom properties; verify daisyUI respects overrides in both modes |
| GitHub OAuth misconfiguration locks the admin out | Seed script prints the configured allowlisted username; recovery via direct DB/env change documented |
| Analytics write load slows public requests | Async non-blocking inserts; measure < 5 ms overhead; batch if needed |

## 12. Future Considerations (v2+)

- Blog with markdown editor and RSS (comments naturally extend to posts).
- Comment threading/replies and email notifications for replies.
- Additional reaction types beyond like (emoji set).
- Analytics: goal/event tracking, country-level geo, export to CSV.
- Content versioning / revision history in admin.
- Multi-language support.

## 13. Resolved Decisions

| # | Question | Decision |
|---|---|---|
| 1 | Production database | **Turso (SQLite/libSQL)** — the lightest option that persists on Vercel; plain SQLite file in dev |
| 2 | Image storage | **Hybrid** — files committed under `public/assets/` for repo assets; admin runtime uploads stored as DB blobs (`Media` table, `/api/media/<id>`), ≤ 2 MB images, so serverless deploys need no object-storage account |
| 3 | Comment scope | **Project pages only** — no site-wide guestbook |
| 4 | Hosting & domain | **Vercel** with a custom domain |
| 5 | Email delivery | **Resend** (transactional provider) |
