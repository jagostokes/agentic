/**
 * Server-side agent provisioning: ensure the current user has an Agent
 * linked to the OpenClaw gateway. Called on /dashboard load.
 */
import { prisma } from "@/lib/prisma";
import { createGatewayAgent } from "@/lib/gateway";

export type AgentRecord = {
  id: string;
  gatewayAgentId: string;
  gatewayWorkspaceId: string;
};

/**
 * If the user has no Agent, creates one via the gateway and persists it.
 * Returns the user's agent (existing or newly created).
 */
export async function ensureUserAgent(userId: string): Promise<AgentRecord> {
  const existing = await prisma.agent.findFirst({
    where: { userId },
  });
  if (existing) {
    return {
      id: existing.id,
      gatewayAgentId: existing.gatewayAgentId,
      gatewayWorkspaceId: existing.gatewayWorkspaceId,
    };
  }

  // TODO: Gateway API shape may differ; adapt createGatewayAgent to match OpenClaw/Clawdbot docs.
  const { agentId, workspaceId } = await createGatewayAgent(userId);

  const created = await prisma.agent.create({
    data: {
      userId,
      gatewayAgentId: agentId,
      gatewayWorkspaceId: workspaceId,
    },
  });

  return {
    id: created.id,
    gatewayAgentId: created.gatewayAgentId,
    gatewayWorkspaceId: created.gatewayWorkspaceId,
  };
}
