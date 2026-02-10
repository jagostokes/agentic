/**
 * Server-side agent provisioning: ensure the current user has an Agent
 * linked to the OpenClaw gateway. Called on /dashboard load.
 * When skipGateway is true (e.g. demo user), creates a placeholder agent so the dashboard loads without a real gateway.
 */
import { supabase } from "@/lib/supabase";
import { createGatewayAgent } from "@/lib/gateway";

export type AgentRecord = {
  id: string;
  gatewayAgentId: string;
  gatewayWorkspaceId: string;
};

const DEMO_PLACEHOLDER_AGENT_ID = "demo-agent";
const DEMO_PLACEHOLDER_WORKSPACE_ID = "demo-workspace";

export type EnsureUserAgentOptions = {
  /** When true, create a placeholder agent without calling the gateway (for demo mode). */
  skipGateway?: boolean;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEMO_EMAIL = "demo@demo.local";

/**
 * If the user has no Agent, creates one via the gateway and persists it.
 * When skipGateway is true, uses placeholder ids so the dashboard loads without a real gateway.
 * Returns the user's agent (existing or newly created).
 */
export async function ensureUserAgent(
  userId: string,
  options: EnsureUserAgentOptions = {}
): Promise<AgentRecord> {
  const { skipGateway = false } = options;

  // DB requires UUID; resolve demo user by email when id is the literal "demo"
  let resolvedUserId = userId;
  if (skipGateway && !UUID_REGEX.test(userId)) {
    const { data: demoUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", DEMO_EMAIL)
      .maybeSingle();
    if (demoUser?.id) resolvedUserId = demoUser.id;
  }

  const { data: existing } = await supabase
    .from("agents")
    .select("id, gateway_agent_id, gateway_workspace_id")
    .eq("user_id", resolvedUserId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      gatewayAgentId: existing.gateway_agent_id,
      gatewayWorkspaceId: existing.gateway_workspace_id,
    };
  }

  let agentId: string;
  let workspaceId: string;

  if (skipGateway) {
    agentId = DEMO_PLACEHOLDER_AGENT_ID;
    workspaceId = DEMO_PLACEHOLDER_WORKSPACE_ID;
  } else {
    const created = await createGatewayAgent(userId);
    agentId = created.agentId;
    workspaceId = created.workspaceId;
  }

  const { data: created, error } = await supabase
    .from("agents")
    .insert({
      user_id: resolvedUserId,
      gateway_agent_id: agentId,
      gateway_workspace_id: workspaceId,
    })
    .select("id, gateway_agent_id, gateway_workspace_id")
    .single();

  if (error) throw new Error(`Failed to create agent: ${error.message}`);
  if (!created) throw new Error("Failed to create agent");

  return {
    id: created.id,
    gatewayAgentId: created.gateway_agent_id,
    gatewayWorkspaceId: created.gateway_workspace_id,
  };
}

/** True if this agent id is the demo placeholder (no real gateway). */
export function isDemoPlaceholderAgent(gatewayAgentId: string): boolean {
  return gatewayAgentId === DEMO_PLACEHOLDER_AGENT_ID;
}
