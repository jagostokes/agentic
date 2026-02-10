/**
 * Server-side Supabase client (service role). Use for all DB access from API routes and server code.
 * Never expose the service role key to the client.
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase(): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Singleton for server use (avoids creating new client per request in dev)
const globalForSupabase = globalThis as unknown as { supabase: SupabaseClient | undefined };

export const supabase: SupabaseClient = globalForSupabase.supabase ?? getSupabase();
if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}

// DB row types (snake_case to match Supabase tables)
export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentRow = {
  id: string;
  user_id: string;
  gateway_agent_id: string;
  gateway_workspace_id: string;
  created_at: string;
  updated_at: string;
};

export type AgentBindingRow = {
  id: string;
  user_id: string;
  agent_id: string;
  channel_type: "telegram";
  channel_user_id: string;
  created_at: string;
  updated_at: string;
};

export type AgentBindingClaimRow = {
  id: string;
  agent_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};
