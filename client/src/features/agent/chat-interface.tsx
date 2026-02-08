import { useState, useRef, useEffect, useCallback } from "react";
import anime from "animejs";
import {
  Bot,
  User,
  Send,
  Paperclip,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createRipple, easings, durations } from "@/lib/animations";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};

// Typing indicator component
function TypingIndicator() {
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dotsRef.current) {
      const dots = dotsRef.current.querySelectorAll("span");
      anime({
        targets: dots,
        translateY: [-4, 0],
        opacity: [0.4, 1],
        delay: anime.stagger(150),
        duration: 400,
        loop: true,
        direction: "alternate",
        easing: easings.gentle,
      });
    }
  }, []);

  return (
    <div ref={dotsRef} className="flex items-center gap-1 px-1">
      <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
      <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
      <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
    </div>
  );
}

// Message bubble component
function MessageBubble({
  message,
  index,
  onCopy,
  onRegenerate,
}: {
  message: Message;
  index: number;
  onCopy: (content: string) => void;
  onRegenerate?: () => void;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  useEffect(() => {
    if (bubbleRef.current) {
      anime({
        targets: bubbleRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: durations.normal,
        delay: index * 50,
        easing: easings.smooth,
      });
    }
  }, [index]);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "group flex gap-2 px-3 py-2",
        isUser ? "flex-row-reverse" : "flex-row",
        "opacity-0"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
          isUser
            ? "border-border bg-background"
            : "border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
        ) : (
          <Bot className="h-3.5 w-3.5 text-[hsl(var(--primary))]" strokeWidth={2} />
        )}
      </div>

      {/* Message content */}
      <div className={cn("flex flex-col gap-1 max-w-[75%]", isUser && "items-end")}>
        <div className="flex items-center gap-2">
          <span className="caps-label text-[9px] text-muted-foreground">
            {isUser ? "YOU" : "JARVIS"}
          </span>
          <span className="text-[9px] text-muted-foreground/60">
            {message.timestamp.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div
          className={cn(
            "rounded-lg border px-3 py-2",
            isUser
              ? "border-border bg-[hsl(var(--muted))]"
              : "border-[hsl(var(--primary))]/20 bg-background"
          )}
        >
          {message.isStreaming ? (
            <TypingIndicator />
          ) : (
            <div className="mono text-[12px] leading-relaxed text-foreground whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>

        {/* Actions */}
        {!message.isStreaming && (
          <div
            className={cn(
              "flex items-center gap-1 opacity-0 transition-opacity duration-200",
              "group-hover:opacity-100"
            )}
          >
            <button
              onClick={handleCopy}
              className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-muted-foreground hover:bg-[hsl(var(--muted))] hover:text-foreground transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="text-[9px] caps-label">{copied ? "COPIED" : "COPY"}</span>
            </button>

            {!isUser && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-muted-foreground hover:bg-[hsl(var(--muted))] hover:text-foreground transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="text-[9px] caps-label">REGENERATE</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll(".animate-item"),
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: durations.normal,
        easing: easings.smooth,
      });
    }
  }, []);

  const suggestions = [
    "Add security task",
    "Monitor competitors",
    "Check system health",
    "Research trends",
  ];

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col items-center justify-center gap-4 p-4"
    >
      <div className="animate-item flex h-12 w-12 items-center justify-center rounded-xl border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 opacity-0">
        <Sparkles className="h-6 w-6 text-[hsl(var(--primary))]" strokeWidth={1.5} />
      </div>

      <div className="animate-item text-center opacity-0">
        <h3 className="mono text-[13px] font-semibold text-foreground">Update priorities</h3>
        <p className="mt-1 text-[11px] text-muted-foreground max-w-[250px]">
          Tell me what to focus on
        </p>
      </div>

      <div className="animate-item grid grid-cols-2 gap-2 opacity-0">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className={cn(
              "rounded-lg border border-border bg-background px-3 py-2 text-left",
              "hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]",
              "transition-all duration-200 active:scale-[0.98]"
            )}
          >
            <span className="mono text-[11px] text-foreground">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  const handleCopy = (content: string) => {
    navigator.clipboard?.writeText(content);
  };

  const getAIResponse = async (userMessage: string) => {
    // Add streaming placeholder
    const assistantId = `msg-${Date.now()}-assistant`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      // First, determine if this is an action request or a question
      const classifyResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a message classifier. Determine if the user's message is:
1. ACTION - A request to DO something (e.g., "send an email", "analyze data", "check the weather", "schedule a meeting", "write code", "research topics")
2. QUESTION - A request for information or clarification (e.g., "what is...", "how does...", "explain...", "tell me about...")

Respond with ONLY ONE WORD: either "ACTION" or "QUESTION".

Examples:
- "send an email to John" → ACTION
- "analyze the sales data" → ACTION
- "check the weather tomorrow" → ACTION
- "what's the weather like?" → QUESTION
- "how do I send an email?" → QUESTION
- "explain how weather works" → QUESTION
- "schedule a meeting for 3pm" → ACTION
- "when should I schedule the meeting?" → QUESTION`
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        }),
      });

      if (!classifyResponse.ok) {
        throw new Error("Failed to classify message");
      }

      const classifyData = await classifyResponse.json();
      const classification = classifyData.choices?.[0]?.message?.content?.trim().toUpperCase();

      if (classification === "ACTION") {
        // This is an action request - create a task

        // Parse task with Grok
        const parseResponse = await fetch("/api/tasks/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: userMessage }),
        });

        if (!parseResponse.ok) {
          throw new Error("Failed to parse task");
        }

        const parsedTask = await parseResponse.json();

        // Create the task
        const createResponse = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsedTask),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create task");
        }

        const newTask = await createResponse.json();

        // Show success message
        const successMessage = `✓ Task created: "${newTask.title}"\n\n${newTask.description || "No additional details"}\n\nI'll get started on this right away.`;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: successMessage, isStreaming: false }
              : msg
          )
        );

        // Trigger a custom event to refresh tasks
        window.dispatchEvent(new CustomEvent("task-created", { detail: newTask }));
      } else {
        // This is a question - respond normally
        const conversationMessages = [
          {
            role: "system",
            content: "You are Jarvis, a helpful AI assistant. Answer questions clearly, concisely, and professionally. Provide accurate information and helpful guidance."
          },
          ...messages.filter(m => !m.isStreaming).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: "user",
            content: userMessage
          }
        ];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: conversationMessages,
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: aiResponse, isStreaming: false }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error getting AI response:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: "I apologize, but I encountered an error processing your request. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    await getAIResponse(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      // Remove last assistant message and regenerate
      setMessages((prev) => prev.slice(0, -1));
      setIsGenerating(true);
      getAIResponse(lastUserMessage.content);
    }
  };

  const handleStop = () => {
    setIsGenerating(false);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isStreaming ? { ...msg, content: "[Generation stopped]", isStreaming: false } : msg
      )
    );
  };

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 border-b border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10">
              <Bot className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={2} />
            </div>
            <div>
              <div className="mono text-[12px] font-semibold text-foreground">Jarvis Chat</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[hsl(var(--muted))]">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isGenerating ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                )}
              />
              <span className="caps-label text-[9px] text-muted-foreground">
                {isGenerating ? "PROCESSING" : "ONLINE"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Messages area - scrollable within fixed height */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={(text) => setInput(text)} />
        ) : (
          <div className="flex flex-col py-2">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                index={index}
                onCopy={handleCopy}
                onRegenerate={
                  message.role === "assistant" && index === messages.length - 1
                    ? handleRegenerate
                    : undefined
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Compact Input area */}
      <div className="flex-shrink-0 border-t border-border p-3">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Jarvis..."
              rows={1}
              className={cn(
                "mono w-full resize-none rounded-lg border border-border bg-[hsl(var(--muted))] px-3 py-2 pr-10 text-[12px]",
                "placeholder:text-muted-foreground/60",
                "focus:border-[hsl(var(--primary))]/50 focus:outline-none focus:ring-0",
                "transition-colors duration-200",
                "max-h-[100px]"
              )}
              disabled={isGenerating}
            />
            <button
              className={cn(
                "absolute bottom-1.5 right-1.5 p-1.5 rounded-md",
                "text-muted-foreground hover:text-foreground hover:bg-background",
                "transition-colors duration-150"
              )}
              title="Attach file"
            >
              <Paperclip className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          {isGenerating ? (
            <button
              onClick={handleStop}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                "border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10",
                "text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/20",
                "transition-colors duration-150"
              )}
              title="Stop generating"
            >
              <StopCircle className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                createRipple(e);
                handleSend();
              }}
              disabled={!input.trim()}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden",
                "border border-[hsl(var(--primary))] bg-[hsl(var(--primary))]",
                "text-white hover:bg-[hsl(var(--primary))]/90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-150 active:scale-95"
              )}
              title="Send message"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
