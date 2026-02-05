# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Platform to enable non-technical users to run safe, secure, and efficient personal AI agents (using Open Claw / Moltbot / Clawdbot architecture).

Full-stack TypeScript application using Express backend with React frontend. Built with Vite for development and production bundling.

## Development Commands

```bash
# Development (runs server with HMR)
npm run dev

# Client only (Vite dev server on port 5000)
npm run dev:client

# Production build (builds both client and server)
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database schema push to PostgreSQL
npm run db:push
```

## Architecture

### Directory Structure

- **`client/`** - React frontend application
  - `src/` - Application source code
    - `features/` - Feature-specific components organized by domain
      - `agent/` - Agent features (chat, security, context-modification)
      - `dashboard/` - Dashboard views
    - `ui/` - Reusable UI components (shadcn/ui library)
    - `hooks/` - Custom React hooks
    - `lib/` - Utilities and shared code
    - `types/` - TypeScript type definitions
    - `pages/` - Top-level route pages
- **`server/`** - Express backend
  - `index.ts` - Main server entry point
  - `routes.ts` - API route registration (prefix all routes with `/api`)
  - `storage.ts` - Storage interface and in-memory implementation
  - `vite.ts` - Vite middleware for development
  - `static.ts` - Static file serving for production
- **`shared/`** - Code shared between client and server
  - `schema.ts` - Drizzle ORM database schemas and Zod validation
- **`script/`** - Build scripts
  - `build.ts` - Production build (esbuild for server, Vite for client)

### Server Architecture

- Express server runs on port 5000 (configurable via `PORT` env var)
- Development: Vite middleware handles HMR and client serving
- Production: Serves pre-built static files from `dist/public`
- Single server serves both API and client
- All API routes must be prefixed with `/api`
- Raw request body captured for verification via `req.rawBody`
- Request logging for all `/api` routes with response data

### Storage Layer

The storage interface (`IStorage` in `server/storage.ts`) is the data access layer:
- Currently uses in-memory `MemStorage` implementation
- Can be swapped for PostgreSQL implementation using Drizzle ORM
- Database schema defined in `shared/schema.ts` with Drizzle
- Use `storage.getUser()`, `storage.createUser()`, etc. in routes

### Client Architecture

- React 19 with Vite
- Routing: wouter (see `App.tsx`)
- State management: TanStack Query (React Query)
- UI: shadcn/ui components with Radix UI primitives
- Styling: Tailwind CSS v4

### Path Aliases

TypeScript path aliases configured in `tsconfig.json`:
- `@/*` → `client/src/*`
  - `@/features/*` → Feature components
  - `@/ui/*` → UI components (shadcn/ui)
  - `@/hooks/*` → Custom React hooks
  - `@/lib/*` → Utilities
  - `@/types/*` → Type definitions
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

**Import Examples:**
```typescript
import Chat from "@/features/agent/chat"
import { Button } from "@/ui/button"
import { usePulse } from "@/hooks/use-animations"
import { cn } from "@/lib/utils"
```

### Build Process

Production build (`npm run build`) via `script/build.ts`:
1. Client: Vite builds to `dist/public/`
2. Server: esbuild bundles to `dist/index.cjs` (CommonJS)
3. Bundled dependencies listed in allowlist for faster cold starts

## Database

- ORM: Drizzle with PostgreSQL
- Schema: `shared/schema.ts`
- Config: `drizzle.config.ts`
- Requires `DATABASE_URL` environment variable
- Push schema changes: `npm run db:push`

## Environment Variables

- `NODE_ENV` - "development" or "production"
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string (required for Drizzle)

## Agent Platform Architecture

This platform is designed to make personal AI agents (Open Claw / Moltbot / Clawdbot) accessible to non-technical users:

### Key Design Principles

- **Safety First**: All agent execution must be sandboxed and permission-controlled
- **Security**: User data isolation, secure credential storage, and access control
- **Efficiency**: Optimized agent runtime with resource limits and monitoring
- **User-Friendly**: Abstract technical complexity behind intuitive interfaces

### Animation System

The UI uses anime.js for sophisticated animations. Key files:

- `client/src/lib/animations.ts` - Core animation utilities and presets
- `client/src/hooks/use-animations.ts` - React hooks for declarative animations
- `client/src/types/animejs.d.ts` - TypeScript declarations

**Available Hooks:**
- `usePulse()` - Pulsing effect for status indicators
- `useHoverAnimation()` - Lift/scale/glow on hover
- `useAccordion()` - Smooth expand/collapse
- `useShake()` - Error feedback animation
- `useBreathingGlow()` - Glowing effect for alerts
- `useStaggerEntrance()` - Staggered list animations

**Animation Utilities:**
- `createRipple()` - Material-style click ripples
- `staggerEntrance()` - Cascading entrance animations
- `scalePop()` - Button press feedback

**Easing Presets:** `smooth`, `bounce`, `spring`, `snappy`, `gentle`
**Duration Presets:** `instant` (150ms), `fast` (250ms), `normal` (400ms), `slow` (600ms), `dramatic` (800ms)

### Agent Integration Points

When implementing agent functionality:
- Agent configurations stored in database (extend `shared/schema.ts`)
- Agent execution isolated per user with proper resource limits
- Real-time agent status updates via WebSocket connections
- Secure credential management for agent API access (Claude API, etc.)
- Activity logging and monitoring for all agent actions
