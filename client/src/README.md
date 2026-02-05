# Client Source Structure

This directory contains the frontend React application with a clear, semantic folder structure.

## Directory Overview

```
src/
├── features/          # Feature-specific components and logic
│   ├── agent/        # Agent-related features (chat, security, context)
│   └── dashboard/    # Main dashboard view
├── ui/               # Reusable UI components (shadcn/ui)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and helpers
├── types/            # TypeScript type definitions
├── pages/            # Top-level route pages
├── App.tsx           # Main app component with routing
└── main.tsx          # Application entry point
```

## Folder Details

### `/features`
**Purpose:** Feature-specific components organized by domain

- **`agent/`** - Agent interaction and configuration
  - `chat.tsx` - Chat interface
  - `security.tsx` - Security configuration
  - `context-modification.tsx` - Context management
- **`dashboard/`** - Main dashboard views
  - `dashboard.tsx` - Primary dashboard with navigation

### `/ui`
**Purpose:** Reusable, presentational UI components (shadcn/ui library)

Contains all shadcn/ui components: buttons, dialogs, forms, etc.
These are generic, reusable components with no business logic.

### `/hooks`
**Purpose:** Custom React hooks for shared logic

- `use-animations.ts` - Animation hooks (pulse, hover, accordion, etc.)
- `use-toast.ts` - Toast notification hook
- `use-mobile.tsx` - Mobile detection hook

### `/lib`
**Purpose:** Utility functions and helper modules

- `animations.ts` - Animation utilities using anime.js
- `utils.ts` - General utility functions (cn, etc.)
- `queryClient.ts` - React Query configuration

### `/types`
**Purpose:** TypeScript type definitions and declarations

- `animejs.d.ts` - Type definitions for anime.js library

### `/pages`
**Purpose:** Top-level route components

- `not-found.tsx` - 404 page

## Import Aliases

The following import aliases are configured:

```typescript
import Component from "@/features/agent/chat"      // Features
import { Button } from "@/ui/button"                // UI components
import { cn } from "@/lib/utils"                    // Utilities
import { usePulse } from "@/hooks/use-animations"   // Hooks
import type { MyType } from "@/types/my-types"      // Types
```

## Adding New Features

When adding a new feature:

1. Create a new folder under `/features` if it's a distinct domain
2. Place feature-specific components in that folder
3. Import reusable UI components from `/ui`
4. Extract custom hooks to `/hooks` if they're reusable
5. Add utilities to `/lib` if they're not feature-specific

## Best Practices

- **Features** should be self-contained with minimal cross-dependencies
- **UI components** should be purely presentational
- **Hooks** should be reusable across features
- **Lib** utilities should have no side effects
- **Types** should be shared when used across multiple features
