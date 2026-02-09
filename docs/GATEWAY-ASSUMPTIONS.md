# OpenClaw/Clawdbot Gateway – Assumptions

Update these in code once you have the real gateway API and WS protocol from OpenClaw/Clawdbot docs.

## HTTP API (`lib/gateway.ts`)

- **Base URL:** `OPENCLAW_GATEWAY_URL` (no trailing slash).
- **Auth:** `Authorization: Bearer OPENCLAW_GATEWAY_TOKEN`.

### Create agent

- **Assumed:** `POST /agents`
- **Request body:** `{ name: string, systemPrompt: string }`
- **Response:** `{ agentId, workspaceId }` or `{ id, workspace_id }` (both shapes supported in code).

### Bind Telegram to agent

- **Assumed:** `POST /agents/:agentId/bindings`
- **Request body:** `{ channel: "telegram", channelUserId: string }`

## WebSocket (`components/agent-chat.tsx`)

- **URL:** `NEXT_PUBLIC_GATEWAY_WS_URL` (e.g. `wss://gateway.example.com/ws`).

### Client → gateway

- **Identify:** `{ type: "identify", agentId: string, token: string }` (token = JWT from `/api/chat/token`).
- **User message:** `{ type: "user_message", agentId: string, text: string }`.

### Gateway → client (assumed; adapt to real protocol)

- **Streaming delta:** `{ type: "assistant_delta", delta: string, messageId?: string }`
- **Full message:** `{ type: "assistant_message", text: string, messageId?: string }`
- **Error:** `{ type: "error", text: string }`

## Telegram

- **Bot username:** `TELEGRAM_BOT_USERNAME` in env (no `@`). Used in claim deep link: `https://t.me/<TELEGRAM_BOT_USERNAME>?start=<token>`.
- **Webhook:** `POST /api/telegram/webhook` must be secured (e.g. shared secret header) so only your bot service can call it.
