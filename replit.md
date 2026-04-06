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

### Architecture — Post-Refactor
**Frontend runs off AppContext + mock data** (not API-dependent for UI). The API server still exists but the React app uses an in-memory data layer for all UI operations.

- **AppContext** (`src/context/AppContext.tsx`) — global state with currentUser, books, margins, progress, notifications + actions; `updateProfile` supports firstName, lastName, bio, username, city, avatarColor, readerType, instagram, tiktok
- **Mock data** (`src/data/mockData.ts`) — 7 books (each with `bookColor`), 8 margins, 5 users (each with `readerType`, `instagram`, `tiktok`, `readingSignature`), progress, notifications, collections
- **Constants** (`src/data/constants.ts`) — GENRES, SPOILER_PREFERENCES, MARGIN_TYPES, SPOILER_LEVELS, REACTION_TYPES (13 including "Isso me quebrou" etc.), READER_ARCHETYPES (10 archetypes: Analista, Detetive, Rebelde, Intenso, Interpretador, Observador, Questionador, Imersivo, Editor Mental, Teórico)
- **Utils**: `spoiler.ts` (anti-spoiler filter logic), `formatting.ts` (timeAgo, formatReference, etc.)

### Onboarding Flow
1. Splash screen (2.2s)
2. **Welcome** — manifesto screen, "Começar" / "Já tenho conta"
3. **Genres** — multi-select genre chips
4. **Ritmo da leitura** — anti-spoiler preference (Ver tudo / Ver só o que li / Modo protegido)
5. **Sign up** — name, @username, city, email, password
6. **Books** — search + select initial books, set status + progress %

### Main Screens (13 total)
1. **Home** (`/`) — "Lendo agora" horizontal carousel (all reading-status books with BookCover + progress + ecos), "Hoje para você" feed (anti-spoiler filtered) with 5 editorial FeedBreak types (including "Trechos que estão fazendo leitores parar", "Pouca gente percebeu isso"), "Em alta", "Sua atividade". WishlistSection moved to ProfileScreen.
2. **Explore** (`/explore`) — Search, editorial collections, trending margins, books in debate, compatible readers
3. **Nova Margem** (`/nova-margem`) — 7-step wizard: book → excerpt → reference → type → commentary → spoiler → visibility → publish
4. **Library** (`/library`) — Status filters (Todos/Lendo/Concluídos/Quero ler/Abandonados/Favoritos), book cards with progress
5. **Book Detail** (`/book/:id`) — Community hub (NOT reader); progress editor, community stats, tabs (Ecos/Teorias/Críticas/Perguntas/Meus registros), anti-spoiler banner
6. **Profile** (`/profile`) — Reader archetype (ex: "O Analista") + description, reading signature card with "Compartilhar meu perfil de leitura" share button, Instagram/TikTok social links (view + inline edit), avatar color picker, 4-stat grid, my margins. NO "leitores compatíveis" section.
7. **Notifications** (`/notifications`) — Typed notification list with unread dots
8. **Settings** (`/settings`) — Ritmo da leitura preference + genre toggles
9. **Thread** (`/thread/:id`) — Margin detail with reactions (8 types), reply input; empty state "O que isso te causou?", placeholder "Escreva seu eco…"

### Key Components
- `MarginCard` — Shows margin with book-color tinting. 4 layouts: QuoteCard, QuestionCard, TheoryCard, StandardCard. Each has an "Ecoar" CTA button (links to thread), activity badges (🔥 if totalReactions ≥ 6, 🟢 if commentsCount ≥ 5), and ShareButton with "marginalia — leia junto" tagline. OR SpoilerShieldCard if blocked.
- `BookCover` — Reusable colored book cover placeholder using bookColor + italic first-letter initial + paper texture + spine shadow. Sizes: xs/sm/md/lg. Used in LibraryScreen, HomeScreen, BookDetailScreen, ProfileScreen (wishlist), and WishlistSection.
- `LogoMark` — SVG book logo
- `Navbar` — 5-item bottom nav with elevated center "+" button for /nova-margem
- `SpoilerShieldCard` — Elegant blocked content card with update progress / unlock actions

### Anti-Spoiler System ("Ritmo da leitura")
- `canUserSeeMargin(margin, spoilerPreference, progress)` in `utils/spoiler.ts`
- 3 modes: `all` (see everything), `progress_only` (by progress %), `protected` (hide major/ending spoilers)
- SpoilerShieldCard shown when blocked — "Trecho ocultado para preservar sua leitura"
- Configurable in onboarding + Settings

### API Routes (backend — not used by default UI)
- `GET /api/books`, `GET /api/books/:id`, `POST /api/annotations`, `GET /api/feed`, etc.
