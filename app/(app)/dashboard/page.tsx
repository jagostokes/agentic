/**
 * Dashboard page: loads user and agent, renders chat + side panel.
 * ensureUserAgent runs here so the user has an agent before chat mounts.
 */
import { auth } from "@/auth";
import { ensureUserAgent, isDemoPlaceholderAgent } from "@/lib/agent";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const isDemo = session.user.email === "demo@demo.local";
  let userId = session.user.id;
  // Session id must be a real UUID for DB; fix legacy "demo" id for demo user
  if (isDemo && !UUID_REGEX.test(userId)) {
    const { data: upserted } = await supabase
      .from("users")
      .upsert(
        {
          email: "demo@demo.local",
          name: "Demo User",
          image: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select("id")
      .single();
    if (upserted?.id) {
      userId = upserted.id;
    } else {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", "demo@demo.local")
        .maybeSingle();
      if (existing?.id) userId = existing.id;
    }
  }

  const agent = await ensureUserAgent(userId, {
    skipGateway: isDemo,
  });

  return (
    <DashboardClient
      user={{
        id: userId,
        email: session.user.email ?? "",
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      }}
      agentId={agent.gatewayAgentId}
      agentDbId={agent.id}
      isDemo={isDemo}
      isDemoPlaceholder={isDemoPlaceholderAgent(agent.gatewayAgentId)}
    />
  );
}
