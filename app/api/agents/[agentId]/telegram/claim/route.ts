/**
 * POST /api/agents/:agentId/telegram/claim
 * Validates that the requester owns this agent, creates an AgentBindingClaim (10 min expiry),
 * returns a Telegram deep link: https://t.me/<MY_TELEGRAM_BOT>?start=<token>
 *
 * TODO: Set TELEGRAM_BOT_USERNAME in env (e.g. "MyOpenClawBot" -> https://t.me/MyOpenClawBot).
 */
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME ?? "YOUR_BOT_USERNAME";

function generateClaimToken(): string {
  return randomBytes(8).toString("hex"); // 16 chars
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId } = await params;

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .eq("user_id", session.user.id)
    .single();

  if (agentError || !agent) {
    return NextResponse.json({ error: "Agent not found or access denied" }, { status: 404 });
  }

  const token = generateClaimToken();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const { error: claimError } = await supabase.from("agent_binding_claims").insert({
    agent_id: agent.id,
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (claimError) {
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 });
  }

  const deepLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${token}`;

  return NextResponse.json({ deepLink });
}
