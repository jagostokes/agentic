/**
 * Dashboard page: loads user and agent, renders chat + side panel.
 * ensureUserAgent runs here so the user has an agent before chat mounts.
 */
import { auth } from "@/auth";
import { ensureUserAgent } from "@/lib/agent";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const agent = await ensureUserAgent(session.user.id);

  return (
    <DashboardClient
      user={{
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      }}
      agentId={agent.gatewayAgentId}
      agentDbId={agent.id}
    />
  );
}
