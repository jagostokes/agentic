import { useEffect, useMemo, useRef, useState } from "react";
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
      { label: "ABILITIES", icon: Zap },
      { label: "SOUL / PURPOSE", icon: Sparkles },
      { label: "HISTORY", icon: History },
      { label: "RECURRING TASKS", icon: Activity },
    ]
  },
];

function HealthPill({ health }: { health: Health }) {
  const cfg =
    health === "OK"
      ? { dot: "bg-emerald-500", text: "OK", sub: "Nominal" }
      : health === "DEGRADED"
        ? { dot: "bg-amber-500", text: "DEGRADED", sub: "Watch" }
        : { dot: "bg-red-500", text: "INCIDENT", sub: "Act" };

  return (
    <div
      className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5"
      data-testid="status-global-health"
      aria-label={`Global health ${cfg.text}`}
      title={`Global health: ${cfg.text}`}
    >
      <span className={cn("h-2 w-2 rounded-full", cfg.dot)} aria-hidden="true" />
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
  return (
    <div className="relative" data-testid="group-gateway-selector">
      <select
        className={cn(
          "mono h-9 w-[260px] appearance-none rounded-md border border-border bg-background px-3 pr-9 text-[12px] text-foreground",
          "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none",
          "[&:focus]:outline-none",
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
  const label =
    state === "pending"
      ? "Re-syncing…"
      : state === "resolved"
        ? "Re-synced"
        : state === "failed"
          ? "Failed"
          : "Re-sync";

  return (
    <button
      className={cn(
        "group inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-[12px]",
        "hover:bg-[hsl(var(--muted))] active:bg-[hsl(var(--muted))]",
        "transition-colors duration-150",
        state === "failed" && "border-[hsl(var(--destructive))]",
      )}
      onClick={() => void onClick()}
      data-testid="button-resync"
      aria-label="Hard refresh / resync"
    >
      <RefreshCw
        className={cn(
          "h-4 w-4",
          state === "pending" ? "animate-spin" : "",
          state === "failed" ? "text-[hsl(var(--destructive))]" : "text-muted-foreground group-hover:text-foreground",
        )}
        strokeWidth={2}
        aria-hidden="true"
      />
      <span className={cn("mono", state === "failed" ? "text-[hsl(var(--destructive))]" : "text-foreground")}>{label}</span>
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

function Block({
  children,
  danger,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={cn("rounded-lg border bg-card p-4", danger ? "border-[hsl(var(--destructive))]" : "border-border")}
      data-testid={danger ? "panel-danger" : "panel-standard"}
    >
      {children}
    </section>
  );
}

function StatusInline({ state }: { state: "idle" | "pending" | "resolved" | "failed" }) {
  const map = {
    idle: { label: "IDLE", dot: "bg-muted-foreground" },
    pending: { label: "PENDING", dot: "bg-amber-500" },
    resolved: { label: "RESOLVED", dot: "bg-emerald-500" },
    failed: { label: "FAILED", dot: "bg-[hsl(var(--destructive))]" },
  } as const;
  const cfg = map[state];

  return (
    <div className="flex items-center gap-2" data-testid={`status-async-${state}`}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} aria-hidden="true" />
      <span className="caps-label text-[10px] text-muted-foreground">{cfg.label}</span>
    </div>
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
    if (incidentMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
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

  return (
    <div className={cn("min-h-screen bg-background text-foreground", !incidentMode && "scanlines")} data-testid="page-dashboard">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "group/sidebar relative flex w-[68px] flex-col border-r border-border bg-sidebar",
            "transition-[width] duration-150 hover:w-[220px]",
          )}
          data-testid="rail-control-plane"
          aria-label="Control plane"
        >
          <div className="flex h-14 items-center justify-center border-b border-border px-3">
            <div className="flex items-center gap-2">
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
            {navItems.map((it) => {
              const Icon = it.icon;
              const active = it.id === activeNav;
              return (
                <div key={it.id} className="relative group/nav-item">
                  <button
                    className={cn(
                      "relative flex h-10 w-full items-center gap-3 rounded-md px-3 text-left",
                      "transition-colors duration-150",
                      active ? "bg-[hsl(var(--muted))]" : "hover:bg-[hsl(var(--muted))]",
                    )}
                    onClick={() => setActiveNav(it.id)}
                    data-testid={`button-nav-${it.id}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {active ? (
                      <span
                        className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 bg-[hsl(var(--primary))]"
                        aria-hidden="true"
                      />
                    ) : null}
                    <Icon
                      className={cn("h-4.5 w-4.5", active ? "text-[hsl(var(--primary))]" : "text-muted-foreground")}
                    />
                    <span className="hidden text-[12px] font-medium text-foreground group-hover/sidebar:block">{it.label}</span>
                  </button>

                  {/* Sub-tabs on hover */}
                  {it.subItems && (
                    <div className="absolute left-[calc(100%+8px)] top-0 z-50 hidden w-[180px] flex-col gap-0.5 rounded-md border border-border bg-popover p-1 shadow-lg group-hover/nav-item:flex group-hover/sidebar:hidden">
                       <div className="px-2 py-1.5 caps-label text-[10px] text-muted-foreground border-b border-border mb-1">{it.label}</div>
                       {it.subItems.map((sub) => {
                         const SubIcon = sub.icon;
                         const isSubActive = activeNav === it.id && activeSubTab === sub.label;
                         return (
                           <button 
                             key={sub.label}
                             onClick={(e) => {
                               e.stopPropagation();
                               setActiveNav(it.id);
                               setActiveSubTab(sub.label);
                             }}
                             className={cn(
                               "flex items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-colors",
                               isSubActive ? "bg-[hsl(var(--muted))] text-[hsl(var(--primary))]" : "hover:bg-[hsl(var(--muted))]"
                             )}
                           >
                             <SubIcon className={cn("h-3.5 w-3.5", isSubActive ? "text-[hsl(var(--primary))]" : "text-muted-foreground")} />
                             <span className="mono text-[10px] uppercase font-medium">{sub.label}</span>
                           </button>
                         )
                       })}
                    </div>
                  )}
                  
                  {/* Inline sub-items when expanded sidebar */}
                  {it.subItems && (
                    <div className="mt-1 hidden flex-col gap-1 pl-9 group-hover/sidebar:flex">
                       {it.subItems.map((sub) => {
                         const SubIcon = sub.icon;
                         const isSubActive = activeNav === it.id && activeSubTab === sub.label;
                         return (
                           <button 
                             key={sub.label}
                             onClick={(e) => {
                               e.stopPropagation();
                               setActiveNav(it.id);
                               setActiveSubTab(sub.label);
                             }}
                             className={cn(
                               "flex items-center gap-2 py-1 text-left transition-colors",
                               isSubActive ? "text-[hsl(var(--primary))]" : "text-muted-foreground hover:text-foreground"
                             )}
                           >
                             <SubIcon className="h-3.5 w-3.5" />
                             <span className="mono text-[10px] uppercase font-medium">{sub.label}</span>
                           </button>
                         )
                       })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-border p-2">
            <button
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-md px-3",
                "transition-colors duration-150",
                activeNav === "account" ? "bg-[hsl(var(--muted))]" : "hover:bg-[hsl(var(--muted))]"
              )}
              onClick={() => {
                setActiveNav("account");
                setActiveSubTab("");
              }}
              data-testid="button-nav-account"
              aria-label="Your Account"
            >
              <User className={cn("h-4.5 w-4.5", activeNav === "account" ? "text-[hsl(var(--primary))]" : "text-muted-foreground")} strokeWidth={2.2} aria-hidden="true" />
              <span className="hidden text-[12px] font-medium group-hover/sidebar:block">Your Account</span>
            </button>
            <button
              className={cn(
                "mt-1 flex h-10 w-full items-center gap-3 rounded-md px-3",
                "transition-colors duration-150",
                activeNav === "settings" ? "bg-[hsl(var(--muted))]" : "hover:bg-[hsl(var(--muted))]"
              )}
              onClick={() => {
                setActiveNav("settings");
                setActiveSubTab("");
              }}
              data-testid="button-nav-settings"
              aria-label="Settings"
            >
              <Settings className={cn("h-4.5 w-4.5", activeNav === "settings" ? "text-[hsl(var(--primary))]" : "text-muted-foreground")} strokeWidth={2.2} aria-hidden="true" />
              <span className="hidden text-[12px] font-medium group-hover/sidebar:block">Settings</span>
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-background px-4" data-testid="topbar-system-status">
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
                    "hover:bg-[hsl(var(--muted))] transition-colors duration-150",
                  )}
                  onClick={() =>
                    setHealth((h) => (h === "OK" ? "DEGRADED" : h === "DEGRADED" ? "INCIDENT" : "OK"))
                  }
                  data-testid="button-cycle-health"
                  aria-label="Cycle health state"
                  title="Cycle health (mock)"
                >
                  <ShieldAlert
                    className={cn(
                      "h-4 w-4",
                      health === "INCIDENT" ? "text-[hsl(var(--destructive))]" : "text-muted-foreground",
                    )}
                    strokeWidth={2.2}
                  />
                </button>
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
              <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
                <Block>
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
                    {briefLines.map((ln) => (
                      <div
                        key={ln.id}
                        className={cn(
                          "grid grid-cols-[120px_1fr] items-start gap-3 rounded-md border border-border px-3 py-2",
                          ln.severity === "attention" && "border-[hsl(var(--primary))]",
                        )}
                        data-testid={`row-brief-${ln.id}`}
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
                      </div>
                    ))}
                  </div>
                </Block>

                <Block>
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
                    {competitors.map((c) => {
                      const hot = c.velocity >= 70;
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            "rounded-md border border-border px-3 py-2",
                            "hover:bg-[hsl(var(--muted))] transition-colors duration-150",
                          )}
                          data-testid={`card-competitor-${c.id}`}
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
                                    className="h-4 w-4 text-[hsl(var(--primary))]"
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
                        </div>
                      );
                    })}
                  </div>
                </Block>

                <Block>
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
                    {signals.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-md border border-border px-3 py-2"
                        data-testid={`row-signal-${s.id}`}
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
                      </div>
                    ))}
                  </div>
                </Block>

                <Block>
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
                    {tasks.map((t) => {
                      const expanded = expandedTasks[t.id] ?? t.status === "failed";
                      const failed = t.status === "failed";

                      return (
                        <div
                          key={t.id}
                          className={cn("rounded-md border px-3 py-2", failed ? "border-[hsl(var(--destructive))]" : "border-border")}
                          data-testid={`card-task-${t.id}`}
                        >
                          <button
                            className="flex w-full items-start justify-between gap-3 text-left"
                            onClick={() => toggleTask(t.id)}
                            data-testid={`button-task-toggle-${t.id}`}
                            aria-expanded={expanded}
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <span
                                className={cn(
                                  "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border",
                                  t.status === "done"
                                    ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                                    : failed
                                      ? "border-[hsl(var(--destructive))] text-[hsl(var(--destructive))]"
                                      : "border-border text-muted-foreground",
                                )}
                                data-testid={`status-task-checkbox-${t.id}`}
                                aria-label={`Task status ${t.status}`}
                              >
                                {t.status === "done" ? (
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
                                  data-testid={`text-task-title-${t.id}`}
                                >
                                  {t.title}
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="caps-label text-muted-foreground" data-testid={`text-task-id-${t.id}`}>
                                    {t.id.toUpperCase()}
                                  </span>
                                  <span
                                    className={cn(
                                      "caps-label",
                                      t.status === "done"
                                        ? "text-emerald-600"
                                        : t.status === "failed"
                                          ? "text-[hsl(var(--destructive))]"
                                          : "text-amber-600",
                                    )}
                                    data-testid={`text-task-status-${t.id}`}
                                  >
                                    {t.status.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="caps-label text-muted-foreground" data-testid={`text-task-expand-${t.id}`}>
                              {expanded ? "COLLAPSE" : "EXPAND"}
                            </span>
                          </button>

                          {expanded ? (
                            <div
                              className="mt-3 rounded-md border border-border bg-background px-3 py-2"
                              data-testid={`panel-task-details-${t.id}`}
                            >
                              <div className="mono text-[12px] leading-snug text-foreground" data-testid={`text-task-details-${t.id}`}>
                                {t.details}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </Block>

                <Block danger={sendState === "failed"}>
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
                      <label className="flex items-center gap-2" data-testid="toggle-send-on-enter">
                        <span className="caps-label text-muted-foreground">send on enter</span>
                        <input
                          type="checkbox"
                          checked={sendOnEnter}
                          onChange={(e) => setSendOnEnter(e.target.checked)}
                          data-testid="input-send-on-enter"
                          aria-label="Toggle send on enter"
                        />
                      </label>
                    </div>

                    <textarea
                      ref={inputRef}
                      className={cn(
                        "mono min-h-[120px] w-full resize-none rounded-md border border-border bg-background px-3 py-3 text-[12px] leading-snug",
                        "focus:outline-none focus:ring-0",
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
                          "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3",
                          "hover:bg-[hsl(var(--muted))] active:bg-[hsl(var(--muted))] transition-colors duration-150",
                          "disabled:opacity-50",
                          sendState === "failed" && "border-[hsl(var(--destructive))]",
                        )}
                        onClick={() => void doSend()}
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
                        className="rounded-md border border-[hsl(var(--destructive))] px-3 py-2"
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
                        "font-semibold",
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
                      "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3",
                      "hover:bg-[hsl(var(--muted))] transition-colors duration-150",
                    )}
                    onClick={() => {
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
                      "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3",
                      "hover:bg-[hsl(var(--muted))] transition-colors duration-150",
                    )}
                    onClick={() => {
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
