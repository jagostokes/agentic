/**
 * OpenClaw / Clawdbot gateway HTTP helpers.
 *
 * Assumptions (adapt to your gateway API):
 * - OPENCLAW_GATEWAY_URL: base URL of the gateway (e.g. https://gateway.example.com)
 * - OPENCLAW_GATEWAY_TOKEN: Bearer token for gateway API auth
 *
 * TODO: Align routes and payloads with OpenClaw/Clawdbot gateway docs when available.
 */

const getBaseUrl = (): string => {
  const url = process.env.OPENCLAW_GATEWAY_URL;
  if (!url) {
    throw new Error("OPENCLAW_GATEWAY_URL is not set");
  }
  return url.replace(/\/$/, "");
};

const getToken = (): string => {
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (!token) {
    throw new Error("OPENCLAW_GATEWAY_TOKEN is not set");
  }
  return token;
};

type GatewayFetchOptions = Omit<RequestInit, "body"> & { body?: object };

const gatewayFetch = async (
  path: string,
  options: GatewayFetchOptions = {}
): Promise<Response> => {
  const { body, ...rest } = options;
  const url = `${getBaseUrl()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
    ...(rest.headers ?? {}),
  };
  const fetchOptions: RequestInit = { ...rest, headers };
  if (body != null) {
    fetchOptions.body = JSON.stringify(body);
  }
  return fetch(url, fetchOptions);
};

/**
 * Create a dedicated agent/workspace for a user on the gateway.
 * TODO: Confirm exact path and payload from OpenClaw/Clawdbot gateway API.
 */
export async function createGatewayAgent(
  userId: string
): Promise<{ agentId: string; workspaceId: string }> {
  const res = await gatewayFetch("/agents", {
    method: "POST",
    body: {
      name: `User ${userId} agent`,
      systemPrompt: "You are a helpful personal assistant for this user.",
      // TODO: Add any gateway-specific fields (e.g. workspace name, config)
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gateway createAgent failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { agentId?: string; workspaceId?: string; id?: string; workspace_id?: string };
  // Support both camelCase and snake_case from gateway
  const agentId = data.agentId ?? data.id;
  const workspaceId = data.workspaceId ?? data.workspace_id;
  if (!agentId || !workspaceId) {
    throw new Error("Gateway response missing agentId or workspaceId");
  }
  return { agentId: String(agentId), workspaceId: String(workspaceId) };
}

/**
 * Associate a Telegram user id with an agent/workspace on the gateway.
 * TODO: Confirm exact path and payload from OpenClaw/Clawdbot gateway API.
 */
export async function bindTelegramToAgent(
  agentId: string,
  telegramUserId: string
): Promise<void> {
  const res = await gatewayFetch(`/agents/${agentId}/bindings`, {
    method: "POST",
    body: {
      channel: "telegram",
      channelUserId: telegramUserId,
      // TODO: Add any gateway-specific fields
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gateway bindTelegram failed: ${res.status} ${text}`);
  }
}
