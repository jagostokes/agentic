import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import anime from "animejs";
import {
  Activity,
  Bot,
  Brain,
  Check,
  ChevronsUpDown,
  Cpu,
  Flame,
  History,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  User,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStaggerEntrance,
  usePulse,
  useHoverAnimation,
  useAccordion,
  useShake,
  useBreathingGlow,
} from "@/hooks/use-animations";
import { createRipple, scalePop, staggerEntrance, easings, durations } from "@/lib/animations";
import Chat from "@/features/agent/chat";
import Security from "@/features/agent/security";
import ContextModification from "@/features/agent/context-modification";
import NewAgent from "@/features/agent/new-agent";
import Soul from "@/features/agent/soul";

type Health = "OK" | "DEGRADED" | "INCIDENT";

type Gateway = {
  id: string;
  label: string;
};

type BriefLine = {
  id: string;
  label: string;
  value: string;
  severity?: "normal" | "attention";
};

type CompetitorItem = {
  id: string;
  name: string;
  summary: string;
  velocity: number;
  views: number;
  timestamp: string;
};

type SignalItem = {
  id: string;
  source: string;
  headline: string;
  implication: string;
  timestamp: string;
};

type TaskItem = {
  id: string;
  title: string;
  status: "done" | "pending" | "failed";
  details: string;
};

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { label: string; icon: React.ComponentType<{ className?: string }> }[];
};

const navItems: NavItem[] = [
  { id: "new-agent", label: "NEW AGENT", icon: Plus },
  {
    id: "agent-a",
    label: "Agent A",
    icon: Bot,
    subItems: [
      { label: "CHAT", icon: MessageSquare },
      { label: "SECURITY", icon: ShieldCheck },
      { label: "CONTEXT MODIFICATION", icon: Brain },
      { label: "ABILITIES", icon: Zap },
      { label: "SOUL / PURPOSE", icon: Sparkles },
      { label: "HISTORY", icon: History },
      { label: "RECURRING TASKS", icon: Activity },
    ]
  },
];

// Animated Health Pill with pulse effect
function HealthPill({ health }: { health: Health }) {
  const dotRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cfg =
    health === "OK"
      ? { dot: "bg-emerald-500", text: "OK", sub: "Nominal", color: "#10b981" }
      : health === "DEGRADED"
        ? { dot: "bg-amber-500", text: "DEGRADED", sub: "Watch", color: "#f59e0b" }
        : { dot: "bg-red-500", text: "INCIDENT", sub: "Act", color: "#ef4444" };

  usePulse(dotRef, { active: true, scale: 1.3, duration: health === "INCIDENT" ? 600 : 1500 });
  useBreathingGlow(containerRef, {
    active: health === "INCIDENT",
    color: "rgba(239, 68, 68, 0.4)",
    duration: 1000
  });

  // Animate text change
  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        scale: [0.95, 1],
        duration: durations.fast,
        easing: easings.snappy,
      });
    }
  }, [health]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5",
        "transition-all duration-300",
        health === "INCIDENT" && "border-red-500/50"
      )}
      data-testid="status-global-health"
      aria-label={`Global health ${cfg.text}`}
      title={`Global health: ${cfg.text}`}
    >
      <span
        ref={dotRef}
        className={cn("h-2 w-2 rounded-full", cfg.dot)}
        aria-hidden="true"
      />
      <div className="flex flex-col leading-none">
        <span className="mono text-[12px] font-semibold tracking-tight text-foreground">{cfg.text}</span>
        <span className="caps-label text-[10px] text-muted-foreground">{cfg.sub}</span>
      </div>
    </div>
  );
}

function GatewaySelect({
  value,
  gateways,
  onChange,
}: {
  value: string;
  gateways: Gateway[];
  onChange: (id: string) => void;
}) {
  const selectRef = useRef<HTMLDivElement>(null);
  useHoverAnimation(selectRef, { lift: true });

  return (
    <div ref={selectRef} className="relative" data-testid="group-gateway-selector">
      <select
        className={cn(
          "mono h-9 w-[260px] appearance-none rounded-md border border-border bg-background px-3 pr-9 text-[12px] text-foreground",
          "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none",
          "[&:focus]:outline-none transition-all duration-200",
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="select-gateway"
        aria-label="Active gateway selector"
      >
        {gateways.map((g) => (
          <option key={g.id} value={g.id}>
            {g.label}
          </option>
        ))}
      </select>
      <ChevronsUpDown
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--primary))]"
        strokeWidth={2}
        aria-hidden="true"
      />
    </div>
  );
}

function ResyncButton({
  onClick,
  state,
}: {
  onClick: () => Promise<void>;
  state: "idle" | "pending" | "resolved" | "failed";
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  useShake(buttonRef, state === "failed", { intensity: 8 });

  // Spinning animation for pending state
  useEffect(() => {
    if (state === "pending" && iconRef.current) {
      anime({
        targets: iconRef.current,
        rotate: "1turn",
        duration: 800,
        loop: true,
        easing: "linear",
      });
    } else if (iconRef.current) {
      anime.remove(iconRef.current);
      iconRef.current.style.transform = "";
    }
  }, [state]);

  // Success animation
  useEffect(() => {
    if (state === "resolved" && buttonRef.current) {
      anime({
        targets: buttonRef.current,
        scale: [1, 1.05, 1],
        duration: 300,
        easing: easings.bounce,
      });
    }
  }, [state]);

  const label =
    state === "pending"
      ? "Re-syncing…"
      : state === "resolved"
        ? "Re-synced"
        : state === "failed"
          ? "Failed"
          : "Re-sync";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    void onClick();
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        "group relative inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-[12px]",
        "hover:bg-[hsl(var(--muted))] active:bg-[hsl(var(--muted))]",
        "transition-colors duration-150 overflow-hidden",
        state === "failed" && "border-[hsl(var(--destructive))]",
        state === "resolved" && "border-emerald-500",
      )}
      onClick={handleClick}
      data-testid="button-resync"
      aria-label="Hard refresh / resync"
    >
      <RefreshCw
        ref={iconRef}
        className={cn(
          "h-4 w-4",
          state === "failed" ? "text-[hsl(var(--destructive))]" :
          state === "resolved" ? "text-emerald-500" :
          "text-muted-foreground group-hover:text-foreground",
        )}
        strokeWidth={2}
        aria-hidden="true"
      />
      <span className={cn(
        "mono",
        state === "failed" ? "text-[hsl(var(--destructive))]" :
        state === "resolved" ? "text-emerald-500" :
        "text-foreground"
      )}>{label}</span>
    </button>
  );
}

function SectionHeader({
  title,
  meta,
  right,
}: {
  title: string;
  meta?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="caps-label text-muted-foreground" data-testid={`text-section-label-${title.toLowerCase().replace(/\s+/g, "-")}`}>
          {title}
        </div>
        {meta ? <div className="mt-1 text-[12px] text-muted-foreground">{meta}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

// Animated Block component
function Block({
  children,
  danger,
  className,
  animationDelay = 0,
}: {
  children: React.ReactNode;
  danger?: boolean;
  className?: string;
  animationDelay?: number;
}) {
  const blockRef = useRef<HTMLElement>(null);

  useHoverAnimation(blockRef, { lift: true, glow: danger });

  useEffect(() => {
    if (blockRef.current) {
      blockRef.current.style.opacity = "0";
      blockRef.current.style.transform = "translateY(20px)";

      anime({
        targets: blockRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: durations.normal,
        delay: animationDelay,
        easing: easings.smooth,
      });
    }
  }, [animationDelay]);

  return (
    <section
      ref={blockRef}
      className={cn(
        "rounded-lg border bg-card p-4 transition-shadow duration-300",
        danger ? "border-[hsl(var(--destructive))]" : "border-border",
        className
      )}
      data-testid={danger ? "panel-danger" : "panel-standard"}
    >
      {children}
    </section>
  );
}

function StatusInline({ state }: { state: "idle" | "pending" | "resolved" | "failed" }) {
  const dotRef = useRef<HTMLSpanElement>(null);

  usePulse(dotRef, { active: state === "pending", duration: 800 });

  const map = {
    idle: { label: "IDLE", dot: "bg-muted-foreground" },
    pending: { label: "PENDING", dot: "bg-amber-500" },
    resolved: { label: "RESOLVED", dot: "bg-emerald-500" },
    failed: { label: "FAILED", dot: "bg-[hsl(var(--destructive))]" },
  } as const;
  const cfg = map[state];

  return (
    <div className="flex items-center gap-2" data-testid={`status-async-${state}`}>
      <span ref={dotRef} className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} aria-hidden="true" />
      <span className="caps-label text-[10px] text-muted-foreground">{cfg.label}</span>
    </div>
  );
}

// Animated list item component
function AnimatedListItem({
  children,
  index,
  className,
  onClick,
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
  onClick?: () => void;
}) {
  const itemRef = useRef<HTMLDivElement>(null);

  useHoverAnimation(itemRef, { lift: true });

  useEffect(() => {
    if (itemRef.current) {
      itemRef.current.style.opacity = "0";
      itemRef.current.style.transform = "translateX(-10px)";

      anime({
        targets: itemRef.current,
        translateX: [-10, 0],
        opacity: [0, 1],
        duration: durations.fast,
        delay: index * 50,
        easing: easings.smooth,
      });
    }
  }, [index]);

  return (
    <div
      ref={itemRef}
      className={cn("transition-shadow duration-200", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Animated Task Card with accordion
function TaskCard({ task, expanded, onToggle, index }: {
  task: TaskItem;
  expanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLSpanElement>(null);
  const failed = task.status === "failed";

  useHoverAnimation(cardRef, { lift: true, glow: failed });
  useAccordion(contentRef, expanded);
  usePulse(checkRef, { active: task.status === "pending", duration: 1200 });

  // Entry animation
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.opacity = "0";
      cardRef.current.style.transform = "translateY(15px)";

      anime({
        targets: cardRef.current,
        translateY: [15, 0],
        opacity: [0, 1],
        duration: durations.normal,
        delay: index * 80,
        easing: easings.smooth,
      });
    }
  }, [index]);

  // Checkmark animation on completion
  useEffect(() => {
    if (task.status === "done" && checkRef.current) {
      anime({
        targets: checkRef.current,
        scale: [0.5, 1.2, 1],
        rotate: ["-10deg", "10deg", "0deg"],
        duration: 400,
        easing: easings.bounce,
      });
    }
  }, [task.status]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "rounded-md border px-3 py-2 transition-all duration-300",
        failed ? "border-[hsl(var(--destructive))]" : "border-border"
      )}
      data-testid={`card-task-${task.id}`}
    >
      <button
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={onToggle}
        data-testid={`button-task-toggle-${task.id}`}
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            ref={checkRef}
            className={cn(
              "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border transition-all duration-200",
              task.status === "done"
                ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                : failed
                  ? "border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10"
                  : "border-border text-muted-foreground",
            )}
            data-testid={`status-task-checkbox-${task.id}`}
            aria-label={`Task status ${task.status}`}
          >
            {task.status === "done" ? (
              <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
            ) : failed ? (
              <X className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <Activity className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <div
              className={cn(
                "mono text-[12px] font-semibold leading-snug",
                failed ? "text-[hsl(var(--destructive))]" : "text-foreground",
              )}
              data-testid={`text-task-title-${task.id}`}
            >
              {task.title}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="caps-label text-muted-foreground" data-testid={`text-task-id-${task.id}`}>
                {task.id.toUpperCase()}
              </span>
              <span
                className={cn(
                  "caps-label",
                  task.status === "done"
                    ? "text-emerald-600"
                    : task.status === "failed"
                      ? "text-[hsl(var(--destructive))]"
                      : "text-amber-600",
                )}
                data-testid={`text-task-status-${task.id}`}
              >
                {task.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <span className="caps-label text-muted-foreground transition-all duration-200" data-testid={`text-task-expand-${task.id}`}>
          {expanded ? "COLLAPSE" : "EXPAND"}
        </span>
      </button>

      <div ref={contentRef} style={{ overflow: "hidden" }}>
        <div
          className="mt-3 rounded-md border border-border bg-background px-3 py-2"
          data-testid={`panel-task-details-${task.id}`}
        >
          <div className="mono text-[12px] leading-snug text-foreground" data-testid={`text-task-details-${task.id}`}>
            {task.details}
          </div>
        </div>
      </div>
    </div>
  );
}

// Animated Nav Button
function NavButton({
  item,
  active,
  onClick,
  onSubClick,
  activeSubTab,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  onSubClick?: (label: string) => void;
  activeSubTab?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const Icon = item.icon;

  // Active indicator animation
  useEffect(() => {
    if (indicatorRef.current) {
      anime({
        targets: indicatorRef.current,
        scaleY: active ? [0, 1] : [1, 0],
        opacity: active ? [0, 1] : [1, 0],
        duration: durations.fast,
        easing: easings.snappy,
      });
    }
  }, [active]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e, "rgba(196, 0, 26, 0.2)");
    onClick();
  };

  return (
    <div className="relative group/nav-item">
      <button
        ref={buttonRef}
        className={cn(
          "relative flex h-10 w-full items-center gap-3 rounded-md px-3 text-left overflow-hidden",
          "transition-all duration-200",
          active ? "bg-[hsl(var(--muted))]" : "hover:bg-[hsl(var(--muted))]",
        )}
        onClick={handleClick}
        data-testid={`button-nav-${item.id}`}
        aria-current={active ? "page" : undefined}
      >
        <span
          ref={indicatorRef}
          className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 bg-[hsl(var(--primary))] origin-center"
          style={{ opacity: active ? 1 : 0, transform: `translateY(-50%) scaleY(${active ? 1 : 0})` }}
          aria-hidden="true"
        />
        <Icon
          className={cn(
            "h-4.5 w-4.5 transition-colors duration-200",
            active ? "text-[hsl(var(--primary))]" : "text-muted-foreground"
          )}
        />
        <span className="hidden text-[12px] font-medium text-foreground group-hover/sidebar:block">
          {item.label}
        </span>
      </button>

      {/* Sub-tabs popover */}
      {item.subItems && (
        <div className="absolute left-[calc(100%+8px)] top-0 z-50 hidden w-[180px] flex-col gap-0.5 rounded-md border border-border bg-popover p-1 shadow-lg group-hover/nav-item:flex group-hover/sidebar:hidden animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="px-2 py-1.5 caps-label text-[10px] text-muted-foreground border-b border-border mb-1">
            {item.label}
          </div>
          {item.subItems.map((sub, idx) => {
            const SubIcon = sub.icon;
            const isSubActive = active && activeSubTab === sub.label;
            return (
              <button
                key={sub.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubClick?.(sub.label);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-all duration-150",
                  isSubActive ? "bg-[hsl(var(--muted))] text-[hsl(var(--primary))]" : "hover:bg-[hsl(var(--muted))]"
                )}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <SubIcon className={cn(
                  "h-3.5 w-3.5 transition-colors duration-150",
                  isSubActive ? "text-[hsl(var(--primary))]" : "text-muted-foreground"
                )} />
                <span className="mono text-[10px] uppercase font-medium">{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Inline sub-items when expanded sidebar */}
      {item.subItems && (
        <div className="mt-1 hidden flex-col gap-1 pl-9 group-hover/sidebar:flex">
          {item.subItems.map((sub) => {
            const SubIcon = sub.icon;
            const isSubActive = active && activeSubTab === sub.label;
            return (
              <button
                key={sub.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubClick?.(sub.label);
                }}
                className={cn(
                  "flex items-center gap-2 py-1 text-left transition-all duration-150",
                  isSubActive ? "text-[hsl(var(--primary))]" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <SubIcon className="h-3.5 w-3.5" />
                <span className="mono text-[10px] uppercase font-medium">{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Background Tasks Panel
type BackgroundTask = {
  id: string;
  name: string;
  status: "running" | "completed" | "queued" | "failed";
  progress?: number;
  startedAt: string;
  description: string;
};

function BackgroundTasksPanel() {
  const [activeTaskId, setActiveTaskId] = useState<string>("bt1");
  const panelRef = useRef<HTMLDivElement>(null);

  const tasks: BackgroundTask[] = [
    {
      id: "bt1",
      name: "Dinner Reservation Valentines Day (NC Durham)",
      status: "running",
      progress: 45,
      startedAt: "5 min ago",
      description: "Searching for romantic restaurants in Durham, NC with availability on Valentine's Day. Comparing reviews, menus, and making reservations at top-rated locations.",
    },
    {
      id: "bt2",
      name: "Gmail Monitoring and File Sorting",
      status: "running",
      progress: 78,
      startedAt: "12 min ago",
      description: "Monitoring inbox for new emails, categorizing by priority, sorting attachments into appropriate folders, and flagging important messages for review.",
    },
    {
      id: "bt3",
      name: "Research Paper Due Tuesday",
      status: "running",
      progress: 62,
      startedAt: "1 hr ago",
      description: "Gathering research materials, analyzing academic papers, organizing notes, and preparing outline for research paper submission deadline on Tuesday.",
    },
  ];

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  useEffect(() => {
    if (panelRef.current) {
      anime({
        targets: panelRef.current,
        opacity: [0, 1],
        translateX: [20, 0],
        duration: durations.normal,
        delay: 200,
        easing: easings.smooth,
      });
    }
  }, []);

  const statusConfig = {
    running: { color: "bg-amber-500", label: "RUNNING", animate: true },
    completed: { color: "bg-emerald-500", label: "DONE", animate: false },
    queued: { color: "bg-muted-foreground", label: "QUEUED", animate: false },
    failed: { color: "bg-[hsl(var(--destructive))]", label: "FAILED", animate: false },
  };

  return (
    <div
      ref={panelRef}
      className="w-[320px] shrink-0 flex flex-col bg-background rounded-lg border border-border overflow-hidden"
      style={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="caps-label text-muted-foreground">BACKGROUND TASKS</div>
        <div className="mt-1 text-[11px] text-muted-foreground/70">
          {tasks.filter((t) => t.status === "running").length} running • {tasks.filter((t) => t.status === "queued").length} queued
        </div>
      </div>

      {/* Task tabs - vertical */}
      <div className="flex flex-1 min-h-0">
        <div className="w-[100px] shrink-0 border-r border-border bg-[hsl(var(--muted))]/30 overflow-y-auto">
          {tasks.map((task) => {
            const config = statusConfig[task.status];
            const isActive = task.id === activeTaskId;
            return (
              <button
                key={task.id}
                onClick={() => setActiveTaskId(task.id)}
                className={cn(
                  "w-full px-3 py-3 text-left border-b border-border transition-all duration-150",
                  "hover:bg-[hsl(var(--muted))]",
                  isActive && "bg-background border-l-2 border-l-[hsl(var(--primary))]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      config.color,
                      config.animate && "animate-pulse"
                    )}
                  />
                  <span className={cn(
                    "mono text-[10px] font-medium truncate",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {task.name}
                  </span>
                </div>
                <div className="mt-1 caps-label text-[8px] text-muted-foreground/70">
                  {config.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Task details */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTask && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      statusConfig[activeTask.status].color,
                      statusConfig[activeTask.status].animate && "animate-pulse"
                    )}
                  />
                  <span className="mono text-[13px] font-semibold text-foreground">
                    {activeTask.name}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="caps-label text-[10px] text-muted-foreground">
                    {statusConfig[activeTask.status].label}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    • {activeTask.startedAt}
                  </span>
                </div>
              </div>

              {activeTask.progress !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="caps-label text-[10px] text-muted-foreground">PROGRESS</span>
                    <span className="mono text-[11px] text-foreground">{activeTask.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                      style={{ width: `${activeTask.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div>
                <span className="caps-label text-[10px] text-muted-foreground">DETAILS</span>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {activeTask.description}
                </p>
              </div>

              {activeTask.status === "running" && (
                <button
                  className={cn(
                    "w-full mt-2 py-2 rounded-md border border-border",
                    "text-[11px] mono font-medium text-muted-foreground",
                    "hover:bg-[hsl(var(--muted))] hover:text-foreground",
                    "transition-colors duration-150"
                  )}
                >
                  PAUSE TASK
                </button>
              )}

              {activeTask.status === "failed" && (
                <button
                  className={cn(
                    "w-full mt-2 py-2 rounded-md border border-[hsl(var(--primary))]",
                    "text-[11px] mono font-medium text-[hsl(var(--primary))]",
                    "hover:bg-[hsl(var(--primary))]/10",
                    "transition-colors duration-150"
                  )}
                >
                  RETRY TASK
                </button>
              )}

              {activeTask.status === "queued" && (
                <button
                  className={cn(
                    "w-full mt-2 py-2 rounded-md border border-[hsl(var(--primary))] bg-[hsl(var(--primary))]",
                    "text-[11px] mono font-medium text-white",
                    "hover:bg-[hsl(var(--primary))]/90",
                    "transition-colors duration-150"
                  )}
                >
                  START NOW
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Floating particles background
function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const particles: HTMLDivElement[] = [];
    const count = 20;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: hsl(353, 100%, 38%);
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      containerRef.current.appendChild(particle);
      particles.push(particle);
    }

    anime({
      targets: particles,
      translateX: () => anime.random(-50, 50),
      translateY: () => anime.random(-50, 50),
      scale: () => [0, anime.random(0.5, 1.5), 0],
      opacity: () => [0, anime.random(0.05, 0.15), 0],
      duration: () => anime.random(4000, 8000),
      delay: () => anime.random(0, 3000),
      loop: true,
      easing: "easeInOutSine",
    });

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    />
  );
}

export default function Dashboard() {
  const gateways = useMemo<Gateway[]>(
    () => [
      { id: "gw-nyc-01", label: "GW.NYC-01 / 10.0.14.21" },
      { id: "gw-fra-02", label: "GW.FRA-02 / 10.7.1.9" },
      { id: "gw-sfo-00", label: "GW.SFO-00 / 10.9.0.3" },
    ],
    [],
  );

  const [activeNav, setActiveNav] = useState<string>("agent-a");
  const [activeSubTab, setActiveSubTab] = useState<string>("CHAT");
  const [health, setHealth] = useState<Health>("OK");
  const [activeGateway, setActiveGateway] = useState(gateways[0]?.id ?? "gw-nyc-01");
  const [resyncState, setResyncState] = useState<"idle" | "pending" | "resolved" | "failed">("idle");

  const [sendOnEnter, setSendOnEnter] = useState(false);
  const [input, setInput] = useState("");
  const [sendState, setSendState] = useState<"idle" | "pending" | "resolved" | "failed">("idle");

  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({
    t3: true,
  });

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Page load animations
  useEffect(() => {
    // Sidebar slide in
    if (sidebarRef.current) {
      anime({
        targets: sidebarRef.current,
        translateX: [-68, 0],
        opacity: [0, 1],
        duration: durations.slow,
        easing: easings.smooth,
      });
    }

    // Header fade in
    if (headerRef.current) {
      anime({
        targets: headerRef.current,
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: durations.normal,
        delay: 200,
        easing: easings.smooth,
      });
    }

    // Logo animation
    if (logoRef.current) {
      anime({
        targets: logoRef.current,
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: durations.normal,
        delay: 100,
        easing: easings.bounce,
      });
    }
  }, []);

  const briefLines = useMemo<BriefLine[]>(
    () => [
      { id: "b1", label: "Weather", value: "NYC 03:42 — 2°C, low visibility", severity: "normal" },
      { id: "b2", label: "Infra", value: "ws://gateway bus stable • 1.2k msg/min", severity: "normal" },
      { id: "b3", label: "External", value: "Model provider rate limits tightened (02:10Z)", severity: "attention" },
      { id: "b4", label: "Attention", value: "One agent deviated from runbook (SESSION-72F9)", severity: "attention" },
    ],
    [],
  );

  const competitors = useMemo<CompetitorItem[]>(
    () => [
      {
        id: "c1",
        name: "RIVAL/OPS",
        summary: "Shipped event-stream diff UI; claims 28% faster triage.",
        velocity: 82,
        views: 19403,
        timestamp: "02:21Z",
      },
      {
        id: "c2",
        name: "AGENTFORGE",
        summary: "Introduced cron-safe sandboxing; early instability reports.",
        velocity: 41,
        views: 8122,
        timestamp: "00:58Z",
      },
      {
        id: "c3",
        name: "STEALTH/PIPE",
        summary: "Hiring spike (4 eng roles) + pricing page changes detected.",
        velocity: 67,
        views: 12544,
        timestamp: "23:12Z",
      },
    ],
    [],
  );

  const signals = useMemo<SignalItem[]>(
    () => [
      {
        id: "s1",
        source: "Release",
        headline: "New tool-calling spec adds latency budgets per step",
        implication: "Strategic implication: enforce budgeted retries or lose competitive responsiveness.",
        timestamp: "01:08Z",
      },
      {
        id: "s2",
        source: "Media",
        headline: "Enterprise buyers shifting to on-prem inference pilots",
        implication: "Strategic implication: surface infra posture per gateway (cost / privacy / throughput).",
        timestamp: "00:19Z",
      },
      {
        id: "s3",
        source: "Platform",
        headline: "Browser sandbox hardening affects cross-tab WS reuse",
        implication: "Strategic implication: add explicit re-sync control and never assume auto-recovery.",
        timestamp: "23:46Z",
      },
    ],
    [],
  );

  const tasks = useMemo<TaskItem[]>(
    () => [
      {
        id: "t1",
        title: "Audit cron drift: JOB-118 (hourly ingest)",
        status: "done",
        details: "Checked last 12 runs; drift 0–2s. No missed ticks. IO stable on gw-fra-02.",
      },
      {
        id: "t2",
        title: "Summarize competitor UI changes (diff snapshots)",
        status: "pending",
        details: "Snapshot set captured; needs human sanity check on claim deltas + pricing edits.",
      },
      {
        id: "t3",
        title: "Investigate deviation: SESSION-72F9",
        status: "failed",
        details: "Agent attempted to override tool budget policy and retried 14x. Auto-halted. Logs attached: /runs/72F9. Failure demands intervention.",
      },
      {
        id: "t4",
        title: "Normalize channel taxonomy (ops/*, intel/*)",
        status: "done",
        details: "Updated mapping for 9 channels; two aliases remain for legacy agents.",
      },
    ],
    [],
  );

  const incidentMode = health === "INCIDENT";

  useEffect(() => {
    if (incidentMode) {
      document.documentElement.classList.add("dark");
      // Dramatic mode transition
      anime({
        targets: "body",
        backgroundColor: ["#ffffff", "#0a0a0a"],
        duration: 500,
        easing: easings.smooth,
      });
    } else {
      document.documentElement.classList.remove("dark");
      anime({
        targets: "body",
        backgroundColor: ["#0a0a0a", "#ffffff"],
        duration: 500,
        easing: easings.smooth,
      });
    }
  }, [incidentMode]);

  async function doResync() {
    if (resyncState === "pending") return;
    setResyncState("pending");
    await new Promise((r) => setTimeout(r, 650));
    const ok = Math.random() > 0.12;
    setResyncState(ok ? "resolved" : "failed");
    setTimeout(() => setResyncState("idle"), 1200);
  }

  async function doSend() {
    const trimmed = input.trim();
    if (!trimmed || sendState === "pending") return;
    setSendState("pending");
    await new Promise((r) => setTimeout(r, 520));
    const ok = Math.random() > 0.08;
    setSendState(ok ? "resolved" : "failed");
    if (ok) setInput("");
    setTimeout(() => setSendState("idle"), 1200);
  }

  function toggleTask(id: string) {
    setExpandedTasks((s) => ({ ...s, [id]: !s[id] }));
  }

  const dateLabel = useMemo(() => {
    const now = new Date();
    const m = now.toLocaleString(undefined, { month: "short" }).toUpperCase();
    const d = String(now.getDate()).padStart(2, "0");
    const y = now.getFullYear();
    return `${m} ${d}, ${y}`;
  }, []);

  const handleNavClick = useCallback((id: string) => {
    setActiveNav(id);
    if (id !== "agent-a") setActiveSubTab("");
  }, []);

  const handleSubTabClick = useCallback((label: string) => {
    setActiveNav("agent-a");
    setActiveSubTab(label);
  }, []);

  return (
    <div className={cn("min-h-screen bg-background text-foreground relative", !incidentMode && "scanlines")} data-testid="page-dashboard">
      <FloatingParticles />

      <div className="flex min-h-screen relative z-10">
        <aside
          ref={sidebarRef}
          className={cn(
            "group/sidebar relative flex w-[68px] flex-col border-r border-border bg-sidebar",
            "transition-[width] duration-300 ease-out hover:w-[220px]",
          )}
          data-testid="rail-control-plane"
          aria-label="Control plane"
          style={{ opacity: 0 }}
        >
          <div className="flex h-14 items-center justify-center border-b border-border px-3">
            <div ref={logoRef} className="flex items-center gap-2" style={{ opacity: 0 }}>
              <SquareTerminal className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2.4} aria-hidden="true" />
              <div className="hidden min-w-0 flex-col group-hover/sidebar:flex">
                <div
                  className="tight font-[650] leading-none"
                  style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                  data-testid="text-brand"
                >
                  CLAWDBOT
                </div>
                <div className="caps-label text-muted-foreground" data-testid="text-brand-sub">
                  GATEWAY
                </div>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-2 py-3" data-testid="nav-control-plane">
            {navItems.map((it) => (
              <NavButton
                key={it.id}
                item={it}
                active={it.id === activeNav}
                onClick={() => handleNavClick(it.id)}
                onSubClick={handleSubTabClick}
                activeSubTab={activeSubTab}
              />
            ))}
          </nav>

          <div className="border-t border-border p-2">
            <NavButton
              item={{ id: "account", label: "Your Account", icon: User }}
              active={activeNav === "account"}
              onClick={() => handleNavClick("account")}
            />
            <div className="mt-1">
              <NavButton
                item={{ id: "settings", label: "Settings", icon: Settings }}
                active={activeNav === "settings"}
                onClick={() => handleNavClick("settings")}
              />
            </div>
          </div>
        </aside>

        <main ref={mainRef} className="flex min-w-0 flex-1 flex-col">
          <header
            ref={headerRef}
            className="flex h-14 items-center justify-between gap-3 border-b border-border bg-background px-4"
            data-testid="topbar-system-status"
            style={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="caps-label text-muted-foreground" data-testid="text-surface-title">
                {activeNav.toUpperCase()} {activeSubTab ? ` / ${activeSubTab}` : ""}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HealthPill health={health} />
              <GatewaySelect value={activeGateway} gateways={gateways} onChange={setActiveGateway} />
              <ResyncButton onClick={doResync} state={resyncState} />
              <div className="ml-1 flex items-center gap-1">
                <button
                  className={cn(
                    "inline-flex h-9 items-center rounded-md border border-border bg-background px-2",
                    "hover:bg-[hsl(var(--muted))] transition-all duration-200",
                    "active:scale-95"
                  )}
                  onClick={(e) => {
                    createRipple(e);
                    setHealth((h) => (h === "OK" ? "DEGRADED" : h === "DEGRADED" ? "INCIDENT" : "OK"));
                  }}
                  data-testid="button-cycle-health"
                  aria-label="Cycle health state"
                  title="Cycle health (mock)"
                >
                  <ShieldAlert
                    className={cn(
                      "h-4 w-4 transition-colors duration-200",
                      health === "INCIDENT" ? "text-[hsl(var(--destructive))]" : "text-muted-foreground",
                    )}
                    strokeWidth={2.2}
                  />
                </button>
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col">
            {activeNav === "new-agent" ? (
              <NewAgent />
            ) : activeNav === "agent-a" && activeSubTab === "CHAT" ? (
              <div className="min-h-0 flex-1 flex p-4 gap-4 bg-[hsl(var(--muted))]/30">
                {/* Chat area */}
                <div className="flex-[1.5] min-h-0">
                  <Chat />
                </div>
                {/* Background Tasks Panel */}
                <BackgroundTasksPanel />
              </div>
            ) : activeNav === "agent-a" && activeSubTab === "SECURITY" ? (
              <div className="min-h-0 flex-1 bg-[hsl(var(--muted))]/30">
                <Security />
              </div>
            ) : activeNav === "agent-a" && activeSubTab === "CONTEXT MODIFICATION" ? (
              <div className="min-h-0 flex-1 bg-[hsl(var(--muted))]/30">
                <ContextModification onNavigate={handleSubTabClick} />
              </div>
            ) : activeNav === "agent-a" && activeSubTab === "SOUL / PURPOSE" ? (
              <div className="min-h-0 flex-1 flex flex-col">
                <Soul />
              </div>
            ) : (
            <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
              <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
                <Block animationDelay={300}>
                  <SectionHeader
                    title="MORNING / CURRENT BRIEF"
                    meta={
                      <div className="flex items-center gap-3">
                        <span
                          className="mono text-[12px] font-semibold text-foreground red-underline"
                          data-testid="text-brief-date"
                        >
                          {dateLabel}
                        </span>
                        <span className="caps-label text-muted-foreground" data-testid="text-brief-timestamp">
                          {new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    }
                    right={
                      <StatusInline
                        state={resyncState === "pending" ? "pending" : resyncState === "failed" ? "failed" : "resolved"}
                      />
                    }
                  />

                  <div className="mt-3 grid grid-cols-1 gap-2" data-testid="list-brief">
                    {briefLines.map((ln, idx) => (
                      <AnimatedListItem
                        key={ln.id}
                        index={idx}
                        className={cn(
                          "grid grid-cols-[120px_1fr] items-start gap-3 rounded-md border border-border px-3 py-2 cursor-default",
                          ln.severity === "attention" && "border-[hsl(var(--primary))]",
                        )}
                      >
                        <div className="caps-label text-muted-foreground" data-testid={`text-brief-label-${ln.id}`}>
                          {ln.label}
                        </div>
                        <div
                          className={cn(
                            "mono text-[12px] leading-snug text-foreground",
                            ln.severity === "attention" && "font-semibold",
                          )}
                          data-testid={`text-brief-value-${ln.id}`}
                        >
                          {ln.value}
                        </div>
                      </AnimatedListItem>
                    ))}
                  </div>
                </Block>

                <Block animationDelay={400}>
                  <SectionHeader
                    title="COMPETITOR SCAN"
                    meta={
                      <span className="caps-label text-muted-foreground" data-testid="text-competitor-meta">
                        High density. Time-stamped. Velocity flagged.
                      </span>
                    }
                    right={<StatusInline state="resolved" />}
                  />

                  <div className="mt-3 grid gap-2" data-testid="list-competitors">
                    {competitors.map((c, idx) => {
                      const hot = c.velocity >= 70;
                      return (
                        <AnimatedListItem
                          key={c.id}
                          index={idx}
                          className={cn(
                            "rounded-md border border-border px-3 py-2 cursor-default",
                            "transition-all duration-200",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="mono text-[12px] font-semibold text-foreground"
                                  data-testid={`text-competitor-name-${c.id}`}
                                >
                                  {c.name}
                                </span>
                                {hot ? (
                                  <Flame
                                    className="h-4 w-4 text-[hsl(var(--primary))] animate-pulse"
                                    strokeWidth={2.2}
                                    data-testid={`icon-velocity-flame-${c.id}`}
                                    aria-label="Momentum high"
                                  />
                                ) : null}
                              </div>
                              <div
                                className="mt-1 text-[12px] leading-snug text-muted-foreground"
                                data-testid={`text-competitor-summary-${c.id}`}
                              >
                                {c.summary}
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <div className="mono text-[12px] text-foreground" data-testid={`text-competitor-views-${c.id}`}>
                                {Intl.NumberFormat(undefined, { notation: "compact" }).format(c.views)} views
                              </div>
                              <div className="caps-label text-muted-foreground" data-testid={`text-competitor-time-${c.id}`}>
                                {c.timestamp} • v{c.velocity}
                              </div>
                            </div>
                          </div>
                        </AnimatedListItem>
                      );
                    })}
                  </div>
                </Block>

                <Block animationDelay={500}>
                  <SectionHeader
                    title="TRENDING SIGNALS"
                    meta={
                      <span className="caps-label text-muted-foreground" data-testid="text-signals-meta">
                        Red reserved for implications only.
                      </span>
                    }
                    right={<StatusInline state="resolved" />}
                  />

                  <div className="mt-3 grid gap-2" data-testid="list-signals">
                    {signals.map((s, idx) => (
                      <AnimatedListItem
                        key={s.id}
                        index={idx}
                        className="rounded-md border border-border px-3 py-2 cursor-default"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="caps-label text-muted-foreground" data-testid={`text-signal-source-${s.id}`}>
                                {s.source}
                              </span>
                              <span className="caps-label text-muted-foreground" data-testid={`text-signal-time-${s.id}`}>
                                {s.timestamp}
                              </span>
                            </div>
                            <div
                              className="mt-1 mono text-[12px] font-semibold leading-snug text-foreground"
                              data-testid={`text-signal-headline-${s.id}`}
                            >
                              {s.headline}
                            </div>
                            <div
                              className="mt-2 mono text-[12px] font-semibold leading-snug text-[hsl(var(--primary))]"
                              data-testid={`text-signal-implication-${s.id}`}
                            >
                              {s.implication}
                            </div>
                          </div>
                        </div>
                      </AnimatedListItem>
                    ))}
                  </div>
                </Block>

                <Block animationDelay={600}>
                  <SectionHeader
                    title="AGENT OUTPUT / OVERNIGHT WORK"
                    meta={
                      <span className="caps-label text-muted-foreground" data-testid="text-output-meta">
                        Failures auto-expand. Confirmed tasks are checked.
                      </span>
                    }
                    right={
                      <StatusInline
                        state={sendState === "pending" ? "pending" : sendState === "failed" ? "failed" : "resolved"}
                      />
                    }
                  />

                  <div className="mt-3 grid gap-2" data-testid="list-tasks">
                    {tasks.map((t, idx) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        expanded={expandedTasks[t.id] ?? t.status === "failed"}
                        onToggle={() => toggleTask(t.id)}
                        index={idx}
                      />
                    ))}
                  </div>
                </Block>

                <Block danger={sendState === "failed"} animationDelay={700}>
                  <SectionHeader
                    title="DIRECT INTERVENTION INPUT"
                    meta={
                      <span className="caps-label text-muted-foreground" data-testid="text-intervention-meta">
                        No auto-send. Explicit intent.
                      </span>
                    }
                    right={<StatusInline state={sendState} />}
                  />

                  <div className="mt-3 grid gap-2" data-testid="panel-intervention">
                    <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />
                        <span className="caps-label text-muted-foreground" data-testid="text-intervention-target">
                          override channel
                        </span>
                        <span className="mono text-[12px] font-semibold text-foreground" data-testid="text-intervention-channel">
                          ops/intervention
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer" data-testid="toggle-send-on-enter">
                        <span className="caps-label text-muted-foreground">send on enter</span>
                        <input
                          type="checkbox"
                          checked={sendOnEnter}
                          onChange={(e) => setSendOnEnter(e.target.checked)}
                          className="accent-[hsl(var(--primary))]"
                          data-testid="input-send-on-enter"
                          aria-label="Toggle send on enter"
                        />
                      </label>
                    </div>

                    <textarea
                      ref={inputRef}
                      className={cn(
                        "mono min-h-[120px] w-full resize-none rounded-md border border-border bg-background px-3 py-3 text-[12px] leading-snug",
                        "focus:outline-none focus:ring-0 transition-all duration-200",
                        "focus:border-[hsl(var(--primary))]/50",
                        sendState === "failed" && "border-[hsl(var(--destructive))]",
                      )}
                      placeholder="Type an intervention. Example: HALT SESSION-72F9. Dump last 200 lines. Confirm tool budget policy."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (sendOnEnter && e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void doSend();
                        }
                      }}
                      data-testid="input-intervention"
                      aria-label="Intervention input"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="mono text-[12px] text-muted-foreground" data-testid="text-char-count">
                          {input.length.toString().padStart(4, "0")} chars
                        </span>
                        <span className="caps-label text-muted-foreground" data-testid="text-enter-hint">
                          {sendOnEnter ? "ENTER=SEND" : "ENTER=NEWLINE"}
                        </span>
                      </div>

                      <button
                        className={cn(
                          "relative inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 overflow-hidden",
                          "hover:bg-[hsl(var(--muted))] active:scale-95 transition-all duration-200",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          sendState === "failed" && "border-[hsl(var(--destructive))]",
                        )}
                        onClick={(e) => {
                          createRipple(e);
                          void doSend();
                        }}
                        disabled={!input.trim() || sendState === "pending"}
                        data-testid="button-send-intervention"
                        aria-label="Send intervention"
                      >
                        <SquareTerminal className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={2.3} aria-hidden="true" />
                        <span className="mono text-[12px] font-semibold">SEND</span>
                      </button>
                    </div>

                    {sendState === "failed" ? (
                      <div
                        className="rounded-md border border-[hsl(var(--destructive))] px-3 py-2 animate-in fade-in slide-in-from-top-2 duration-300"
                        data-testid="status-send-failed"
                        role="status"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-[hsl(var(--destructive))]" strokeWidth={2.2} aria-hidden="true" />
                          <div className="mono text-[12px] font-semibold text-[hsl(var(--destructive))]" data-testid="text-send-error">
                            SEND FAILED — RETRY REQUIRED
                          </div>
                        </div>
                        <div className="mt-1 text-[12px] text-muted-foreground" data-testid="text-send-error-sub">
                          No silent transitions. State is explicit.
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Block>

                <div className="h-10" />
              </div>
            </div>
            )}

            <footer className="border-t border-border bg-background px-4 py-3" data-testid="footer-statusline">
              <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SquareTerminal className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={2.2} aria-hidden="true" />
                  <div className="mono text-[12px] text-muted-foreground" data-testid="text-footer-line">
                    gateway:{" "}
                    <span className="text-foreground" data-testid="text-footer-gateway">
                      {activeGateway}
                    </span>
                    {"  "}• health:{" "}
                    <span
                      className={cn(
                        "font-semibold transition-colors duration-200",
                        health === "INCIDENT" ? "text-[hsl(var(--destructive))]" : "text-foreground",
                      )}
                      data-testid="text-footer-health"
                    >
                      {health}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={cn(
                      "relative inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 overflow-hidden",
                      "hover:bg-[hsl(var(--muted))] active:scale-95 transition-all duration-200",
                    )}
                    onClick={(e) => {
                      createRipple(e);
                      setInput("HALT SESSION-72F9. Dump last 200 lines. Confirm tool budget policy.");
                      inputRef.current?.focus();
                    }}
                    data-testid="button-quick-intervene"
                    aria-label="Insert quick intervention"
                  >
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />
                    <span className="mono text-[12px]">Quick intervene</span>
                  </button>

                  <button
                    className={cn(
                      "relative inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 overflow-hidden",
                      "hover:bg-[hsl(var(--muted))] active:scale-95 transition-all duration-200",
                    )}
                    onClick={(e) => {
                      createRipple(e);
                      navigator.clipboard?.writeText(`gateway=${activeGateway} health=${health}`);
                    }}
                    data-testid="button-copy-context"
                    aria-label="Copy context"
                    title="Copy context"
                  >
                    <Cpu className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />
                    <span className="mono text-[12px]">Copy context</span>
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
