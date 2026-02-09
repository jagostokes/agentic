"use client";

/**
 * "Connect Telegram" button: calls POST /api/agents/:id/telegram/claim and
 * displays the returned deep link for the user to open in Telegram.
 */
import { useState } from "react";

type Props = {
  agentId: string;
};

export function ConnectTelegram({ agentId }: Props) {
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    setDeepLink(null);
    try {
      const res = await fetch(`/api/agents/${agentId}/telegram/claim`, {
        method: "POST",
      });
      const data = (await res.json()) as { deepLink?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to get Telegram link");
      }
      if (data.deepLink) {
        setDeepLink(data.deepLink);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClaim}
        disabled={loading}
        className="w-full px-4 py-2 bg-[#0088cc] text-white rounded-lg text-sm font-medium hover:bg-[#0077b5] disabled:opacity-50 transition"
      >
        {loading ? "Generating link…" : "Connect Telegram"}
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {deepLink && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Open this link in Telegram to link your account:</p>
          <a
            href={deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 underline break-all"
          >
            {deepLink}
          </a>
          <p className="text-xs text-gray-500">Link expires in 10 minutes.</p>
        </div>
      )}
    </div>
  );
}
