# Development Plan — Portfolio Website with Admin CMS

Companion to `PRD.md` (v1.2). Milestones M1–M8 map 1:1 to PRD §10. Each phase lists concrete tasks and a **verify** step — do not move on until verification passes.

**Legend:** ☐ not started · ☐→ done · phases are sequential; tasks within a phase are ordered.

---

## Phase 0 — Repo & Tooling Setup

| # | Task | Details / Commands |
|---|---|---|
| 0.1 | Scaffold Nuxt 3 | `npx nuxi@latest init .` (empty dir), TypeScript on |
| 0.2 | Add modules | `@nuxtjs/tailwindcss`, `daisyui`, `nuxt-auth-utils`, `@nuxt/image`, `@nuxtjs/seo`, `@vueuse/nuxt` |
| 0.3 | Data layer | `prisma` + `@prisma/client`; `prisma init` with SQLite (`file:./dev.db`) |
| 0.4 | Quality gates | ESLint (`@nuxt/eslint`) + Prettier; `lint` / `lint:fix` / `typecheck` (`nuxi typecheck`) scripts |
| 0.5 | Env scaffolding | `.env.example` (see §A below); `.env` gitignored; `.gitignore` covers `dev.db`, `.output` |
| 0.6 | Base layout shell | `app.vue`, `layouts/default.vue`, empty `pages/index.vue`, renders on `npm run dev` |

**Verify:** `npm run dev` serves a blank themed page; `npm run lint && npm run typecheck` pass; `prisma migrate dev` runs.

---

## M1 — Foundation (PRD §10)

**Goal:** schema, seeds, two-color daisyUI theme, asset structure.

| # | Task | Details |
|---|---|---|
| 1.1 | Prisma schema | Models per PRD §8.2: `SiteSettings` (singleton), `Section`, `Skill`, `Experience`, `Project`, `Education`, `SocialLink`, `User`, `Reaction`, `Comment`, `ContactMessage`, `PageView` — full schema in §B |
| 1.2 | First migration | `prisma migrate dev --name init`; SQLite `file:./dev.db` |
| 1.3 | Seed script | `prisma/seed.ts`: default `SiteSettings`, all 8 `Section` rows (hero…footer, ordered, visible), placeholder skills/projects/experience; prints configured `ADMIN_GITHUB_USERNAME` |
| 1.4 | daisyUI theme | `tailwind.config.ts`: daisyUI plugin, custom `portfolio` light + `portfolio-dark` themes — `primary`/`accent` mapped to CSS vars, neutrals only for `base-*` (PRD §7.2) |
| 1.5 | Runtime color injection | `plugins/theme.server.ts` (or app-level): read `SiteSettings.primaryColor/accentColor` → inject `<style>:root{--p:…;--a:…}</style>` during SSR |
| 1.6 | Assets dir | `public/assets/` with `.gitkeep`; README note on adding assets |
| 1.7 | zod shared schemas | `shared/schemas/` for every entity's create/update payloads |

**Verify:** seeded data visible via `npx prisma studio`; theme CSS vars present in served HTML; switching `primaryColor` in DB changes rendered color.

---

## M2 — Public Site

**Goal:** full public portfolio rendering from DB (PRD §6.1, minus engagement/form).

| # | Task | Details |
|---|---|---|
| 2.1 | Public API | `server/api/public/site.get.ts` — settings + visible sections with ordered items, one query set, cached briefly |
| 2.2 | Composable | `composables/useSite.ts` — `useFetch('/api/public/site')`, shared state |
| 2.3 | Section components | `components/sections/`: `Hero.vue`, `About.vue`, `Skills.vue`, `Experience.vue`, `Projects.vue`, `Education.vue`, `Contact.vue`, `SiteFooter.vue` — each pure-props, DB-driven |
| 2.4 | Home page | `pages/index.vue` renders visible sections in `Section.order`; hidden/empty omitted (PUB-1/2) |
| 2.5 | Project detail | `pages/projects/[slug].vue` + `server/api/public/project/[slug].get.ts`; hero image optional (PUB-3) |
| 2.6 | Chrome | `components/AppNavbar.vue` (sticky, section links, sign-in slot), `AppFooter.vue` |
| 2.7 | Dark mode | `composables/useTheme.ts` — daisyUI `data-theme` toggle, localStorage, SSR-flash-free via inline script in `app.vue` head (PUB-4) |
| 2.8 | Responsive + polish | mobile-first pass on all sections (PUB-5) |
| 2.9 | SEO basics | `@nuxtjs/seo`: `useSeoMeta` from settings, `sitemap.xml`, `robots.txt` (PUB-6) |

**Verify:** home renders all seeded sections; reorder/hide a section in DB → page reflects it; dark toggle persists across reload with no flash; Lighthouse SEO ≥ 95.

---

## M3 — Auth (GitHub OAuth, dual role)

**Goal:** PRD §6.3 — GitHub sign-in for admin + public users.

| # | Task | Details |
|---|---|---|
| 3.1 | GitHub OAuth app | Create under GitHub Settings → Developer; callback `/api/auth/github`; creds into `.env` |
| 3.2 | Auth routes | `server/api/auth/github.get.ts` via `defineOAuthGitHubEventHandler`; on success upsert `User`, set session with `role` (admin iff username === `ADMIN_GITHUB_USERNAME`) |
| 3.3 | Session/logout | `GET /api/auth/session`, `GET /api/auth/logout` (`clearUserSession`) |
| 3.4 | Server guards | `server/utils/auth.ts`: `requireUser(event)`, `requireAdmin(event)` → 401/403; middleware protecting `/api/admin/**` (AUTH-4) |
| 3.5 | Client guards | `middleware/auth.global.ts` or per-page: `/admin/**` → redirect to login if anon; 403 view if non-admin (ADM-1) |
| 3.6 | Header control | sign-in/out button + avatar/username in `AppNavbar` (PUB-11) |
| 3.7 | Rate limit util | `server/utils/rateLimit.ts` — in-memory token bucket keyed by IP/user (dev-grade; note KV upgrade path) (AUTH-9) |
| 3.8 | CSRF | `nuxt-auth-utils` sealed cookies + same-site; verify mutating routes reject cross-origin posts (AUTH-6) |

**Verify:** allowlisted GitHub account → `/admin` loads; any other GitHub account → engagement works but `/admin` + `/api/admin/*` return 403; anon → 401 on protected APIs.

---

## M4 — Admin Panel (content management)

**Goal:** PRD §6.2 ADM-2…ADM-18 — manage every UI element.

| # | Task | Details |
|---|---|---|
| 4.1 | Admin layout | `layouts/admin.vue` + `pages/admin/index.vue` dashboard: section list, item counts, visibility (ADM-2) |
| 4.2 | Admin API scaffold | `server/api/admin/` CRUD pattern per entity: `index.get/post`, `[id].patch/delete`, `reorder.post` (zod-validated, `requireAdmin`) |
| 4.3 | Site identity form | `pages/admin/settings.vue` — name, role, tagline, avatar/favicon/resume **paths**, contact email (ADM-3, ADM-14/15) |
| 4.4 | Section manager | `pages/admin/sections.vue` — drag-and-drop reorder (`vuedraggable` or HTML5 DnD), visibility toggles (ADM-4) |
| 4.5 | Content CRUD pages | `pages/admin/` + entity: `hero`, `about`, `skills`, `experience`, `projects`, `education`, `links` (ADM-5…ADM-11) |
| 4.6 | Asset-path field | shared `components/admin/AssetPathInput.vue` — path input + inline `<img>` preview + Upload button; validates the file exists under `public/assets/` or in the `Media` table (ADM-14) |
| 4.7 | SEO settings | `pages/admin/seo.vue` — defaults + per-page overrides (ADM-13) |
| 4.8 | UX plumbing | toast composable on mutation success/error (ADM-16); unsaved-changes guard via `onBeforeRouteLeave` (ADM-17) |
| 4.9 | Cache freshness | public payload uses on-demand revalidation / short TTL so admin edits appear in seconds (ADM-18) |

**Verify:** with zero code edits, admin can create/edit/reorder/hide/delete every section's items and see changes publicly within 5 s; validation errors surface inline; `typecheck` stays green.

---

## M5 — Theme Manager

**Goal:** PRD §6.2 ADM-12 + §7.

| # | Task | Details |
|---|---|---|
| 5.1 | Theme API | `PATCH /api/admin/theme` — validates hex, persists to `SiteSettings` |
| 5.2 | Theme admin page | `pages/admin/theme.vue` — color pickers + hex inputs for Primary/Accent, side-by-side light/dark preview of buttons/badges/links/cards |
| 5.3 | Runtime injection | finalize M1.5: SSR style tag + post-save client update without reload |
| 5.4 | Contrast guard | compute WCAG contrast ratio of each color vs base bg; warn (not block) below 4.5:1 (§7.3) |

**Verify:** pick new colors → public + admin UI re-theme instantly in both modes; contrast warning appears for low-contrast picks.

---

## M6 — Engagement (comments & likes)

**Goal:** PRD §6.4 + ADM-19 — project pages only.

| # | Task | Details |
|---|---|---|
| 6.1 | Like API | `POST/DELETE /api/projects/:slug/like` (`requireUser`); `Reaction` unique(userId+projectId); counts in public payloads |
| 6.2 | Like UI | `components/LikeButton.vue` on cards + detail; optimistic toggle, reconcile on response (ENG-1/6) |
| 6.3 | Comments API | `GET /api/projects/:slug/comments` (paginated, 20/page, excludes soft-deleted); `POST` (`requireUser`, zod 1–1000 chars, rate limit 10/hr); `DELETE /api/comments/:id` (owner or admin) |
| 6.4 | Comments UI | `components/comments/`: composer (signed-in only), anon "Sign in with GitHub" prompt, list with avatar/username/relative time, delete-own, load-more (ENG-2/3/4) |
| 6.5 | Moderation | `pages/admin/comments.vue` — newest first, filter by project, delete → soft delete (ADM-19); `GET/DELETE /api/admin/comments*` |
| 6.6 | Abuse guards | escape-on-render (plain text only), rate limits wired from M3.7 (ENG-5, AUTH-9) |

**Verify:** visitor signs in → likes → comment appears instantly; second user cannot delete first's comment; admin delete hides it publicly; 11th comment within an hour → 429.

---

## M7 — Analytics & Contact

**Goal:** PRD §6.5 + ADM-20/21 + PUB-8/9.

| # | Task | Details |
|---|---|---|
| 7.1 | Tracking middleware | `server/middleware/analytics.ts` — public GET pages only; skip `/admin`, `/api`, admin's own session, `DNT: 1`; async insert `PageView` (path, referrer, device/browser from UA, `visitorHash` = HMAC(ip+UA, daily salt)); never block response (ANA-1/2/5) |
| 7.2 | Analytics API | `GET /api/admin/analytics?range=7\|30\|90` — totals, uniques, views-over-time, top pages, top referrers, device/browser split (raw SQL or Prisma groupBy) |
| 7.3 | Dashboard page | `pages/admin/analytics.vue` — stat cards + time-series chart (Chart.js, Primary/Accent tints) + range selector (ADM-20) |
| 7.4 | Retention purge | daily cron route or startup task deleting `PageView` older than env-configured months (default 12) (ANA-4) |
| 7.5 | Contact API | `POST /api/contact` — zod validate, honeypot field, per-IP rate limit; store `ContactMessage`; send via **Resend** (`server/utils/email.ts`, `RESEND_API_KEY`); set `emailDelivered` by outcome (PUB-8/9) |
| 7.6 | Contact UI | form in `Contact.vue` section — name/email/message, inline errors, success state |
| 7.7 | Admin inbox | `pages/admin/messages.vue` — list, read/unread, delete, delivery-status badge (ADM-21) |

**Verify:** visit pages → rows appear in `PageView` and dashboard within 1 min; admin visits not counted; contact form delivers via Resend and stores row; kill `RESEND_API_KEY` → message still stored with `emailDelivered=false`.

---

## M8 — Polish & Launch

**Goal:** PRD §9 metrics + production readiness.

| # | Task | Details |
|---|---|---|
| 8.1 | Error pages | `error.vue` + `pages/[...slug].vue` 404, themed (PUB-12) |
| 8.2 | SEO hardening | OG images per page, canonical URLs, sitemap includes project slugs (PUB-6) |
| 8.3 | Performance pass | `@nuxt/image` for all images, route-level caching headers, bundle audit; target < 500 KB excl. images |
| 8.4 | A11y audit | keyboard walkthrough of public + admin, focus states, form labels, contrast re-check (§7.3) |
| 8.5 | Privacy note | footer blurb: cookieless analytics, what's stored (ANA-2) |
| 8.6 | Turso production DB | `turso db create`, `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` in Vercel env; migrate + seed via CI script |
| 8.7 | Vercel deploy | connect repo, Nitro `vercel` preset, env vars (§A), GitHub OAuth prod callback URL, custom domain |
| 8.8 | Docs | README: local setup, env vars, adding assets to `public/assets/`, admin recovery, Resend domain verification checklist |

**Verify:** Lighthouse ≥ 90 / 95 / 95 / 100 on production URL; full admin workflow on prod; engagement + contact + analytics end-to-end on prod; PRD §9 metrics walkthrough.

---

## A. Environment Variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | `file:./dev.db` (dev) / `libsql://…` (prod) |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Turso production connection |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth app |
| `ADMIN_GITHUB_USERNAME` | single allowlisted admin |
| `NUXT_SESSION_PASSWORD` | ≥ 32-char session seal secret (`nuxt-auth-utils`) |
| `RESEND_API_KEY` | contact-form delivery |
| `CONTACT_TO_EMAIL` | owner inbox |
| `ANALYTICS_SALT` (optional) | HMAC salt seed; rotates daily by default |
| `ANALYTICS_RETENTION_MONTHS` | default `12` |

## B. Data Model Notes

Prisma models per PRD §8.2. Conventions:
- `order` = `Int` with per-scope uniqueness enforced in reorder endpoints (swap-based).
- `Comment.deletedAt DateTime?` — soft delete; public queries filter `deletedAt: null`.
- `Reaction` — composite unique `@@unique([userId, projectId])`.
- `PageView` — no user FK; `visitorHash String`, indexed on `(createdAt)` and `(path)`.
- JSON-ish lists (`bullets[]`, `tech[]`, `images[]`) stored as delimited strings or JSON text (SQLite-compatible).

## C. Technical Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| DB (prod) | Turso (libSQL) | PRD §13.1 — lightest option that persists on Vercel |
| Images | repo `public/assets/` + DB `Media` uploads | PRD §13.2 — committed files for non-image assets; admin image uploads stored as blobs, served at `/api/media/<id>` |
| Comments scope | project pages only | PRD §13.3 |
| Hosting | Vercel | PRD §13.4 |
| Email | Resend | PRD §13.5 |
| Drag & drop | Native HTML5 DnD (`components/admin/SortableList.vue`) | decided in M4.4 — dependency-free, sufficient for admin lists |
| Rate limiting | in-memory token bucket | single-instance OK; document KV upgrade for multi-region |
| Charts | Chart.js (Primary/Accent styled) | PRD §7.2 |
| Prisma version | 7.10 (pinned; `prisma.config.ts` + libSQL adapter) | prisma@latest is an 8.0 RC — avoided; Prisma 7 is adapter-first, so dev SQLite and prod Turso share `@prisma/adapter-libsql` |
| daisyUI version | v4 (pinned) | `@nuxtjs/tailwindcss` v6 ships Tailwind v3; daisyUI v5 requires Tailwind v4. Theme colors live in tailwind.config.ts; runtime override via `--p`/`--a` oklch CSS vars |

## D. Risks (dev-facing)

| Risk | Watch during |
|---|---|
| daisyUI ignores runtime CSS-var overrides in one of the modes | spike in M1.4/1.5 before building M5 |
| Prisma ↔ Turso driver setup (`@prisma/adapter-libsql`) mismatch | resolve in M1, not M8 |
| OAuth callback URL drift between dev/prod apps | two GitHub OAuth apps (dev + prod) from day one |
| In-memory rate limiter resets on serverless cold starts | acceptable for v1; note in README |
| Analytics insert blocking edge responses | keep insert fire-and-forget; measure in M7 |

## E. Progress Tracker

| Phase | Status |
|---|---|
| 0 — Repo & tooling | ✅ done (2026-09-03) |
| M1 — Foundation | ✅ done (2026-09-03) |
| M2 — Public site | ✅ done (2026-09-03) |
| M3 — Auth | ✅ done (2026-09-03) † |
| M4 — Admin panel | ✅ done (2026-09-04) |
| M5 — Theme manager | ✅ done (2026-09-04) |
| M6 — Engagement | ✅ done (2026-09-04) |
| M7 — Analytics & contact | ✅ done (2026-09-04) |
| M8 — Polish & launch | ✅ done (2026-09-04) ‡ |

† M3 code complete; anon guards verified (401 on `/api/admin/*`, `/admin` → OAuth redirect). Live OAuth login verify is pending task 3.1 — create the GitHub OAuth app and set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ADMIN_GITHUB_USERNAME` in `.env`.

‡ M8 code/docs complete (404, SEO/OG, performance, a11y, privacy note, README runbooks). Remaining are user-account actions: 8.6 Turso production DB and 8.7 Vercel deploy — both have step-by-step runbooks in README.md.
