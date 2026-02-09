/**
 * Returns a short-lived JWT for the authenticated user's agent to use when
 * connecting to the gateway WebSocket. Client calls this before opening WS.
 */
import { auth } from "@/auth";
import { ensureUserAgent } from "@/lib/agent";
import { createChatToken } from "@/lib/chat-token";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const agent = await ensureUserAgent(session.user.id);
  const token = await createChatToken(agent.gatewayAgentId);

  return Response.json({ token, agentId: agent.gatewayAgentId });
}
