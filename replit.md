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

### Pages
1. **Home** (`/`) — Feed with "Lendo agora" card, "Ecos do seu momento" annotations feed, "Descobrir" carousel
2. **Explore** (`/explore`) — Search, trending annotations, readers, emerging books grid
3. **Library** (`/library`) — Book grid with filters (Todos / Lendo / Concluídos / Lista de desejos)
4. **Profile** (`/profile`) — User stats, identity phrase, favorite excerpts
5. **BookHub** (`/book/:id`) — Progress card (% display), heatmap with locked chapters, recent annotations, shareable cards
6. **Reader** (`/reader/:id`) — Full-screen reading with tap-to-annotate panel, reaction chips, highlight mode
7. **Thread** (`/thread/:id`) — Annotation thread with replies, clickable reaction chips, reply input

### Key Components
- `AnnotationCard` — Annotation card with reaction chips (5 types, distinct styles each)
- `BookCover` — Placeholder book cover with paper texture
- `LogoMark` — SVG logo (book with Marginalia colors)
- `Navbar` — Bottom nav with center "Ler" button elevated

### Database Schema
- `books` — id, title, author, progress, currentPage, totalPages, annotations, highlights, debates, currentChapter, status, heatmap (jsonb), createdAt
- `annotations` — id, bookId, bookTitle, chapter, progressAt, excerpt, note, type, isPublic, userId, userName, userInitials, reactions (jsonb), replyCount, createdAt
- `replies` — id, annotationId, userId, userName, userInitials, text, reactions (jsonb), createdAt

### Heatmap Logic
Chapters beyond current reading progress are shown as locked (blurred bar + lock icon + "em breve").

### API Routes
- `GET /api/books` — list all books
- `GET /api/books/:id` — book detail + heatmap + recentAnnotations
- `GET /api/books/:id/cards` — shareable cards for a book
- `POST /api/annotations` — create annotation
- `GET /api/annotations/:id` — get annotation thread (annotation + replies)
- `POST /api/annotations/:id/reactions` — add reaction
- `GET /api/feed` — home feed (currentReading, echoes, discover)
- `GET /api/explore` — explore page (trending, readers, emergingBooks)
- `GET /api/users/me` — current user profile
- `GET /api/healthz` — health check
