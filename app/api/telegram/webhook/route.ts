/**
 * POST /api/telegram/webhook
 * Called by your Telegram bot service when a user starts the bot with a claim token.
 * Body: { token: string, telegramUserId: string }
 * Resolves the claim, upserts AgentBinding, and calls the gateway to bind Telegram to the agent.
 *
 * TODO: Secure this route (e.g. shared secret header or IP allowlist) so only your bot can call it.
 */
import { supabase } from "@/lib/supabase";
import { bindTelegramToAgent } from "@/lib/gateway";
import { NextResponse } from "next/server";

type WebhookBody = {
  token?: string;
  telegramUserId?: string;
};

export async function POST(request: Request) {
  let body: WebhookBody;
  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, telegramUserId } = body;
  if (!token || !telegramUserId) {
    return NextResponse.json(
      { error: "Missing token or telegramUserId" },
      { status: 400 }
    );
  }

  const { data: claim, error: claimError } = await supabase
    .from("agent_binding_claims")
    .select("id, agent_id, expires_at, agents(gateway_agent_id, user_id)")
    .eq("token", token)
    .single();

  type ClaimRow = {
    id: string;
    agent_id: string;
    expires_at: string;
    agents: { gateway_agent_id: string; user_id: string } | null;
  };

  const c = claim as ClaimRow | null;
  if (claimError || !c || new Date(c.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  if (!c.agents) {
    return NextResponse.json({ error: "Agent not found" }, { status: 400 });
  }

  const { agent_id: agentId, agents: agent } = c;
  const gatewayAgentId = agent.gateway_agent_id;
  const userId = agent.user_id;

  await supabase.from("agent_bindings").upsert(
    {
      user_id: userId,
      agent_id: agentId,
      channel_type: "telegram",
      channel_user_id: telegramUserId,
    },
    { onConflict: "agent_id,channel_type,channel_user_id" }
  );

  try {
    await bindTelegramToAgent(gatewayAgentId, telegramUserId);
  } catch (err) {
    console.error("Gateway bindTelegramToAgent failed:", err);
    return NextResponse.json(
      { error: "Failed to bind Telegram to gateway" },
      { status: 500 }
    );
  }

  await supabase.from("agent_binding_claims").delete().eq("id", c.id);

  return NextResponse.json({ ok: true });
}
