# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: Marginalia — Social Reading Platform

A Portuguese-language literary social network where users annotate book passages and create a shared intellectual layer over texts.

### Brand
- **Colors**: Albescent White `#FAF8F3`, Albescent 2 `#EBE6DB`, Heather Rose `#AE8F7D`, Doeskin `#BDAB9C`, Old Vine `#697962`, Metal `#454545`
- **Typography**: Cormorant Garamond (display/reading, italic 300-400) + Jost (UI labels, uppercase, letter-spacing 0.14-0.22em)
- **Language**: Portuguese (pt-BR)
- **Texture**: radial-gradient paper texture on all backgrounds

### Artifacts
- `artifacts/marginalia` — React + Vite frontend (previewPath: `/`)
- `artifacts/api-server` — Express API server (port 8080)

### Architecture
**Auth: Supabase.** Content: AppContext + mock data (not API-dependent for UI). The API server exists but the React app uses an in-memory data layer for all non-auth UI operations.

- **AuthContext** (`src/context/AuthContext.tsx`) — Supabase session, profile from `public.profiles`, signIn/signUp/signOut/updateProfile. `useAuth()` hook.
- **Supabase client** (`src/lib/supabase.ts`) — singleton client; URL/key baked in via vite.config.ts `define` from `SUPABASE_URL` / `SUPABASE_ANON_KEY` secrets.
- **AppContext** (`src/context/AppContext.tsx`) — reads `profile` from AuthContext to derive `currentUser` (real user data shown in profile/avatar everywhere). Manages books, margins, progress, notifications + actions; `updateProfile` is a no-op (real saves go through AuthContext.updateProfile). All filtering uses `currentUser.id` (never hardcoded `"user_me"`). **localStorage persistence** keyed by userId: `mg_progress_${uid}`, `mg_reactions_${uid}`, `mg_saved_${uid}`, `mg_margins_${uid}`. State resets on user switch. Community margins (`MOCK_MARGINS`) are kept mutable so emoji reaction counts update visually.
- **Mock data** (`src/data/mockData.ts`) — 55 books (each with `bookColor`, optional `coverUrl` for real covers via Open Library), 218 margins with threaded replies, 19 users with rich profiles, 6 editorial collections. Mock entries use `userId: "user_me"` — real authenticated users get empty states since their Supabase UUID won't match. `Margin.bookId` is `number | null` — null means a free reflection post (no book). `canUserSeeMargin` always returns `true` for null-bookId posts. `filterMarginsForUser` and all `bookId`-related helpers guard against null.
- **BookCover** (`src/components/BookCover.tsx`) — displays real cover image when `coverUrl` is set (Open Library or Google Books thumbnails), gracefully falls back to colored placeholder with initial letter. Supports sizes xs/sm/md/lg.
- **Google Books search** — ExploreScreen calls Google Books API directly (public, no key needed) with 500ms debounce. Shows local "Na comunidade" results and "Mais livros" external results side-by-side. Spinner during fetch.
- **Constants** (`src/data/constants.ts`) — GENRES, SPOILER_PREFERENCES, MARGIN_TYPES, SPOILER_LEVELS, REACTION_TYPES (13 including "Isso me quebrou" etc.), READER_ARCHETYPES (10 archetypes: Analista, Detetive, Rebelde, Intenso, Interpretador, Observador, Questionador, Imersivo, Editor Mental, Teórico)
- **Utils**: `spoiler.ts` (anti-spoiler filter logic), `formatting.ts` (timeAgo, formatReference, etc.)

### Auth Flow
- **Routing**: Checks Supabase session → if authenticated, go to MainApp; if not, show OnboardingFlow
- **SignUp**: Creates Supabase Auth user, upserts `public.profiles` with username/full_name/bio/avatar_color/email. Saves `mg_username_email_${username}` and `mg_avatar_color_${uid}` to localStorage as fallbacks.
- **Login**: Accepts **e-mail OR @username** — if username detected (no `@domain.tld`), queries `profiles.email` to find the real email, then signs in normally. Falls back to localStorage mapping `mg_username_email_${username}`.
- **Logout**: Button in Settings → calls `supabase.auth.signOut()` → redirects to welcome
- **Profile edit**: `updateProfile` → `upsertProfileSafe()` which retries without unknown columns (PGRST204 error) and saves `avatar_color`/`email` to localStorage as fallback. Confirms save by re-fetching from DB.
- **avatar_color resilience**: Always saved to `mg_avatar_color_${uid}` in localStorage. `loadProfile` merges localStorage fallback if DB column doesn't exist yet. Run `supabase/profiles_migration.sql` to add the column permanently.
- **Migration**: `artifacts/marginalia/supabase/profiles_migration.sql` — run in Supabase SQL Editor to add all profile columns + RLS policies. Includes `NOTIFY pgrst, 'reload schema'` to refresh schema cache.

### Onboarding Flow (new users only)
1. Splash screen (2.2s)
2. **Welcome** — manifesto screen, "Começar" / "Já tenho conta"
3. **Genres** — multi-select genre chips
4. **Ritmo da leitura** — anti-spoiler preference (Ver tudo / Ver só o que li / Modo protegido)
5. **Sign up** — real Supabase account creation (name, @username, email, password, bio, avatar color)
6. **Books** — search + select initial books, set status + progress %

### Main Screens (13 total)
1. **Home** (`/`) — "Lendo agora" horizontal carousel (all reading-status books with BookCover + progress + posts), "Hoje para você" feed (anti-spoiler filtered) with 5 editorial FeedBreak types (including "Trechos que estão fazendo leitores parar", "Pouca gente percebeu isso"), "Conversas da comunidade", "Em alta", "Sua atividade". WishlistSection moved to ProfileScreen.
2. **Explore** (`/explore`) — Search, editorial collections, trending posts, books in debate, compatible readers
3. **Nova Margem** (`/nova-margem`) — 7-step wizard: book → excerpt → reference → type → commentary → spoiler → visibility → publish (UI label: "Criar Post")
4. **Library** (`/library`) — Status filters (Todos/Lendo/Concluídos/Quero ler/Abandonados/Favoritos), book cards with progress
5. **Book Detail** (`/book/:id`) — Community hub (NOT reader); progress editor, community stats, tabs (Posts/Teorias/Críticas/Perguntas/Meus registros), anti-spoiler banner
6. **Profile** (`/profile`) — Reader archetype (ex: "O Analista") + description, reading signature card with "Compartilhar meu perfil de leitura" share button, Instagram/TikTok social links (view + inline edit), avatar color picker, 4-stat grid, my posts. NO "leitores compatíveis" section.
7. **Notifications** (`/notifications`) — Typed notification list with unread dots
8. **Settings** (`/settings`) — Ritmo da leitura preference + genre toggles
9. **Thread** (`/thread/:id`) — Post detail with reactions (8 types), reply input; empty state "O que isso te causou?", "Vozes nesse trecho" section
10. **Eco** (`/eco/:id`) — Community DB post detail (same layout as Thread); fetches from `/api/community/margins/:id`

### Terminology (UX vs Internal)
- **UI facing**: "Post" (before: margem), "Resposta" (before: eco), "Criar Post" (before: Nova Margem), "Conversas da comunidade" (before: Ecos da comunidade), "Respostas" (before: Ecos), "Publicar post" (before: Publicar margem)
- **Internal (code/routes/DB)**: `margin`, `margins`, `eco`, `/nova-margem`, `MarginCard`, `EcoScreen` — all unchanged; "Marginalia" brand identity stays

### Dark Mode System
- **Token hierarchy (dark):** `--text-primary #F3EDE5`, `--text-secondary #D2C3B5`, `--text-tertiary #AE9E90`, `--text-soft #8E7F73`
- **Surface hierarchy (dark):** body `#12100F` → screen `#1C1916` → card `#1E1A18` (set via isDark inline styles in MarginCard/ExploreScreen) → inner-block `#252119` (EBE6DB override)
- **CSS override pattern:** `html.dark [class*="bg-[#FAF8F3]"] { background-color: #1C1916 }` — covers all Tailwind hardcoded color classes; MarginCard uses `DARK_SURFACE="#1E1A18"` inline to elevate cards above screen bg
- **SpoilerShieldCard:** fully `isDark`-aware via `useApp()` — protected card `#2A241F` bg, inner atmospheric block `#332B24`, all text inline-styled (never relying on CSS overrides that conflict with desired spec colors)
- **EcoarBar meta count:** always shows `X reações · Y respostas` (even zeros) as a small line above the author/action row
- **Preview card (NewMarginScreen):** properly dark-aware with header band, excerpt quote, commentary, and meta chips — looks like a real feed card

### Key Components
- `MarginCard` — Shows margin with book-color tinting. 4 layouts: QuoteCard, QuestionCard, TheoryCard, StandardCard. Each has an `EmojiReactionBar` (🖤💥🤔✨📌😵 with scale animation on tap), "Responder" CTA (links to thread), and ShareButton. OR SpoilerShieldCard if blocked. `EcoarBar` always shows `X reações · Y respostas` count.
- `BookCover` — Reusable colored book cover placeholder using bookColor + italic first-letter initial + paper texture + spine shadow. Sizes: xs/sm/md/lg. Used in LibraryScreen, HomeScreen, BookDetailScreen, ProfileScreen (wishlist), and WishlistSection.
- `LogoMark` — SVG book logo
- `Navbar` — 5-item bottom nav with elevated center "+" button for /nova-margem (label: "Criar Post")
- `SpoilerShieldCard` — Fully dark-mode-aware card for blocked content. Uses `isDark` from `useApp()`, not CSS overrides, to apply exact spec colors. "Ver mesmo assim" reveals inline with proper dark bg. "Adicionar à biblioteca"/"Marcar progresso" buttons have visible dark borders.

### Anti-Spoiler System ("Ritmo da leitura")
- `canUserSeeMargin(margin, spoilerPreference, progress)` in `utils/spoiler.ts`
- 3 modes: `all` (see everything), `progress_only` (by progress %), `protected` (hide major/ending spoilers)
- SpoilerShieldCard shown when blocked — "Trecho ocultado para preservar sua leitura"
- Configurable in onboarding + Settings

### API Routes (backend — not used by default UI)
- `GET /api/books`, `GET /api/books/:id`, `POST /api/annotations`, `GET /api/feed`, etc.
