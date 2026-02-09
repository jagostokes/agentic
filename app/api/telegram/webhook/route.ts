/**
 * POST /api/telegram/webhook
 * Called by your Telegram bot service when a user starts the bot with a claim token.
 * Body: { token: string, telegramUserId: string }
 * Resolves the claim, upserts AgentBinding, and calls the gateway to bind Telegram to the agent.
 *
 * TODO: Secure this route (e.g. shared secret header or IP allowlist) so only your bot can call it.
 */
import { prisma } from "@/lib/prisma";
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

  const claim = await prisma.agentBindingClaim.findUnique({
    where: { token },
    include: { agent: true },
  });

  if (!claim || claim.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const { agentId, agent } = claim;

  await prisma.agentBinding.upsert({
    where: {
      agentId_channelType_channelUserId: {
        agentId,
        channelType: "telegram",
        channelUserId: telegramUserId,
      },
    },
    create: {
      userId: agent.userId,
      agentId,
      channelType: "telegram",
      channelUserId: telegramUserId,
    },
    update: {},
  });

  try {
    await bindTelegramToAgent(agent.gatewayAgentId, telegramUserId);
  } catch (err) {
    console.error("Gateway bindTelegramToAgent failed:", err);
    return NextResponse.json(
      { error: "Failed to bind Telegram to gateway" },
      { status: 500 }
    );
  }

  await prisma.agentBindingClaim.delete({ where: { id: claim.id } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
