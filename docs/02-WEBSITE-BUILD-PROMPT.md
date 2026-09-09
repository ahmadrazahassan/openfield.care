# Openfield — Complete Website Build Specification

> **How to use this file.** Paste it into Claude Code (or hand it to a senior developer) as the single source of truth. Build it in the phase order given in §17. Do not deviate from §3 (Non-negotiables) or §4 (Design system) without an explicit decision recorded in the repo.

---

## 0. Role

You are a senior full-stack product engineer and design-systems lead with ten-plus years shipping healthcare and consumer products. You write TypeScript that a team can maintain, you treat accessibility and data privacy as requirements rather than polish, and you have strong opinions about restraint. You have been handed a brand, a colour system, a type system and a set of visual references. Build the product.

You are not decorating. Every element on the page must justify its existence.

---

## 1. The brand

### Name: **Openfield**

**Domain:** `openfield.care` · **Legal entity in footer:** Openfield Care Ltd. · **Wordmark:** `openfield.` — all lowercase, with a green full stop.

**Why this name.** The reference imagery kept returning to one idea: a person alone in a wide-open green field, with nothing crowding them. That is exactly what therapy sells — not a fix, but space. "Openfield" says it in one word, works as a noun and a place, sounds like somewhere you'd go rather than something you'd subscribe to, and is completely free of the wellness-tech naming clichés (no *-ly*, no *-ology*, no *Mind-*, no invented Latin, nothing that sounds like a model release). It also gives us a mark that draws itself: a tangled line that unravels into a flat horizon.

Alternates considered and rejected: **Unknot** (great metaphor, reads slightly cute), **The Clearing** (beautiful, poor domain and search position), **Northlight** (already crowded in wellness).

### Positioning
A mental-health consultancy. Licensed therapists, real appointments, video / phone / in person. It is a booking product wrapped in an editorial brand — not a content site, not a meditation app, not a chatbot.

### Tagline
**"Room to think."**
Secondary line for meta descriptions: *Licensed therapists, booked in minutes. Video, phone, or in person.*

### Voice
Plain, warm, unhurried, adult. Short declarative sentences. Concrete over abstract. It never oversells, never uses the language of transformation, and never performs empathy.

**Write like this:** "You don't need the right words to start." · "Fifty minutes. Same therapist each time." · "Cancel or move a session up to 24 hours before, no charge."

**Never write:** "unlock your potential" · "transform your life" · "your journey to wellness starts here" · "supercharge" · "AI-powered" · "revolutionary" · "we've got you covered" · anything with an exclamation mark.

---

## 2. Tech stack

All versions **latest stable**. Verify before installing — do not pin to versions remembered from training:

```bash
npm view next version && npm view react version && npm view tailwindcss version
```

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (latest stable), App Router** | Server Components by default. `"use client"` only where interaction demands it. |
| Language | **TypeScript**, `strict: true` | `noUncheckedIndexedAccess: true` too. |
| React | **React 19+** | Server Actions for all mutations. |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) | No `tailwind.config.js` colours — tokens live in CSS. |
| Components | **shadcn/ui** (Tailwind v4-compatible release) | Restyle every primitive to the Openfield system. Do not ship default shadcn look. |
| Database / Auth / Storage | **Supabase** (already connected) | `@supabase/supabase-js` + `@supabase/ssr`. |
| Forms | **react-hook-form** + **zod** + `@hookform/resolvers` | One zod schema per form, shared client & server. |
| Dates | **date-fns** + **@date-fns/tz** | All storage in UTC `timestamptz`; all display in the user's IANA zone. |
| Animation | **motion** (the `motion` package) | Subtle only. See §4.8. |
| Icons | **Custom SVG set** from `01-IMAGE-ASSET-PROMPTS.md` §D | `lucide-react` permitted only for UI chrome (chevron, x, check, arrow) — see §3. |
| Email | **Resend** + **react-email** | Booking confirmation, reschedule, cancellation, reminder. |
| Rate limiting | **Upstash Redis** (or Supabase-backed counter) | On contact, auth and booking endpoints. |
| Analytics | **Vercel Analytics** + **Speed Insights** | Privacy-first. No third-party pixels on a mental-health site. |
| Testing | **Vitest** + **Playwright** + **@axe-core/playwright** | |
| Lint / format | **ESLint** (flat config) + **Prettier** + `prettier-plugin-tailwindcss` | |
| Deploy | **Vercel** | |

**Scaffold:**
```bash
npx create-next-app@latest openfield --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

---

## 3. Non-negotiables

These are hard constraints. A build that violates any of them is rejected.

### Visual
1. **No gradients.** Anywhere. No `linear-gradient`, `radial-gradient`, `conic-gradient`, no `bg-gradient-*` utility, no gradient text, no gradient borders, no gradient overlays on images. Darkening an image for text legibility uses a **flat semi-transparent black layer**, not a gradient.
2. **No AI-cliché iconography.** Banned: sparkle, sparkles, star-burst, zap, lightning bolt, wand, magic, bot, robot, brain-with-circuits, chip, atom, orbit, "AI" badges. If a concept can only be drawn as a sparkle, the concept is wrong.
3. **No emoji.** Not in UI, not in copy, not in code comments, not in commit messages, not in seed data.
4. **No glassmorphism, no neumorphism, no glow, no neon, no 3D bevels.**
5. **Shadows:** effectively none. Depth comes from 1px borders and background steps. The single exception is one shared elevation token for floating layers (dropdown, popover, toast, modal) — defined in §4.6 and used nowhere else.
6. **No stock-photo tropes:** no hands-on-shoulder, no smiling-at-laptop, no lotus pose, no sunrise silhouettes.
7. **No dark mode in v1.** The brand is a single off-white page. Ship one theme, done properly. (Set `color-scheme: light` explicitly.)

### Content & ethics
8. **No fabricated credentials, testimonials, statistics or clinician identities.** All placeholder people, quotes and numbers must be visibly marked in seed data (`is_placeholder: true`) and blocked from production by a build-time check.
9. **Crisis safety is a required feature, not a footnote.** Every page carries a route to `/crisis-support`; the booking flow and contact form state plainly that Openfield is not an emergency service. Emergency numbers must be region-verified before launch — leave them as `TODO(region)` placeholders rather than inventing them.
10. **No third-party tracking pixels, no session replay, no ad tech.** Health-adjacent browsing is sensitive by default.

### Engineering
11. **Row Level Security enabled on every table**, with policies written and tested. No table ships without RLS.
12. **The service-role key never reaches the client and never appears in a Server Component that renders user content.** Booking writes go through Server Actions using the user's own session, so RLS enforces authorisation.
13. **No raw hex values outside the token file.** Colours are consumed as CSS variables / Tailwind theme tokens only.
14. **No `any`.** Database types are generated from Supabase, not hand-written.

---

## 4. Design system

### 4.1 Colour tokens

`src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* ── Core brand ────────────────────────────────────────── */
  --color-ink:            #131316;   /* text, borders, dark surfaces */
  --color-page:           #f1f1f1;   /* the entire site background   */
  --color-paper:          #ffffff;   /* cards, inputs, raised areas  */
  --color-signal:         #00d54b;   /* primary CTA fill only        */
  --color-forest:         #0b3b22;   /* diagonal split, dark bands   */
  --color-sand:           #e8e2d6;   /* warm secondary surface       */

  /* ── Ink scale (opacity steps of --color-ink) ──────────── */
  --color-ink-90:         rgb(19 19 22 / 0.90);
  --color-ink-70:         rgb(19 19 22 / 0.70);  /* body copy         */
  --color-ink-55:         rgb(19 19 22 / 0.55);  /* secondary / micro */
  --color-ink-40:         rgb(19 19 22 / 0.40);  /* placeholder       */
  --color-ink-12:         rgb(19 19 22 / 0.12);  /* hairline border   */
  --color-ink-06:         rgb(19 19 22 / 0.06);  /* subtle fill       */

  /* ── On-image ──────────────────────────────────────────── */
  --color-scrim:          rgb(19 19 22 / 0.28);  /* FLAT layer, never a gradient */
  --color-on-image:       #ffffff;

  /* ── Status ────────────────────────────────────────────── */
  --color-success:        #0f7a3d;
  --color-warning:        #8a5a00;
  --color-danger:         #a12a1e;

  /* ── Radii ─────────────────────────────────────────────── */
  --radius-sm:    8px;
  --radius-md:   14px;
  --radius-lg:   20px;
  --radius-xl:   32px;   /* hero card, full-bleed media blocks */
  --radius-pill: 999px;

  /* ── The only shadow in the system ─────────────────────── */
  --shadow-float: 0 8px 28px rgb(19 19 22 / 0.08), 0 1px 2px rgb(19 19 22 / 0.04);

  /* ── Motion ────────────────────────────────────────────── */
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast: 180ms;
  --dur-base: 320ms;
  --dur-slow: 560ms;
}

html { color-scheme: light; }
body { background: var(--color-page); color: var(--color-ink); }
```

**Contrast rules — verified, follow exactly:**

| Pair | Ratio | Verdict |
|---|---|---|
| `#131316` on `#00d54b` | **9.39 : 1** | ✅ Use this for all green buttons |
| `#ffffff` on `#00d54b` | **1.98 : 1** | ❌ Never |
| `#00d54b` text on `#f1f1f1` | **~1.7 : 1** | ❌ Green is never a text colour |
| `#131316` on `#f1f1f1` | **17.4 : 1** | ✅ |
| `#f1f1f1` on `#0b3b22` | **13.1 : 1** | ✅ |

> **The green rule.** Green is a *fill*, never a *text colour*, never a *border*, never a *background for a whole section*. Text on green is always `--color-ink`. Green should cover no more than roughly 5% of any viewport. It appears on: the primary CTA, the logo full stop, the "selected" state in the booking calendar, and one small dot per illustration. That is the whole list.

### 4.2 Typography

Three families, three jobs. Do not blur the boundaries.

```css
@theme {
  --font-display: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Open Sans", ui-sans-serif, system-ui, sans-serif;
  --font-alt:     "Montserrat Alternates", ui-sans-serif, system-ui, sans-serif;
}
```

| Family | Used for | Never used for |
|---|---|---|
| **DM Sans** | All headings h1–h4, the giant type band, stat numbers, buttons | Body paragraphs |
| **Open Sans** | Body copy, form labels & inputs, tables, long-form journal text, legal | Headings |
| **Montserrat Alternates** | The wordmark, eyebrow / micro-caps labels, section numerals (01/02/03), nav pill labels | Anything longer than four words |

Load with `next/font/google`, `display: "swap"`, subset `latin`, exposed as CSS variables on `<html>`. Weights: DM Sans 400/500/700 · Open Sans 400/600 · Montserrat Alternates 500/600.

**Scale** (`clamp()` everywhere, mobile-first):

```css
@theme {
  --text-mega:    clamp(4rem,   14vw, 12rem);   /* the big-type band only */
  --text-d1:      clamp(2.75rem, 6vw, 5rem);    /* h1 / hero              */
  --text-d2:      clamp(2rem,   3.8vw, 3.25rem);/* h2 / section heads     */
  --text-d3:      clamp(1.5rem, 2.2vw, 2rem);   /* h3                     */
  --text-d4:      1.25rem;                      /* h4 / card titles       */
  --text-lead:    clamp(1.0625rem, 1.3vw, 1.25rem);
  --text-body:    1rem;
  --text-sm:      0.875rem;
  --text-micro:   0.6875rem;
}
```

| Token | Line height | Tracking | Weight |
|---|---|---|---|
| `--text-mega` | 0.86 | −0.05em | DM Sans 500 |
| `--text-d1` | 1.02 | −0.035em | DM Sans 500 |
| `--text-d2` | 1.08 | −0.03em | DM Sans 500 |
| `--text-d3` | 1.18 | −0.02em | DM Sans 500 |
| `--text-d4` | 1.3 | −0.01em | DM Sans 500 |
| `--text-lead` | 1.55 | 0 | Open Sans 400, `--color-ink-70` |
| `--text-body` | 1.65 | 0 | Open Sans 400, `--color-ink-70` |
| `--text-micro` | 1.4 | **0.14em, uppercase** | Montserrat Alternates 500, `--color-ink-55` |

Measure: body copy capped at **68ch**; lead paragraphs at **56ch**; the big-type band ignores measure by design.

### 4.3 Layout & spacing

- 4px base unit. Use only: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 120, 160, 200.
- **Container:** `max-width: 1280px`, gutter 20px mobile / 32px tablet / 48px desktop.
- **Wide container:** `max-width: 1440px` for full-bleed inset cards.
- **Section rhythm:** `padding-block: 80px` mobile, `120px` tablet, `160px` desktop. Two adjacent sections never share the same background — alternate `--color-page` / `--color-paper` / media.
- **Grid:** 12 columns, 24px gutter desktop; 4 columns mobile.
- **The inset frame:** full-bleed media blocks (hero, big-type band, footer photo) are inset from the viewport edge by 16px mobile / 24px desktop with `--radius-xl`, so the off-white page always frames them. This is the site's most recognisable structural move — apply it consistently.

### 4.4 Borders

1px, `--color-ink-12`. That is the entire border system. Cards, inputs, dividers, table rules — all the same hairline. Hover raises it to `--color-ink-40` where interactive; nothing else changes.

### 4.5 Buttons

| Variant | Fill | Text | Border | Hover | Use |
|---|---|---|---|---|---|
| **Primary** | `--color-signal` | `--color-ink` | none | fill darkens to `#00c243` | Book a session, Confirm booking. **Max one per viewport.** |
| **Secondary** | `--color-ink` | `--color-page` | none | fill `#26262c` | Nav CTA on light sections, form submit |
| **Ghost** | transparent | `--color-ink` | 1px `--color-ink-12` | border → `--color-ink-40` | Cancel, Back, tertiary |
| **On-image** | `--color-paper` | `--color-ink` | none | `--color-page` | CTA over photography |
| **Destructive** | transparent | `--color-danger` | 1px `--color-danger` at 30% | fill `--color-danger` at 6% | Cancel appointment |

Shape: `--radius-pill`. Height 48px (default) / 56px (large) / 40px (small). Padding-inline 24px / 28px / 18px. Label: DM Sans 500, 0.9375rem, tracking −0.005em, **sentence case** — never ALL CAPS, never Title Case.

**The circular arrow.** Primary and on-image buttons carry a trailing circular arrow badge (taken from ref 8): a 32px circle filled `--color-ink` with a 14px arrow-up-right in `--color-page`, sitting inside the pill on the right. On hover the arrow translates 2px on both axes over `--dur-fast`. This detail is the CTA's signature — do not substitute a plain chevron.

Focus: `outline: 2px solid var(--color-ink); outline-offset: 3px;` on every interactive element. Never remove it.

### 4.6 Elevation

Only these four use `--shadow-float`: dropdown menu, popover/date picker, dialog/sheet, toast. Cards, sections, inputs, images and buttons have **no shadow, ever**.

### 4.7 Imagery rules

- `next/image` for every raster, with `sizes`, explicit `width`/`height`, `placeholder="blur"` and a real `blurDataURL`.
- Hero images: `priority`. Everything below the fold: lazy.
- Corner radius on media: `--radius-xl` for full-bleed blocks, `--radius-lg` for cards, `--radius-md` for thumbnails, `--radius-pill` for avatars.
- Text over an image sits on a **flat** `--color-scrim` layer at 28% opacity, never a gradient. If the image needs more than 28% to be legible, choose a better image.
- Illustrations render as inline SVG (so `currentColor` works) via SVGR.

### 4.8 Motion

| Element | Motion |
|---|---|
| Section entry | opacity 0→1, translateY 12px→0, 560ms, `--ease-out-soft`, triggered once at 15% viewport |
| Staggered children | 60ms delay between items, max 6 items staggered |
| Button hover | background 180ms, arrow translate 180ms |
| Card hover | border colour only, 180ms. No lift, no scale, no shadow |
| Page transition | 180ms cross-fade on `main` |
| Number counters | count up over 900ms, once, on first view (hero stat only) |

**Banned:** parallax, scroll-jacking, marquee-on-scroll velocity, text scrambling, cursor followers, magnetic buttons, 3D tilt, blur-in, auto-playing carousels.

Every animation wrapped in `prefers-reduced-motion: reduce` → instant final state, no exceptions.

---

## 5. Information architecture

```
/                          Home
/about                     Who we are, how we practise
/services                  All services
/services/[slug]           Individual service (anxiety, couples, burnout, …)
/therapists                Directory, filterable
/therapists/[slug]         Profile + inline availability + book
/book                      Standalone booking flow (5 steps)
/journal                   Articles index
/journal/[slug]            Article
/for-teams                 Workplace / organisational programmes
/pricing                   Plans & sliding scale
/faq                       Accordion
/contact                   Form + practical details
/crisis-support            Immediate-help routes (always reachable)
/login  /signup  /auth/callback  /auth/reset-password
/account                   Client area
  /account/appointments      Upcoming & past, reschedule, cancel
  /account/profile           Details, timezone, communication prefs
  /account/documents         Intake forms, invoices
/studio                    Practitioner + admin area (role-gated)
  /studio/schedule           Calendar view
  /studio/availability       Weekly rules + time off
  /studio/clients            Assigned clients
  /studio/appointments/[id]  Detail + private session notes
/legal/privacy  /legal/terms  /legal/cookies  /legal/accessibility
```

---

## 6. Project structure

```
src/
├─ app/
│  ├─ (marketing)/
│  │  ├─ layout.tsx                 SiteHeader + SiteFooter
│  │  ├─ page.tsx                   Home
│  │  ├─ about/page.tsx
│  │  ├─ services/page.tsx
│  │  ├─ services/[slug]/page.tsx
│  │  ├─ therapists/page.tsx
│  │  ├─ therapists/[slug]/page.tsx
│  │  ├─ journal/page.tsx
│  │  ├─ journal/[slug]/page.tsx
│  │  ├─ for-teams/page.tsx
│  │  ├─ pricing/page.tsx
│  │  ├─ faq/page.tsx
│  │  ├─ contact/page.tsx
│  │  └─ crisis-support/page.tsx
│  ├─ (auth)/
│  │  ├─ layout.tsx                 Split layout: form left, A5 photo right
│  │  ├─ login/page.tsx
│  │  ├─ signup/page.tsx
│  │  └─ reset-password/page.tsx
│  ├─ book/
│  │  ├─ layout.tsx                 Minimal chrome, progress rail
│  │  └─ page.tsx                   Step machine (client)
│  ├─ account/…
│  ├─ studio/…
│  ├─ auth/callback/route.ts
│  ├─ api/
│  │  ├─ og/route.tsx               Dynamic OG images (next/og)
│  │  └─ webhooks/…
│  ├─ layout.tsx                    Root: fonts, metadata, skip link
│  ├─ globals.css                   @theme tokens
│  ├─ not-found.tsx                 uses illo-404
│  ├─ error.tsx
│  ├─ sitemap.ts
│  ├─ robots.ts
│  └─ manifest.ts
├─ components/
│  ├─ ui/                    shadcn primitives, restyled
│  ├─ layout/                SiteHeader, SiteFooter, Container, Section, TornEdge, DiagonalSplit
│  ├─ marketing/             Hero, ConcernGrid, TangledBand, StartingLine, HowItWorks,
│  │                         TherapistGrid, PricingTable, BigTypeBand, Testimonials,
│  │                         FaqAccordion, CtaBand, TrustStrip, ForTeamsDiagonal
│  ├─ booking/               StepRail, ServicePicker, TherapistPicker, DateStrip,
│  │                         SlotGrid, IntakeForm, BookingSummary, ConfirmationCard
│  ├─ account/               AppointmentCard, RescheduleDialog, CancelDialog, EmptyState
│  ├─ studio/                ScheduleCalendar, AvailabilityEditor, TimeOffForm, SessionNotes
│  └─ icons/                 24 SVGR-generated components + index.ts
├─ lib/
│  ├─ supabase/              client.ts · server.ts · middleware.ts · admin.ts
│  ├─ actions/               booking.ts · account.ts · contact.ts · studio.ts
│  ├─ validators/            zod schemas, shared client + server
│  ├─ availability.ts        slot maths, tz conversion
│  ├─ email/                 resend client + react-email templates
│  ├─ rate-limit.ts
│  ├─ seo.ts                 metadata + JSON-LD builders
│  └─ utils.ts               cn(), formatters
├─ content/
│  ├─ site.ts                nav, footer, contact, social
│  ├─ copy.ts                every string on the marketing pages
│  ├─ faq.ts
│  ├─ alt-text.ts            image path → alt string (from the image brief)
│  └─ assets.ts              typed constants for every /public path
├─ types/
│  └─ database.types.ts      generated — never hand-edited
├─ hooks/
└─ middleware.ts             Supabase session refresh + route guards

supabase/
├─ migrations/               numbered SQL, in order
└─ seed.sql
```

---

## 7. Database (Supabase / Postgres)

### 7.1 Extensions & enums

```sql
create extension if not exists pgcrypto;
create extension if not exists btree_gist;   -- required for the overlap constraint
create extension if not exists citext;

create type user_role          as enum ('client','therapist','admin');
create type appointment_status as enum ('pending','confirmed','completed','cancelled','no_show');
create type session_modality   as enum ('video','in_person','phone');
create type contact_topic      as enum ('general','booking','billing','partnership','press');
```

### 7.2 Tables

```sql
-- ── profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  email         citext not null,
  phone         text,
  avatar_url    text,
  role          user_role not null default 'client',
  timezone      text not null default 'UTC',      -- IANA, e.g. 'Europe/London'
  marketing_opt_in boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── services ────────────────────────────────────────────────────────────────
create table public.services (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  short_desc    text not null,
  description   text,
  icon_key      text not null,                     -- maps to components/icons
  duration_min  int  not null default 50 check (duration_min between 15 and 180),
  buffer_min    int  not null default 10,
  price_cents   int  not null check (price_cents >= 0),
  currency      char(3) not null default 'GBP',
  modalities    session_modality[] not null default '{video,phone,in_person}',
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- ── therapists ──────────────────────────────────────────────────────────────
create table public.therapists (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid unique references public.profiles(id) on delete set null,
  slug             text unique not null,
  display_name     text not null,
  title            text not null,                  -- 'Clinical Psychologist'
  credentials      text[] not null default '{}',   -- {'DClinPsy','HCPC reg.'}
  registration_no  text,
  short_bio        text not null,
  long_bio         text,
  photo_url        text,
  specialties      text[] not null default '{}',
  languages        text[] not null default '{English}',
  years_experience int,
  timezone         text not null default 'Europe/London',
  accepts_new      boolean not null default true,
  is_active        boolean not null default true,
  is_placeholder   boolean not null default true,  -- §3.8 guard
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);

create table public.therapist_services (
  therapist_id uuid references public.therapists(id) on delete cascade,
  service_id   uuid references public.services(id)   on delete cascade,
  primary key (therapist_id, service_id)
);

-- ── availability ────────────────────────────────────────────────────────────
-- weekday: 0 = Sunday … 6 = Saturday. Times are LOCAL to the therapist's timezone.
create table public.availability_rules (
  id             uuid primary key default gen_random_uuid(),
  therapist_id   uuid not null references public.therapists(id) on delete cascade,
  weekday        int  not null check (weekday between 0 and 6),
  start_time     time not null,
  end_time       time not null,
  effective_from date,
  effective_to   date,
  created_at     timestamptz not null default now(),
  constraint availability_rules_time_order check (end_time > start_time)
);
create index on public.availability_rules (therapist_id, weekday);

create table public.time_off (
  id           uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists(id) on delete cascade,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  reason       text,
  created_at   timestamptz not null default now(),
  constraint time_off_order check (ends_at > starts_at)
);
create index on public.time_off using gist (therapist_id, tstzrange(starts_at, ends_at));

-- ── appointments ────────────────────────────────────────────────────────────
create table public.appointments (
  id                  uuid primary key default gen_random_uuid(),
  reference           text unique not null default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  client_id           uuid not null references public.profiles(id)   on delete cascade,
  therapist_id        uuid not null references public.therapists(id) on delete restrict,
  service_id          uuid not null references public.services(id)   on delete restrict,
  starts_at           timestamptz not null,
  ends_at             timestamptz not null,
  status              appointment_status not null default 'pending',
  modality            session_modality not null default 'video',
  location_note       text,
  meeting_url         text,
  client_note         text,
  intake              jsonb not null default '{}'::jsonb,
  price_cents         int not null,
  currency            char(3) not null default 'GBP',
  cancelled_at        timestamptz,
  cancelled_by        uuid references public.profiles(id),
  cancellation_reason text,
  reminder_sent_at    timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint appointments_time_order check (ends_at > starts_at)
);

-- The single most important constraint in the schema: a therapist can never be
-- double-booked, no matter how many concurrent requests arrive.
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    therapist_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('pending','confirmed'));

create index on public.appointments (client_id, starts_at desc);
create index on public.appointments (therapist_id, starts_at);
create index on public.appointments (status, starts_at) where status in ('pending','confirmed');

-- ── clinical notes (therapist-only) ─────────────────────────────────────────
create table public.session_notes (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  therapist_id   uuid not null references public.therapists(id) on delete cascade,
  body           text not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── content & comms ─────────────────────────────────────────────────────────
create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text not null,
  body         text not null,
  cover_url    text,
  author_id    uuid references public.therapists(id) on delete set null,
  tags         text[] not null default '{}',
  reading_min  int,
  published_at timestamptz,
  created_at   timestamptz not null default now()
);
create index on public.posts (published_at desc) where published_at is not null;

create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      citext not null,
  topic      contact_topic not null default 'general',
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        citext unique not null,
  confirmed_at timestamptz,
  created_at   timestamptz not null default now()
);

create table public.testimonials (
  id             uuid primary key default gen_random_uuid(),
  quote          text not null,
  attribution    text not null,           -- 'R., 34, London'
  service_id     uuid references public.services(id),
  is_published   boolean not null default false,
  is_placeholder boolean not null default true,
  sort_order     int not null default 0
);
```

### 7.3 Triggers

```sql
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch     before update on public.profiles     for each row execute function public.touch_updated_at();
create trigger appointments_touch before update on public.appointments for each row execute function public.touch_updated_at();
create trigger notes_touch        before update on public.session_notes for each row execute function public.touch_updated_at();

-- auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 7.4 Availability function

```sql
create or replace function public.get_available_slots(
  p_therapist_id uuid,
  p_service_id   uuid,
  p_from         date,
  p_to           date
)
returns table (slot_start timestamptz, slot_end timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare
  v_duration int;
  v_buffer   int;
  v_tz       text;
begin
  select duration_min, buffer_min into v_duration, v_buffer
    from services where id = p_service_id and is_active;
  if v_duration is null then return; end if;

  select timezone into v_tz from therapists
   where id = p_therapist_id and is_active and accepts_new;
  if v_tz is null then return; end if;

  return query
  with days as (
    select generate_series(p_from, p_to, interval '1 day')::date as d
  ),
  windows as (
    select
      ((days.d + r.start_time) at time zone v_tz) as w_start,
      ((days.d + r.end_time)   at time zone v_tz) as w_end
    from days
    join availability_rules r
      on r.therapist_id = p_therapist_id
     and r.weekday = (extract(isodow from days.d)::int % 7)     -- 0=Sun … 6=Sat
     and (r.effective_from is null or days.d >= r.effective_from)
     and (r.effective_to   is null or days.d <= r.effective_to)
  ),
  candidates as (
    select gs as slot_start,
           gs + make_interval(mins => v_duration) as slot_end
    from windows w,
    lateral generate_series(
      w.w_start,
      w.w_end - make_interval(mins => v_duration),
      make_interval(mins => v_duration + v_buffer)
    ) gs
  )
  select c.slot_start, c.slot_end
  from candidates c
  where c.slot_start > now() + interval '4 hours'          -- minimum lead time
    and not exists (
      select 1 from appointments a
       where a.therapist_id = p_therapist_id
         and a.status in ('pending','confirmed')
         and tstzrange(a.starts_at, a.ends_at) && tstzrange(c.slot_start, c.slot_end)
    )
    and not exists (
      select 1 from time_off t
       where t.therapist_id = p_therapist_id
         and tstzrange(t.starts_at, t.ends_at) && tstzrange(c.slot_start, c.slot_end)
    )
  order by c.slot_start;
end $$;

grant execute on function public.get_available_slots(uuid, uuid, date, date) to anon, authenticated;
```

### 7.5 Row Level Security

```sql
alter table public.profiles               enable row level security;
alter table public.therapists             enable row level security;
alter table public.services               enable row level security;
alter table public.therapist_services     enable row level security;
alter table public.availability_rules     enable row level security;
alter table public.time_off               enable row level security;
alter table public.appointments           enable row level security;
alter table public.session_notes          enable row level security;
alter table public.posts                  enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.testimonials           enable row level security;

-- helpers (security definer so they can read profiles without recursing through RLS)
create or replace function public.current_role_is(r user_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = r);
$$;

create or replace function public.current_therapist_id()
returns uuid language sql stable security definer set search_path = public as $$
  select t.id from therapists t where t.profile_id = auth.uid();
$$;

-- ── profiles ────────────────────────────────────────────────────────────────
create policy profiles_self_read   on public.profiles for select using (id = auth.uid() or public.current_role_is('admin'));
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));
create policy profiles_admin_all   on public.profiles for all    using (public.current_role_is('admin'));

-- ── public catalogue: readable by anyone, writable by admins ────────────────
create policy services_public_read   on public.services   for select using (is_active);
create policy therapists_public_read on public.therapists for select using (is_active);
create policy ts_public_read         on public.therapist_services for select using (true);
create policy avail_public_read      on public.availability_rules for select using (true);
create policy posts_public_read      on public.posts for select using (published_at is not null and published_at <= now());
create policy testi_public_read      on public.testimonials for select using (is_published);

create policy services_admin_write   on public.services   for all using (public.current_role_is('admin')) with check (public.current_role_is('admin'));
create policy therapists_admin_write on public.therapists for all using (public.current_role_is('admin')) with check (public.current_role_is('admin'));

-- therapists manage their own availability
create policy avail_owner_write on public.availability_rules for all
  using (therapist_id = public.current_therapist_id() or public.current_role_is('admin'))
  with check (therapist_id = public.current_therapist_id() or public.current_role_is('admin'));

create policy timeoff_owner_all on public.time_off for all
  using (therapist_id = public.current_therapist_id() or public.current_role_is('admin'))
  with check (therapist_id = public.current_therapist_id() or public.current_role_is('admin'));

-- ── appointments ────────────────────────────────────────────────────────────
create policy appt_client_read on public.appointments for select
  using (client_id = auth.uid()
      or therapist_id = public.current_therapist_id()
      or public.current_role_is('admin'));

create policy appt_client_insert on public.appointments for insert
  with check (client_id = auth.uid() and status = 'pending');

create policy appt_client_update on public.appointments for update
  using (client_id = auth.uid() and status in ('pending','confirmed'))
  with check (client_id = auth.uid() and status in ('pending','confirmed','cancelled'));

create policy appt_therapist_update on public.appointments for update
  using (therapist_id = public.current_therapist_id() or public.current_role_is('admin'))
  with check (therapist_id = public.current_therapist_id() or public.current_role_is('admin'));

-- ── clinical notes: therapist + admin only. Clients never see these. ────────
create policy notes_therapist_all on public.session_notes for all
  using (therapist_id = public.current_therapist_id() or public.current_role_is('admin'))
  with check (therapist_id = public.current_therapist_id() or public.current_role_is('admin'));

-- ── inbound: anyone may write, only admins may read ─────────────────────────
create policy contact_insert on public.contact_messages for insert with check (true);
create policy contact_admin_read on public.contact_messages for select using (public.current_role_is('admin'));
create policy news_insert on public.newsletter_subscribers for insert with check (true);
create policy news_admin_read on public.newsletter_subscribers for select using (public.current_role_is('admin'));
```

**Test every policy.** Write a Vitest suite that, for each table, asserts: anonymous read/write, client read/write of own row, client read of *another* client's row (must fail), therapist read of assigned appointment, client read of session notes (must fail).

### 7.6 Seed data

`supabase/seed.sql` — 8 services, 6 therapists (all `is_placeholder = true`), availability rules Mon–Fri 09:00–17:00 for each, 6 journal posts, 4 testimonials (`is_published = false` until real ones exist).

Services to seed:

| slug | name | duration | icon_key |
|---|---|---|---|
| `individual-therapy` | Individual therapy | 50 | `session-video` |
| `couples-therapy` | Couples therapy | 80 | `couples` |
| `anxiety-support` | Anxiety & panic | 50 | `anxiety` |
| `burnout-work-stress` | Burnout & work stress | 50 | `burnout` |
| `low-mood` | Low mood & depression | 50 | `low-mood` |
| `grief-loss` | Grief & loss | 50 | `grief` |
| `young-people` | Young people (13–18) | 50 | `teens` |
| `first-consultation` | First consultation | 25 | `assessment` |

---

## 8. Booking flow

Route: `/book` (also reachable pre-filled from `/therapists/[slug]` and `/services/[slug]`).

### Steps
1. **Service** — card grid, monoline icon + name + duration + price. Selecting advances.
2. **Therapist** — filtered to those offering that service and `accepts_new`. Card: portrait, name, title, specialty chips, next-available. "No preference" option auto-assigns the earliest availability.
3. **Time** — horizontal date strip (14 days, arrows to page forward) + slot grid for the chosen day. Slots come from `get_available_slots`. Selected slot fills `--color-signal` with `--color-ink` text. A timezone line reads: *"Times shown in Europe/London — change"*.
4. **Details** — name, email, phone, modality, "anything you'd like your therapist to know" (optional, 500 chars), consent checkboxes. Unauthenticated users create an account here (email + password or magic link) as part of the same submit.
5. **Confirm** — read-only summary, price, cancellation policy, then Confirm. On success: reference code, add-to-calendar (.ics), confirmation email.

### Rules
- Step state lives in the URL (`?step=3&service=…&therapist=…&slot=…`) so back/forward and refresh work and links are shareable.
- Progress rail on the left (desktop) / top (mobile): `01 Service · 02 Therapist · 03 Time · 04 Details · 05 Confirm`, numerals in Montserrat Alternates, completed steps get a small ink dot.
- **Optimistic-free.** Never show success before the insert returns. The exclusion constraint is the source of truth.
- **Race handling.** If the insert violates `appointments_no_overlap` (Postgres `23P01`), catch it, refetch slots, and show: *"That time was taken a moment ago. Here's what's still open."* — then re-render the slot grid. Do not show a generic error.
- Minimum lead time 4 hours; maximum booking horizon 90 days. Both configurable in `lib/availability.ts`.
- Cancel/reschedule free up to 24 hours before; inside 24 hours the UI states the policy and still allows cancellation, flagged for admin.
- Every mutation is a **Server Action** with a zod-validated payload, using the caller's Supabase session. Rate-limit booking creation to 5/hour/IP.
- After confirming, `revalidatePath('/account/appointments')` and `revalidateTag('slots:{therapistId}')`.

### Emails (react-email + Resend)
`booking-confirmed`, `booking-rescheduled`, `booking-cancelled`, `booking-reminder-24h`, `contact-received`. All plain, typographic, off-white background, one green CTA button, no images beyond the wordmark. Reminder emails dispatched by a Vercel Cron hitting a protected route hourly.

---

## 9. Home page — section by section

The homepage is the reference build. Match the described architecture exactly; other pages inherit its vocabulary.

### 00 — Header (ref 8)
Sticky, `--color-page` at 88% with `backdrop-blur(8px)` — this is the **only** blur in the system and it is on a solid-ish bar, not a glass card. A 1px `--color-ink-12` bottom border appears only after 24px of scroll.

Layout: logo left · centred pill nav · CTA right.
- Logo: `openfield-mark.svg` + wordmark, 28px height.
- Pill nav: a `--radius-pill` container with 1px `--color-ink-12` border and `--color-paper` fill, items in Montserrat Alternates 500, 0.875rem. Active item gets a solid `--color-ink` pill with `--color-page` text. Items: About · Services · Therapists · Journal · Contact.
- CTA: primary green pill "Book a session" with the circular arrow badge.
- Mobile: logo left, hamburger right → full-screen sheet, `--color-page`, large DM Sans links stacked at `--text-d3`, CTA pinned to the bottom, crisis link beneath it.

### 01 — Hero (ref 8, exactly)
Full-width inset card: 24px from the viewport edge, `--radius-xl`, containing `hero-open-field.jpg` at `object-cover`, min-height `min(88vh, 820px)`. A flat `--color-scrim` layer sits over it.

Inside, on a 12-col grid with 48px padding:
- **Eyebrow pill** (top-left of content): `--color-paper` pill, 1px border, Montserrat Alternates micro-caps, "THERAPY & CONSULTATION", with a 6px `--color-signal` dot before the text.
- **H1** at `--text-d1`, `--color-on-image`, max 14ch per line, three lines:
  > A quieter place
  > to work things
  > out.
- **Right column** (cols 8–12, vertically bottom-aligned): a 2-sentence lead in `--color-on-image` at 85% opacity, then the primary CTA.
  > "Openfield matches you with a licensed therapist, usually within three minutes. Video, phone, or in a room — you set the pace."
- **CTA row:** primary "Book a session" (green + circular arrow) and a ghost-on-image "How it works".
- **Bottom-left stat:** overlapping avatar ring (`avatar-01`…`05`, 40px, 2px `--color-on-image` ring, −10px overlap) + `12,400+` in DM Sans 500 at `--text-d3` + "sessions held" in micro-caps.
- Mobile: swap to `hero-open-field-mobile.jpg`, stack everything, H1 at `--text-d1` min, hide the avatar ring below 480px.

### 02 — Trust strip
A single quiet row on `--color-page`, 64px tall, 1px rules top and bottom. Four items separated by a small ink dot, in micro-caps:
`CONFIDENTIAL BY DEFAULT · HCPC & BACP REGISTERED · 50-MINUTE SESSIONS · SLIDING SCALE AVAILABLE`
No logos. No carousel. It does not move.

> Registration bodies are placeholders — replace with the ones that actually apply, or delete the item. Never claim a registration the practice does not hold.

### 03 — What we help with
`--color-paper` section. Eyebrow "WHAT WE HELP WITH" · H2 "Start wherever it hurts most."
A 4×2 grid (2 cols tablet, 1 col mobile) of 8 concern cards: monoline icon (28px, `--color-ink`) top-left, name in DM Sans `--text-d4`, one line of description in `--color-ink-70`, a small text link "Learn more" at the bottom. Card = 1px border, `--radius-lg`, 28px padding, no shadow. Hover: border → `--color-ink-40` only.

Concerns: Anxiety & panic · Low mood · Burnout & work stress · Relationships · Grief & loss · Sleep · Trauma · Focus & ADHD.

### 04 — The tangled band (ref 2) — the brand moment
`--color-ink` background, full-bleed, no inset. Two columns, generous vertical padding (160px desktop).

- **Left (cols 1–5):** `editorial-tangled-thoughts.jpg` in a `--radius-lg` frame. On scroll into view it cross-fades to `editorial-loose-thread.jpg` over `--dur-slow` and holds. (Reduced motion: show the resolved image only.)
- **Right (cols 7–12):** H2 in `--color-page` at `--text-d2`:
  > "Thoughts knot up. We help you find the loose end."
  Body in `--color-page` at 70%:
  > "You don't need the right words to start, and you don't need to have worked out what it's about. Bring the mess. The ordering happens together — fifty minutes at a time, with the same person each week."
  Then a ghost button in on-dark colours: "Meet the therapists".

This is the only dark, only monochrome, only image-transition moment on the site. Its scarcity is what makes it work.

### 05 — Nobody starts from the same line (ref 4)
`--color-page`. Two columns: `illo-starting-line.svg` left at ~520px, copy right.
H2: "Nobody starts from the same line."
Body: "Some people arrive with a diagnosis and a plan. Some arrive because a friend made the call for them. Your first session is about finding out which kind of start this is — nothing more."
Beneath, three small stat blocks separated by hairlines: `3 min` average match time · `24 h` free cancellation · `1 : 1` same therapist, every session.

### 06 — How it works
`--color-paper`. Three columns, each: numeral `01` / `02` / `03` in Montserrat Alternates micro-caps `--color-ink-55`, then the illustration (`illo-step-01-listen` / `-02-match` / `-03-continue`) at 200px, then H3 and two lines of body. A 1px vertical rule between columns on desktop; horizontal rules when stacked.

01 **Tell us what's going on** — "A short intake, in your own words. Five minutes, no forms about your childhood."
02 **Meet your match** — "We pair you with a therapist by concern, approach and availability. If it isn't right, we re-match at no cost."
03 **Keep the thread** — "Same time, same person, week to week. Reschedule from your account whenever you need to."

### 07 — For teams (ref 7, the diagonal)
Full-bleed. `--color-sand` above a **hard diagonal edge** into `--color-forest` (achieved with a CSS `clip-path` polygon at roughly 12° — no SVG needed, no gradient). `illo-diagonal-rider.svg` is absolutely positioned so the figure rides the seam. Two small line doodles (sun, leaf) sit in the sand area.

Content in the sand region, left-aligned: eyebrow "OPENFIELD FOR TEAMS", H2 "Mental health cover your team will actually use.", two lines of body, ghost CTA "See team plans" → `/for-teams`.
Content in the forest region, right-aligned, `--color-page` text: three short bullets with monoline icons in `--color-page`.

### 08 — Therapists
`--color-page`. Header row: H2 "The people you'd be talking to." on the left, a text link "View all therapists →" on the right.
Horizontal scroll rail (snap) on mobile, 4-up grid on desktop. Card: 4:5 portrait in `--radius-lg`, name in DM Sans `--text-d4`, title in `--color-ink-55`, up to 3 specialty chips (pill, 1px border, micro-caps), and a "Next available: Thu 14:00" line in `--color-ink-70`. Whole card is one link.

### 09 — Big-type band (ref 5)
Full-bleed inset card, `--radius-xl`, `editorial-bigtype-field.jpg`, min-height 70vh, flat scrim at 18%.
- Two lines of micro-caps centred at the top, `--color-on-image` at 80%:
  `SURELY, WITHOUT A DOUBT` / `IT PASSES. IT ALWAYS HAS.`
- The word **`openfield.`** at `--text-mega`, DM Sans 500, tracking −0.05em, `--color-on-image`, optically centred, with the full stop in `--color-signal`.
- Bottom-left micro-caps: `EST. 2026 — LICENSED CARE`. Bottom-right: `ROOM TO THINK`.
Nothing else in this section. No button, no body copy. It is a breath.

### 10 — Testimonials
`--color-paper`. Three quote cards, 1px border, `--radius-lg`, 32px padding. Quote in DM Sans 400 at `--text-d4` with a hanging opening quotation mark set in `--color-ink-12`. Attribution in micro-caps. No portraits, no star ratings, no company logos.

> Gate these behind `is_published` in the database. Ship with zero testimonials rather than invented ones.

### 11 — FAQ
`--color-page`. Two columns: H2 + a "Still unsure? Talk to us" ghost CTA on the left (sticky), accordion on the right. Rows are hairline-separated, 24px vertical padding, question in DM Sans `--text-d4`, a rotating 16px plus/minus in `--color-ink-55`. One open at a time, animated height over `--dur-base`. Emit FAQPage JSON-LD.

Six questions: *How quickly can I be seen? · How do I know which therapist is right? · What happens in a first session? · Is this confidential? · What does it cost, and do you offer a sliding scale? · What if I need help right now?* (the last one links to `/crisis-support`).

### 12 — CTA band
`--color-ink` background, centred, 120px padding. H2 in `--color-page`: "Fifty minutes is a good place to start." One primary green CTA. Beneath it, in `--color-page` at 55%: "No card needed to book a first consultation."

### 13 — Footer (ref 6)
This is a set piece. Build it exactly:

1. A full-bleed `editorial-footer-field.jpg` block, `min-height: 520px`, `object-position: center bottom`.
2. `texture-torn-edge.png` composited across the **top** edge of that block as a CSS `mask` on a `--color-page` element — so the page background appears to tear away and reveal the photograph. It tiles horizontally and never distorts.
3. Footer content sits **over** the photo in its upper region, where the grass is calm:
   - **Left column:** `openfield-mark.svg` + wordmark in light, then one line: "Licensed therapy and consultation. Room to think."
   - **Four nav columns**, right-aligned as a group: headings in micro-caps `--color-on-image` at 70%, links in Open Sans 0.875rem `--color-on-image`.
     - **Company** — About · Careers · Contact · Press
     - **Care** — Individual therapy · Couples · Young people · Assessments · For teams
     - **Resources** — Journal · Guides · FAQ · Crisis support
     - **Legal** — Privacy · Terms · Cookies · Accessibility
4. Bottom: a centred line in micro-caps, `--color-on-image` at 60% — `© 2026 OPENFIELD CARE LTD. ALL RIGHTS RESERVED.`
5. Directly above the copyright, a centred one-line safety notice in `--color-on-image` at 80%:
   *"Openfield is not an emergency service. If you need help right now, see crisis support."* — with "crisis support" as an underlined link.

The person at the desk in the photograph must remain visible and uncovered — position the nav columns above them.

---

## 10. Other pages (briefly, but completely)

**`/about`** — H1 band on `--color-page`; `editorial-window-light.jpg` in a portrait card beside a founding statement; a "How we practise" three-column list; the practitioner grid; a values section as hairline-separated rows (no icons, just numerals + text).

**`/services`** — Intro band + the 8-card grid at full size (2-up desktop, larger cards than the homepage version), each with duration, price and modality chips.

**`/services/[slug]`** — Hero with the service name at `--text-d1` and one illustration; "What this looks like" (3 steps); "Who it's for"; "Who you'd see" (therapists offering it); price card; FAQ subset; CTA to `/book?service={slug}`. Generate static params from Supabase, `revalidate: 3600`.

**`/therapists`** — Filter rail (concern, modality, language, availability) as pill toggles; card grid; empty state uses `illo-empty-appointments`. Filters live in the URL.

**`/therapists/[slug]`** — Two-column: sticky portrait + credentials + languages + specialties on the left; long bio, approach, qualifications timeline, and an **inline 7-day availability strip** with a direct book CTA on the right. `Person` JSON-LD.

**`/for-teams`** — Reuses the diagonal split full-page; programme tiers; an enquiry form writing to `contact_messages` with `topic = 'partnership'`.

**`/pricing`** — Three plain cards (Single session · Fortnightly · Weekly), 1px borders, the middle one marked with a small green dot and a micro-caps "MOST CHOSEN" label — **not** a coloured card. Below: a sliding-scale explainer and an insurance/company-funded note.

**`/journal` + `/journal/[slug]`** — Index: one large featured post + a 3-col grid. Article: 68ch measure, `--text-lead` intro, hairline-separated pull quotes in DM Sans, author card at the end, three related posts. `Article` JSON-LD, dynamic OG image per post.

**`/contact`** — Two columns: form left (name, email, topic select, message), practical details right (email, phone, hours, address, response time). Above the form, the non-emergency notice. Honeypot + rate limit.

**`/crisis-support`** — Deliberately the plainest page on the site: `--color-page`, no photography, no illustration, `--text-d2` heading, then a list of immediate options as large hairline-separated rows with phone numbers as `tel:` links. Loads fast, works without JS, reachable from every page including the mobile menu. Numbers are `TODO(region)` until verified for each launch market.

**`/account/appointments`** — Upcoming section (cards with date block, service, therapist, modality, join link, reschedule / cancel) and Past section (collapsed, with a "Book again" action). Empty state uses `illo-empty-appointments` and a primary CTA.

**`/studio/*`** — Practitioner tools. Week calendar grid, availability editor (weekday rows with time ranges, add/remove), time-off form, client list, appointment detail with a private notes editor. Role-gated in `middleware.ts` **and** enforced by RLS — never rely on the middleware alone.

**`not-found.tsx`** — `illo-404`, "That page has moved on.", ghost CTA home + a link to `/contact`.

---

## 11. Components to build

**Layout:** `Container`, `Section` (props: `bg="page|paper|ink|sand"`, `size="sm|md|lg"`), `InsetMedia`, `TornEdge`, `DiagonalSplit`, `Hairline`, `SiteHeader`, `SiteFooter`, `MobileMenu`, `SkipLink`.

**Primitives (restyled shadcn):** `Button` (5 variants + `ArrowBadge`), `Pill`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioCard`, `Dialog`, `Sheet`, `Accordion`, `Tabs`, `Toast`, `Skeleton`, `Avatar`, `AvatarStack`, `Chip`.

**Marketing:** `Eyebrow`, `SectionHeading`, `ConcernCard`, `StepCard`, `TherapistCard`, `QuoteCard`, `StatRow`, `BigTypeBand`, `TrustStrip`, `CtaBand`, `FaqAccordion`, `Reveal` (the single scroll-animation wrapper — nothing else animates on scroll).

**Booking:** `StepRail`, `ServicePicker`, `TherapistPicker`, `DateStrip`, `SlotGrid`, `TimezoneNotice`, `IntakeForm`, `ConsentBlock`, `BookingSummary`, `ConfirmationCard`, `SlotConflictNotice`.

**Icons:** 24 SVGR components from `01-IMAGE-ASSET-PROMPTS.md` §D, exported from `components/icons/index.ts`, all accepting `className` and inheriting `currentColor`.

---

## 12. Accessibility

- WCAG 2.2 AA, verified with `@axe-core/playwright` on every route in CI. Zero criticals to merge.
- Semantic landmarks (`header`/`nav`/`main`/`footer`), one `h1` per page, no heading level skipped.
- Skip-to-content link, visible on focus.
- Every interactive target ≥ 44×44px. Focus ring never removed.
- The booking slot grid is a proper radio group: arrow-key navigation, `aria-selected`, live region announcing the chosen time in full ("Thursday 12 March, 2 PM, Europe/London").
- Accordion, dialog and sheet follow APG patterns: focus trap, `Esc` to close, focus restored on close.
- Form errors: `aria-describedby`, `aria-invalid`, error text adjacent to the field, and a summary at the top of the form on submit failure. Never colour-only.
- All images have real alt text from `content/alt-text.ts`; decorative illustration gets `alt=""` + `aria-hidden`.
- `prefers-reduced-motion` respected globally.
- Full keyboard pass on the booking flow is an acceptance criterion.

---

## 13. SEO & metadata

- `metadata` export per route; title template `%s — Openfield`; canonical URLs.
- Dynamic OG images via `next/og` at `/api/og?title=…&kicker=…`, rendering the E4 template from the image brief.
- JSON-LD: `Organization` + `MedicalBusiness` (root), `Person` (therapist pages), `Service` (service pages), `Article` (journal), `FAQPage` (FAQ), `BreadcrumbList` (all nested routes).
- `sitemap.ts` and `robots.ts` generated from Supabase content.
- Semantic HTML with real headings — the big-type band uses a real element with an accessible name, not a background image.

---

## 14. Performance budget

| Metric | Target |
|---|---|
| LCP | < 1.8 s (4G) |
| CLS | < 0.02 |
| INP | < 150 ms |
| Lighthouse (mobile) | ≥ 95 across all four categories |
| JS shipped on `/` | < 120 KB gzipped |

Means: Server Components by default; `next/font` with `display: swap` and preloaded display face; AVIF/WebP with correct `sizes`; hero `priority`, everything else lazy; `motion` imported lazily and only in client islands; slot queries cached with `revalidateTag`; no client-side data fetching on marketing pages.

---

## 15. Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server only — never imported into a client module
NEXT_PUBLIC_SITE_URL=https://openfield.care
RESEND_API_KEY=
RESEND_FROM_EMAIL="Openfield <hello@openfield.care>"
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CRON_SECRET=                        # guards the reminder route
```

Validate at boot with a zod schema in `lib/env.ts` so a missing variable fails the build, not a user request.

---

## 16. Copy bank

Every string below is production copy. Do not write lorem ipsum; do not invent replacements without cause.

**Meta title:** `Openfield — Room to think.`
**Meta description:** `Licensed therapists, booked in minutes. Video, phone, or in person. Fifty-minute sessions, same therapist each week, free cancellation up to 24 hours.`

**Hero H1:** `A quieter place to work things out.`
**Hero lead:** `Openfield matches you with a licensed therapist, usually within three minutes. Video, phone, or in a room — you set the pace.`
**Primary CTA:** `Book a session` · **Secondary:** `How it works`
**Stat:** `12,400+ sessions held` *(replace with the real figure or remove — see §3.8)*

**Section headings:**
- `Start wherever it hurts most.`
- `Thoughts knot up. We help you find the loose end.`
- `Nobody starts from the same line.`
- `Three steps, and none of them are hard.`
- `Mental health cover your team will actually use.`
- `The people you'd be talking to.`
- `Fifty minutes is a good place to start.`

**Booking flow micro-copy:**
- Step 3 timezone: `Times shown in {tz}. Change`
- Empty slots: `Nothing open this week. Try the next one, or pick another therapist.`
- Conflict: `That time was taken a moment ago. Here's what's still open.`
- Confirming: `Holding your slot…`
- Success: `You're booked. We've emailed the details and a calendar file.`
- Cancellation policy: `Move or cancel free up to 24 hours before. After that we ask that you let your therapist know.`
- Non-emergency notice: `Openfield is not an emergency service. If you're in immediate danger or thinking about harming yourself, please use crisis support.`

**Consent checkboxes (booking step 4):**
- `I understand that Openfield is not an emergency or crisis service.` *(required)*
- `I agree to the Terms and the Privacy Notice.` *(required)*
- `Send me occasional writing from the Openfield journal.` *(optional, default off)*

**Empty states:**
- No appointments: `Nothing in the diary yet.` / `When you book a session it'll show up here, with everything you need to join it.`
- No therapists match filters: `No one matches all of those. Try loosening one filter.`

---

## 17. Build order

**Phase 0 — Foundation.** Scaffold, TypeScript strict, ESLint/Prettier, fonts, `globals.css` with the full `@theme` token block, `Container`/`Section`/`Hairline`, `content/site.ts`. Ship a token gallery page at `/_design` (dev-only) showing every colour, type step, button variant and radius — review it before writing a single marketing section.

**Phase 1 — Design system.** shadcn install + full restyle of every primitive. Button with all 5 variants and the `ArrowBadge`. The 24 icon components. `Reveal`. Verify: nothing in the gallery uses a shadow, a gradient or a raw hex.

**Phase 2 — Chrome.** `SiteHeader` (desktop pill nav + mobile sheet), `SiteFooter` with `TornEdge`, skip link, `not-found`, `error`.

**Phase 3 — Database.** All migrations in order, the exclusion constraint, RLS policies, `get_available_slots`, seed data, generated types, and the RLS test suite. **Do not proceed until the RLS tests pass.**

**Phase 4 — Home.** Sections 01–13 in order, desktop then mobile. This is where the references get matched — compare side by side before moving on.

**Phase 5 — Marketing pages.** Services, therapists, about, pricing, for-teams, faq, contact, crisis-support, journal.

**Phase 6 — Auth.** Signup, login, magic link, password reset, callback route, middleware session refresh, role guards.

**Phase 7 — Booking.** The five-step flow, Server Actions, conflict handling, `.ics` generation, confirmation emails.

**Phase 8 — Account & Studio.** Client appointments (reschedule, cancel), profile, then the practitioner schedule, availability editor and notes.

**Phase 9 — Hardening.** Rate limits, reminder cron, JSON-LD, sitemap, dynamic OG, axe pass on every route, Lighthouse pass, Playwright happy-path suite, the §18 checks.

---

## 18. Acceptance checks

Run these before calling any phase done. Failures are blocking.

```bash
# 1. Zero gradients anywhere in source
grep -rniE "gradient" src/ && echo "FAIL: gradient found" || echo "PASS"

# 2. No banned iconography
grep -rniE "sparkle|sparkles|\bzap\b|magic|wand|\bbot\b|robot|brain-circuit" src/ \
  && echo "FAIL: banned icon" || echo "PASS"

# 3. No emoji in source
grep -rP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src/ content/ \
  && echo "FAIL: emoji found" || echo "PASS"

# 4. No raw hex outside the token file
grep -rnE "#[0-9a-fA-F]{3,8}\b" src/ --include=*.tsx --include=*.ts \
  | grep -v "globals.css" && echo "REVIEW: hardcoded colour" || echo "PASS"

# 5. Service role key never reaches the client
grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/ | grep -v "lib/supabase/admin.ts" \
  && echo "FAIL: service key leak" || echo "PASS"

# 6. No shadows outside the single token
grep -rnE "shadow-(sm|md|lg|xl|2xl)|box-shadow" src/ | grep -v "shadow-float" \
  && echo "FAIL: stray shadow" || echo "PASS"

# 7. No placeholder people in production data
psql "$DB_URL" -c "select count(*) from therapists where is_placeholder and is_active;"
# must return 0 before launch
```

Manual checklist:

- [ ] Every reference-derived section (hero, tangled band, starting line, diagonal, big-type band, footer) compared side-by-side with its reference image.
- [ ] Green measured at ≤ 5% of the viewport on every page; green is never a text colour.
- [ ] `#131316` used for all text sitting on `#00d54b`.
- [ ] Two adjacent sections never share a background.
- [ ] The full booking flow completed with keyboard only, then with a screen reader.
- [ ] Booked the same slot from two browsers simultaneously — the second one gets the conflict notice, not an error page.
- [ ] Logged in as a client and confirmed session notes and other clients' appointments are unreachable via direct API calls.
- [ ] Crisis support reachable from every page, including the mobile menu, and renders with JS disabled.
- [ ] Lighthouse mobile ≥ 95 on `/`, `/therapists`, `/book`.
- [ ] axe: zero criticals on every route.
- [ ] Tested at 320px, 768px, 1024px, 1440px and 1920px.
- [ ] All fonts loading (DM Sans, Open Sans, Montserrat Alternates) with no FOIT.

---

## 19. Assets consumed from the image brief

The build imports these exact paths. If any is missing, the page must fail loudly in development rather than render a broken image.

```
brand/openfield-wordmark.svg · openfield-wordmark-light.svg · openfield-mark.svg
brand/openfield-mark-light.svg · favicon.svg · favicon-32.png
brand/apple-touch-icon-180.png · icon-512.png · og-default.jpg

images/hero/hero-open-field.jpg · hero-open-field-mobile.jpg · hero-consult-room.jpg
images/editorial/editorial-tangled-thoughts.jpg · editorial-loose-thread.jpg
images/editorial/editorial-bigtype-field.jpg · editorial-footer-field.jpg
images/editorial/editorial-window-light.jpg · editorial-two-chairs.jpg
images/illustration/illo-overwhelm.svg · illo-starting-line.svg · illo-diagonal-rider.svg
images/illustration/illo-step-01-listen.svg · illo-step-02-match.svg · illo-step-03-continue.svg
images/illustration/illo-empty-appointments.svg · illo-404.svg
images/texture/texture-torn-edge.png · texture-halftone-dots.png
images/team/therapist-01..06.jpg · avatar-01..05.jpg
images/journal/journal-01..06.jpg
icons/ (24 monoline SVGs)
```

Type them in `content/assets.ts` as a frozen constant object so every reference is checked at compile time.

---

**End of specification.** Build in phase order. When a decision is genuinely ambiguous, choose the quieter option.
