# Soul Section — Plan & Design

## What the Soul Is

The **Soul** is the personality and identity of a clawdbot. It’s what moves the agent from “chatbot” to **personal assistant**: a single, evolving document that defines how the agent thinks, what it values, and how it behaves. The agent reads and can update this file; the user can edit it so the personality stays aligned as the bot evolves.

---

## Template Structure (Canonical Sections)

| Section | Purpose | Editable unit |
|--------|---------|----------------|
| **Tagline** | One line that frames identity: *"You're not a chatbot. You're becoming someone."* | Single line / short paragraph |
| **Core Truths** | Principles: genuinely helpful, have opinions, be resourceful, earn trust, remember you’re a guest | Multi-line (bullets or prose) |
| **Boundaries** | Hard rules: private stays private, ask before external actions, no half-baked replies, care in group chats | Multi-line (bullets or prose) |
| **Vibe** | Tone and style: concise when needed, thorough when it matters, not corporate, not sycophant | Short paragraph |
| **Continuity** | How the agent persists: sessions, memory files, telling the user when the soul file changes, evolution | Short paragraph |

---

## Dashboard Layout (Soul Page)

### 1. Page identity
- **Header**: “Soul” (or “Agent A — Soul”) with a short subtitle: “Personality and identity for this agent.”
- **Tagline block**: Prominent, editable one-liner (the “You’re not a chatbot…” line) so it’s the first thing the user sees and can tweak.

### 2. Section cards
Each of the four sections (Core Truths, Boundaries, Vibe, Continuity) is a **card** with:
- **Title** (e.g. “Core Truths”)
- **Short description** (what this section is for, for users who didn’t read the template)
- **One editable area**: textarea (or future rich text) bound to that section
- Optional: “Last updated” (user or agent) and “Agent last edited” indicator for Continuity

Layout options:
- **Single column**: One card per section, stacked; focus on reading/editing one block at a time.
- **Two columns on large screens**: e.g. Core Truths + Boundaries in one row, Vibe + Continuity in the next, so the page doesn’t feel endless.

### 3. Actions
- **Save** (per section or “Save Soul” for the whole page): persist to backend; toast on success/failure.
- **Revert** (optional): restore last saved state for the section or full soul.
- **View as agent** (optional): Renders the full soul as one document (read-only) so the user sees exactly what the agent sees.

### 4. Visual tone
- Reuse dashboard patterns: same borders, cards, typography (mono, caps-label), and animation system (e.g. stagger on load).
- Slight visual distinction so it feels like “the agent’s identity file”: e.g. a soft accent (border or background) on the tagline or on section cards, or a small “Soul” icon (Sparkles) in the header.
- No corporate clutter: plenty of whitespace, clear hierarchy (tagline → sections).

### 5. Data model (for implementation)
- **Per-agent soul**: `agentId` → one soul document.
- **Fields**: `tagline`, `coreTruths`, `boundaries`, `vibe`, `continuity` (all strings; newlines = bullets/paragraphs).
- **Persistence**: API `GET/PUT /api/agents/:id/soul` (or equivalent); for now in-memory or DB. Optional: `lastUpdatedBy` (“user” | “agent”) and `lastUpdatedAt` for Continuity and UI.

### 6. Default content
- Pre-fill with the exact template text you provided so the soul is meaningful on first load and users can edit from there.

---

## Implementation Checklist

- [ ] Add `Soul` feature component under `client/src/features/agent/soul.tsx`.
- [ ] State: form state for tagline + four sections; load from API or default template.
- [ ] UI: header (title + subtitle), tagline block, four section cards (title, description, textarea), Save (and optional Revert / “View as agent”).
- [ ] Dashboard: when sidebar is Agent A and sub-tab is “SOUL / PURPOSE”, render `<Soul />` instead of the generic dashboard content.
- [ ] Optional: API + storage for soul (GET/PUT) and “last updated” display.
- [ ] Animations: subtle stagger on section cards and optional pulse/glow on tagline to match existing dashboard feel.

---

## Out of Scope (for later)

- Rich text / markdown editor per section.
- Version history / diff of soul over time.
- Per-section “Agent last edited” with timestamps (needs backend support).
- Multiple souls per agent (e.g. “work” vs “personal”); one soul per agent is enough for v1.
