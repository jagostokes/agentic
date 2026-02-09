# OpenClaw Agent Platform

Production-ready SaaS: sign in with Google, get a personal OpenClaw/Moltbot (Clawdbot) agent in under 1 minute, chat via web UI with optional Telegram connection.

Similar in spirit to [simpleclaw.com](https://simpleclaw.com): “login with Google → one-click deploy / attach an OpenClaw instance under 1 minute.”

## Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript, TailwindCSS
- **Auth:** Auth.js / NextAuth v5, Google provider, JWT sessions
- **Backend:** Next.js API routes (App Router) in TypeScript
- **DB:** PostgreSQL with Prisma
- **Deployment:** Vercel (web); separate VM for OpenClaw/Moltbot gateway

## Quick start

1. **Environment**

   ```bash
   cp .env.example .env.local
   ```

   Set at least:

   - `DATABASE_URL` – PostgreSQL connection string
   - `AUTH_SECRET` – e.g. `npx auth secret`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – Google OAuth
   - `OPENCLAW_GATEWAY_URL` / `OPENCLAW_GATEWAY_TOKEN` – gateway HTTP API
   - `NEXT_PUBLIC_GATEWAY_WS_URL` – gateway WebSocket URL (for chat)
   - `TELEGRAM_BOT_USERNAME` – for Telegram deep link (claim flow)

2. **Database**

   ```bash
   npm install
   npm run db:generate
   npm run db:push
   ```

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), sign in with Google, then use the dashboard to chat and (optionally) connect Telegram.

## Project structure

- `app/(public)/` – landing page (/)
- `app/(app)/dashboard/` – dashboard (requires auth)
- `app/api/` – API routes (auth, chat token, agents, telegram webhook)
- `lib/` – Prisma singleton, gateway HTTP helpers, agent provisioning, chat token JWT
- `components/` – UI (AgentChat WebSocket client, ConnectTelegram, Providers)
- `prisma/schema.prisma` – User, Agent, AgentBinding, AgentBindingClaim

## Gateway assumptions (to adapt)

The code assumes an OpenClaw/Clawdbot gateway with:

1. **HTTP API** (base URL: `OPENCLAW_GATEWAY_URL`, Bearer: `OPENCLAW_GATEWAY_TOKEN`)

   - `POST /agents` – create agent/workspace. Request: `{ name, systemPrompt }`. Response: `{ agentId, workspaceId }` (or `id` / `workspace_id`).
   - `POST /agents/:agentId/bindings` – bind Telegram. Request: `{ channel: "telegram", channelUserId }`.

   See `lib/gateway.ts` and adjust paths/payloads to match your gateway docs.

2. **WebSocket** (URL: `NEXT_PUBLIC_GATEWAY_WS_URL`)

   - Client sends: `{ type: "identify", agentId, token }` then `{ type: "user_message", agentId, text }`.
   - Expected server messages: e.g. `{ type: "assistant_delta", delta }` or `{ type: "assistant_message", text }`.

   See `components/agent-chat.tsx` and adapt message types to your gateway’s WS protocol.

## Telegram

- **Claim:** User clicks “Connect Telegram” on dashboard → `POST /api/agents/:id/telegram/claim` → returns `deepLink` (e.g. `https://t.me/<BOT>?start=<token>`). Token stored in `AgentBindingClaim` (10 min expiry).
- **Webhook:** Your Telegram bot service calls `POST /api/telegram/webhook` with `{ token, telegramUserId }`. App resolves token, upserts `AgentBinding`, calls gateway `bindTelegramToAgent`, then deletes the claim. Secure this route (e.g. secret header or IP allowlist).

## Scripts

- `npm run dev` – Next.js dev server
- `npm run build` / `npm start` – production build and start
- `npm run db:generate` – generate Prisma client
- `npm run db:push` – push schema to DB (no migrations)
- `npm run db:migrate` – run migrations
- `npm run db:studio` – Prisma Studio
