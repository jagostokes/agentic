"use client";

/**
 * WebSocket chat client for the OpenClaw gateway.
 * Connects to NEXT_PUBLIC_GATEWAY_WS_URL, sends identify (agentId + token from /api/chat/token),
 * then user_message; streams assistant messages into the UI.
 *
 * TODO: Align message types and WS protocol with OpenClaw/Clawdbot gateway docs.
 */

import { useCallback, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  agentId: string;
  /** When true, do not connect to gateway; show demo message instead. */
  isDemoPlaceholder?: boolean;
};

const WS_URL = process.env.NEXT_PUBLIC_GATEWAY_WS_URL ?? "";

export function AgentChat({ agentId, isDemoPlaceholder = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const tokenRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAssistantIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  const connect = useCallback(async () => {
    if (isDemoPlaceholder) return;
    if (!WS_URL) {
      setStatus("error");
      setErrorMessage("NEXT_PUBLIC_GATEWAY_WS_URL is not set");
      return;
    }

    setStatus("connecting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/chat/token");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to get chat token");
      }
      const data = (await res.json()) as { token: string; agentId: string };
      tokenRef.current = data.token;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        ws.send(
          JSON.stringify({
            type: "identify",
            agentId: data.agentId,
            token: data.token,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as {
            type?: string;
            text?: string;
            delta?: string;
            messageId?: string;
          };
          // TODO: Adapt to gateway message shape (e.g. type: "assistant_delta" or "assistant_message")
          if (payload.type === "assistant_delta" && payload.delta) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: last.content + (payload.delta ?? "") },
                ];
              }
              const id = payload.messageId ?? `msg-${Date.now()}`;
              return [...prev, { id, role: "assistant", content: payload.delta ?? "" }];
            });
          } else if (payload.type === "assistant_message" && payload.text) {
            setMessages((prev) => {
              const id = payload.messageId ?? `msg-${Date.now()}`;
              return [...prev, { id, role: "assistant", content: payload.text! }];
            });
          } else if (payload.type === "error" && payload.text) {
            setErrorMessage(payload.text);
          }
        } catch {
          // Non-JSON or unknown message; ignore
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        setStatus("idle");
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setStatus("error");
        setErrorMessage("WebSocket error");
      };
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Connection failed");
    }
  }, [isDemoPlaceholder]);

  useEffect(() => {
    if (isDemoPlaceholder) return;
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect, isDemoPlaceholder]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        type: "user_message",
        agentId,
        text,
      })
    );
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: text },
    ]);
    setInput("");
  }, [input, agentId]);

  if (isDemoPlaceholder) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <p className="text-gray-600 max-w-md">
          Demo mode. Connect an OpenClaw gateway (<code className="text-sm bg-gray-100 px-1 rounded">OPENCLAW_GATEWAY_URL</code> and{" "}
          <code className="text-sm bg-gray-100 px-1 rounded">NEXT_PUBLIC_GATEWAY_WS_URL</code>) to enable live chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {status === "connecting" && (
        <div className="px-4 py-2 bg-amber-50 text-amber-800 text-sm flex items-center gap-2">
          <span className="animate-pulse">Connecting to agent…</span>
        </div>
      )}
      {status === "error" && errorMessage && (
        <div className="px-4 py-2 bg-red-50 text-red-800 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={connect}
            className="text-red-600 underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && status === "connected" && (
          <p className="text-gray-500 text-sm">Send a message to start.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message…"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={status !== "connected"}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={status !== "connected" || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
