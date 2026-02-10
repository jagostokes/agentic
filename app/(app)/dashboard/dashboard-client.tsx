"use client";

/**
 * Client wrapper for dashboard: header, chat panel, side panel with Telegram claim.
 */
import { signOut } from "next-auth/react";
import { AgentChat } from "@/components/agent-chat";
import { ConnectTelegram } from "@/components/connect-telegram";
import Image from "next/image";

type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

type Props = {
  user: User;
  agentId: string;
  agentDbId: string;
  isDemo?: boolean;
  /** True when agent is placeholder (no real gateway); chat shows demo message instead of connecting. */
  isDemoPlaceholder?: boolean;
};

export function DashboardClient({
  user,
  agentId,
  agentDbId,
  isDemo = false,
  isDemoPlaceholder = false,
}: Props) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          {user.image && (
            <Image
              src={user.image}
              alt=""
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="font-medium text-gray-800">
            {user.name ?? user.email}
          </span>
          {isDemo && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              Demo
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          {isDemo ? "Leave demo" : "Sign out"}
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <main className="flex-1 flex flex-col min-w-0">
          <AgentChat agentId={agentId} isDemoPlaceholder={isDemoPlaceholder} />
        </main>
        <aside className="w-72 border-l border-gray-200 bg-white p-4 flex flex-col gap-4 shrink-0">
          <h2 className="text-sm font-semibold text-gray-700">Integrations</h2>
          <ConnectTelegram agentId={agentDbId} />
        </aside>
      </div>
    </div>
  );
}
