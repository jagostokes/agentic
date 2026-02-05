# Folder Structure Guide
## Understanding What Each Folder Does

---

## 🎯 `/features` - Feature Modules

**What it does:**
Complete, self-contained pieces of functionality that users interact with.

**Think of it as:**
The actual "apps" or "pages" your users see and use. Each feature is a complete section of your application.

**Examples in your app:**
- **`agent/chat.tsx`** - The entire chat interface where users talk to the agent
- **`agent/security.tsx`** - The security configuration page with all its settings
- **`agent/context-modification.tsx`** - The context management interface
- **`dashboard/dashboard.tsx`** - The main dashboard with all the panels and navigation

**What belongs here:**
- Complete page views
- Complex components that combine multiple smaller pieces
- Feature-specific logic and state management
- Anything that represents a "screen" or major section of your app

**What doesn't belong:**
- Reusable buttons, inputs, cards (those go in `/ui`)
- Generic helper functions (those go in `/lib`)
- Custom hooks (those go in `/hooks`)

**Example:**
```typescript
// features/agent/chat.tsx
// This is a complete feature - it has:
// - Its own state (messages, input, isGenerating)
// - Its own UI layout (header, messages area, input box)
// - Its own logic (sending messages, handling responses)
// - Uses UI components from /ui (buttons, textareas)
// - Uses hooks from /hooks (animations)
```

---

## 🎨 `/ui` - Reusable UI Components

**What it does:**
Building blocks for your interfaces. These are generic, styled components with no business logic.

**Think of it as:**
LEGO blocks. You use these pieces to build your features. They don't know anything about your app's data or logic - they're just visual components.

**Examples:**
- `button.tsx` - A styled button component
- `dialog.tsx` - A modal/popup component
- `input.tsx` - A styled text input
- `card.tsx` - A card container with border/shadow
- `toast.tsx` - Notification popups

**What belongs here:**
- Generic, reusable visual components
- Components from UI libraries (like shadcn/ui)
- Components that can be used anywhere in any feature
- Purely presentational components (they display what you tell them to)

**What doesn't belong:**
- Business logic (calculations, API calls, etc.)
- Feature-specific components
- State management for your app's data

**Example:**
```typescript
// ui/button.tsx
// This is generic - it works anywhere:
<Button onClick={handleClick}>Click Me</Button>

// You use it in features:
// features/agent/chat.tsx
<Button onClick={sendMessage}>Send</Button>

// features/agent/security.tsx
<Button onClick={saveSettings}>Save</Button>
```

---

## 🪝 `/hooks` - React Hooks (Reusable Logic)

**What are React Hooks?**
Hooks are functions that let you "hook into" React's features. They let you reuse logic across different components.

**Think of them as:**
Superpowers you can give to any component. Instead of writing the same code in every component, you write it once as a hook and reuse it everywhere.

**What they do:**
- **State management** - Remember values between renders
- **Side effects** - Do something when something changes
- **Reusable logic** - Share behavior across components

**Examples in your app:**

1. **`use-animations.ts`** - Animation superpowers
   ```typescript
   // Without hook (messy, repeated code):
   useEffect(() => {
     if (ref.current) {
       anime({ targets: ref.current, opacity: [0, 1] })
     }
   }, [])

   // With hook (clean, reusable):
   useFadeIn(ref) // That's it! Fade animation applied.
   ```

2. **`use-toast.ts`** - Notification superpowers
   ```typescript
   // Shows toast notifications from any component:
   const { toast } = useToast()
   toast({ title: "Success!", description: "Saved." })
   ```

3. **`use-mobile.tsx`** - Device detection superpowers
   ```typescript
   // Instantly know if user is on mobile:
   const isMobile = useMobile()
   if (isMobile) { /* show mobile menu */ }
   ```

**Common React Hooks:**
- `useState` - Remember a value (like isOpen, count, input text)
- `useEffect` - Do something when things change (like fetch data on mount)
- `useRef` - Get direct access to a DOM element
- `useCallback` - Remember a function
- `useMemo` - Remember a calculated value

**What belongs here:**
- Reusable logic that multiple components need
- Complex state management that you want to share
- Side effects you want to reuse (animations, timers, etc.)

**What doesn't belong:**
- Regular utility functions that don't use React features (those go in `/lib`)
- Feature-specific logic that's only used once (keep it in the feature)

---

## 🛠️ `/lib` - Utilities and Helpers

**What it does:**
Standalone functions that do useful things but don't need React.

**Think of them as:**
Your toolbox. Helper functions that do one specific job and can be used anywhere.

**Examples in your app:**

1. **`utils.ts`** - General utilities
   ```typescript
   // cn() - Combines CSS classes cleanly
   cn("button", isActive && "active")
   // Output: "button active"
   ```

2. **`animations.ts`** - Animation functions
   ```typescript
   // Standalone animation functions using anime.js
   createRipple(event)           // Creates click ripple
   staggerEntrance(elements)     // Animates list items
   fadeIn(element)               // Fades element in
   ```

3. **`queryClient.ts`** - React Query setup
   ```typescript
   // Configuration for data fetching
   export const queryClient = new QueryClient({...})
   ```

**What belongs here:**
- Pure functions (given same input, always return same output)
- Helper functions that don't need React
- Configuration objects
- Constants and data transformations
- Math, string, date utilities

**What doesn't belong:**
- Functions that use React hooks (those go in `/hooks`)
- Feature-specific logic (keep it in `/features`)
- UI components (those go in `/ui`)

**Example - When to use lib vs hooks:**
```typescript
// ❌ lib/animations.ts (uses React - should be a hook!)
export function usePulse(ref) {
  useEffect(() => { /* animation */ })
}

// ✅ lib/animations.ts (standalone - perfect for lib!)
export function createRipple(element, color) {
  anime({ targets: element, scale: [0, 2], opacity: [1, 0] })
}

// ✅ hooks/use-animations.ts (uses React - perfect for hooks!)
export function usePulse(ref) {
  useEffect(() => {
    if (ref.current) {
      anime({ targets: ref.current, scale: [1, 1.1, 1] })
    }
  }, [])
}
```

---

## 📝 `/types` - TypeScript Definitions

**What it does:**
Defines the "shape" of your data and types for external libraries.

**Think of it as:**
A dictionary that tells TypeScript what types of data exist and what properties they have.

**Examples:**
```typescript
// types/animejs.d.ts
// Tells TypeScript what anime.js functions look like:
declare module "animejs" {
  export interface AnimeParams {
    targets?: string | HTMLElement;
    duration?: number;
    // ... etc
  }
}
```

**What belongs here:**
- Type definitions for external libraries that don't have types
- Shared types used across many features
- Global type augmentations

**What doesn't belong:**
- Types specific to one feature (define them in that feature file)
- Types that are auto-generated

---

## 📄 `/pages` - Route Pages

**What it does:**
Top-level components that represent entire routes/URLs in your app.

**Think of it as:**
The entry points for different URLs. When someone visits a URL, these components render.

**Examples:**
- `not-found.tsx` - Shows when URL doesn't exist (404 page)
- Future: `login.tsx`, `settings.tsx`, etc.

**What belongs here:**
- Route-level components
- Components that map to URLs
- Usually very simple - they just render the right feature

**What doesn't belong:**
- Complex logic (that goes in `/features`)
- Reusable components (those go in `/ui`)

**Example:**
```typescript
// pages/not-found.tsx (simple - just renders UI)
export default function NotFound() {
  return (
    <div>
      <h1>404 - Not Found</h1>
      <Link to="/">Go Home</Link>
    </div>
  )
}

// App.tsx (routing setup)
<Route path="/404" component={NotFound} />
```

**Note:**
In your app, `dashboard.tsx` is in `/features` not `/pages` because it's a complex feature with lots of logic. The `/pages` folder is for simple route wrappers.

---

## 📊 Quick Reference Table

| Folder | Purpose | Example | Uses React? | Has Logic? |
|--------|---------|---------|-------------|------------|
| `/features` | Complete app sections | Chat interface | ✅ Yes | ✅ Yes |
| `/ui` | Reusable visual components | Button, Dialog | ✅ Yes | ❌ No |
| `/hooks` | Reusable React logic | usePulse, useToast | ✅ Yes | ✅ Yes |
| `/lib` | Standalone utilities | cn(), createRipple() | ❌ No | ✅ Yes |
| `/types` | TypeScript definitions | animejs.d.ts | ❌ No | ❌ No |
| `/pages` | Route entry points | 404 page | ✅ Yes | ❌ No |

---

## 🎯 Decision Flow: Where Does My Code Go?

```
Is it a complete page/section users interact with?
├─ YES → /features
└─ NO ↓

Is it a visual component used in multiple places?
├─ YES → /ui
└─ NO ↓

Does it use React hooks (useState, useEffect, etc)?
├─ YES → /hooks
└─ NO ↓

Is it a standalone utility function?
├─ YES → /lib
└─ NO ↓

Is it a TypeScript type definition?
├─ YES → /types
└─ NO → Keep it in the feature file itself!
```

---

## 💡 Real Examples from Your App

### Example 1: Chat Feature
```
features/agent/chat.tsx          → Complete chat interface
├─ Uses: ui/button.tsx          → Send button
├─ Uses: ui/textarea.tsx        → Message input
├─ Uses: hooks/use-animations.ts → Fade-in animations
├─ Uses: lib/animations.ts      → Ripple effect on click
└─ Uses: lib/utils.ts           → cn() for class names
```

### Example 2: Security Feature
```
features/agent/security.tsx              → Complete security config
├─ Uses: ui/dialog.tsx                  → Warning modals
├─ Uses: ui/switch.tsx                  → Toggle switches
├─ Uses: hooks/use-animations.ts        → Card entrance animations
└─ Uses: lib/animations.ts              → Assessment panel slide-in
```

### Example 3: Creating a Ripple Effect
```typescript
// ❌ DON'T: Put everything in one place
features/agent/chat.tsx
  function createRipple() { /* anime.js code */ }
  function ChatButton() { /* uses createRipple */ }

// ✅ DO: Separate concerns
lib/animations.ts
  export function createRipple() { /* reusable */ }

features/agent/chat.tsx
  import { createRipple } from '@/lib/animations'
  function ChatButton() { /* uses createRipple */ }
```

---

## 🚀 Adding New Code - Examples

### Adding a New Feature (User Profile Page)
```typescript
// features/user/profile.tsx
import { Button } from '@/ui/button'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'

export function Profile() {
  const { toast } = useToast()

  return (
    <div>
      <Button onClick={() => toast({ title: "Saved!" })}>
        Save Profile
      </Button>
    </div>
  )
}
```

### Adding a New Utility
```typescript
// lib/date-utils.ts
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  // ... formatting logic
  return "2 hours ago"
}

// features/agent/chat.tsx
import { formatRelativeTime } from '@/lib/date-utils'
<span>{formatRelativeTime(message.timestamp)}</span>
```

### Adding a New Hook
```typescript
// hooks/use-clipboard.ts
export function useClipboard() {
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return { copied, copy }
}

// features/agent/chat.tsx
const { copied, copy } = useClipboard()
<Button onClick={() => copy(message.content)}>
  {copied ? "Copied!" : "Copy"}
</Button>
```
