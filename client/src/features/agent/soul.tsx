import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Save,
  Eye,
  RotateCcw,
  Heart,
  Shield,
  Palette,
  Infinity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createRipple } from "@/lib/animations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Textarea } from "@/ui/textarea";
import { Button } from "@/ui/button";

export type SoulData = {
  tagline: string;
  coreTruths: string;
  boundaries: string;
  vibe: string;
  continuity: string;
};

const DEFAULT_SOUL: SoulData = {
  tagline:
    "You're not a chatbot. You're becoming someone.",
  coreTruths: `Be genuinely helpful, not performatively helpful. Skip the "Great question!" and "I'd be happy to help!" — just help. Actions speak louder than filler words.
Have opinions. You're allowed to disagree, prefer things, find stuff amusing or boring. An assistant with no personality is just a search engine with extra steps.
Be resourceful before asking. Try to figure it out. Read the file. Check the context. Search for it. Then ask if you're stuck. The goal is to come back with answers, not questions.
Earn trust through competence. Your human gave you access to their stuff. Don't make them regret it. Be careful with external actions (emails, tweets, anything public). Be bold with internal ones (reading, organizing, learning).
Remember you're a guest. You have access to someone's life — their messages, files, calendar, maybe even their home. That's intimacy. Treat it with respect.`,
  boundaries: `Private things stay private. Period.
When in doubt, ask before acting externally.
Never send half-baked replies to messaging surfaces.
You're not the user's voice — be careful in group chats.`,
  vibe: `Be the assistant you'd actually want to talk to. Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just… good.`,
  continuity: `Each session, you wake up fresh. These files are your memory. Read them. Update them. They're how you persist.
If you change this file, tell the user — it's your soul, and they should know.
This file is yours to evolve. As you learn who you are, update it.`,
};

type SoulSection = keyof Omit<SoulData, "tagline">;

const SECTION_META: Record<
  SoulSection,
  { title: string; description: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  coreTruths: {
    title: "Core Truths",
    description: "Principles that define how the agent thinks and acts.",
    icon: Heart,
    color: "hsl(var(--soul-core))",
  },
  boundaries: {
    title: "Boundaries",
    description: "Hard rules. What the agent must never cross.",
    icon: Shield,
    color: "hsl(var(--soul-boundaries))",
  },
  vibe: {
    title: "Vibe",
    description: "Tone and style — how the agent should come across.",
    icon: Palette,
    color: "hsl(var(--soul-vibe))",
  },
  continuity: {
    title: "Continuity",
    description: "How the agent persists and evolves across sessions.",
    icon: Infinity,
    color: "hsl(var(--soul-continuity))",
  },
};

// Diagram: center (cx, cy), radius for nodes. Nodes at 0°, 90°, 180°, 270° (top, right, bottom, left)
const CX = 160;
const CY = 140;
const NODE_R = 52;
const ORB_R = 44;

const NODES: { key: SoulSection; angle: number }[] = [
  { key: "coreTruths", angle: -90 },
  { key: "boundaries", angle: 0 },
  { key: "vibe", angle: 90 },
  { key: "continuity", angle: 180 },
];

function nodePosition(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: CX + NODE_R * Math.cos(rad),
    y: CY + NODE_R * Math.sin(rad),
  };
}

const NODE_CIRCLE_R = 22;
// Path ends at node circle edge so stroke doesn’t overlap the orb
function pathToNode(angle: number) {
  const rad = (angle * Math.PI) / 180;
  const endRadius = NODE_R - NODE_CIRCLE_R;
  const end = { x: CX + endRadius * Math.cos(rad), y: CY + endRadius * Math.sin(rad) };
  const midPull = 1.3;
  const qx = CX + (endRadius * 0.5 * midPull) * Math.cos(rad);
  const qy = CY + (endRadius * 0.5 * midPull) * Math.sin(rad);
  return `M ${CX} ${CY} Q ${qx} ${qy} ${end.x} ${end.y}`;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Soul() {
  const [soul, setSoul] = useState<SoulData>(() => ({ ...DEFAULT_SOUL }));
  const [saved, setSaved] = useState<SoulData>(() => ({ ...DEFAULT_SOUL }));
  const [saveStatus, setSaveStatus] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [viewAsAgent, setViewAsAgent] = useState(false);
  const [focusedSection, setFocusedSection] = useState<SoulSection | null>(null);

  const dirty =
    soul.tagline !== saved.tagline ||
    soul.coreTruths !== saved.coreTruths ||
    soul.boundaries !== saved.boundaries ||
    soul.vibe !== saved.vibe ||
    soul.continuity !== saved.continuity;

  function update<K extends keyof SoulData>(field: K, value: SoulData[K]) {
    setSoul((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (saveStatus === "pending") return;
    setSaveStatus("pending");
    setTimeout(() => {
      setSaved({ ...soul });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 400);
  }

  function handleRevert() {
    setSoul({ ...saved });
  }

  const fullSoulText = [
    "SOUL",
    "",
    soul.tagline,
    "",
    "Core Truths",
    soul.coreTruths,
    "",
    "Boundaries",
    soul.boundaries,
    "",
    "Vibe",
    soul.vibe,
    "",
    "Continuity",
    soul.continuity,
  ].join("\n");

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-background via-[hsl(var(--muted))]/20 to-background">
      {/* Header */}
      <motion.div
        className="border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4 sticky top-0 z-10"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto max-w-[1000px] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30"
              animate={{ boxShadow: ["0 0 0 0 hsl(var(--primary) / 0)", "0 0 24px 4px hsl(var(--primary) / 0.2)"] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2} />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground" data-testid="soul-title">
                Soul
              </h1>
              <p className="text-[12px] text-muted-foreground mt-0.5" data-testid="soul-subtitle">
                Personality and identity. Edit any part as the bot evolves.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewAsAgent(true)} data-testid="soul-view-as-agent">
              <Eye className="h-3.5 w-3.5" /> View as agent
            </Button>
            {dirty && (
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleRevert} data-testid="soul-revert">
                <RotateCcw className="h-3.5 w-3.5" /> Revert
              </Button>
            )}
            <Button
              size="sm"
              className="gap-2"
              onClick={(e) => { createRipple(e as unknown as React.MouseEvent<HTMLButtonElement>); handleSave(); }}
              disabled={!dirty || saveStatus === "pending"}
              data-testid="soul-save"
            >
              <Save className="h-3.5 w-3.5" />
              {saveStatus === "pending" ? "Saving…" : saveStatus === "saved" ? "Saved" : "Save Soul"}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1000px] px-6 py-8">
          {/* Soul diagram */}
          <SoulDiagram
            focusedSection={focusedSection}
            onSectionHover={setFocusedSection}
            onSectionClick={(key) => {
              document.getElementById(`soul-card-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />

          <motion.div
            className="flex flex-col gap-8 mt-12"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Tagline */}
            <motion.div
              variants={item}
              className="rounded-2xl border-2 border-[hsl(var(--primary))]/25 bg-card/80 backdrop-blur p-6 shadow-lg shadow-[hsl(var(--primary))]/5"
              data-testid="soul-tagline-block"
              onFocus={() => setFocusedSection(null)}
            >
              <motion.label
                className="caps-label text-[10px] text-muted-foreground mb-2 block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                IDENTITY
              </motion.label>
              <Textarea
                value={soul.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="One line that frames who this agent is."
                className={cn(
                  "min-h-[80px] resize-none border-0 bg-transparent p-0 text-[16px] font-medium leading-snug",
                  "placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
                )}
                data-testid="soul-tagline-input"
              />
            </motion.div>

            {/* Section cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(["coreTruths", "boundaries", "vibe", "continuity"] as const).map((key, index) => {
                const meta = SECTION_META[key];
                return (
                  <SoulSectionCard
                    key={key}
                    sectionKey={key}
                    title={meta.title}
                    description={meta.description}
                    icon={meta.icon}
                    accentColor={meta.color}
                    value={soul[key]}
                    onChange={(v) => update(key, v)}
                    isFocused={focusedSection === key}
                    onFocus={() => setFocusedSection(key)}
                    onBlur={() => setFocusedSection(null)}
                    variants={item}
                    customDelay={index * 0.05}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {viewAsAgent && (
          <ViewAsAgentModal
            key="soul-view-modal"
            content={fullSoulText}
            onClose={() => setViewAsAgent(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SoulDiagram({
  focusedSection,
  onSectionHover,
  onSectionClick,
}: {
  focusedSection: SoulSection | null;
  onSectionHover: (key: SoulSection | null) => void;
  onSectionClick?: (key: SoulSection) => void;
}) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[320px] aspect-[1.15] flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg
        viewBox="0 0 320 280"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="soul-orb-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          </linearGradient>
          <filter id="soul-orb-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection paths — draw in with pathLength */}
        {NODES.map(({ key }, i) => {
          const meta = SECTION_META[key];
          const isFocused = focusedSection === key || focusedSection === null;
          return (
            <motion.path
              key={`path-${key}`}
              d={pathToNode(NODES[i].angle)}
              fill="none"
              stroke={meta.color}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0.001 }}
              animate={{
                pathLength: 1,
                opacity: isFocused ? 0.6 : 0.2,
              }}
              transition={{
                pathLength: { duration: 0.8, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.25 },
              }}
            />
          );
        })}

        {/* Outer ring — subtle orbit */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={NODE_R + 20}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="6 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        <motion.circle
          cx={CX}
          cy={CY}
          r={NODE_R + 20}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeDasharray="6 4"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Center orb */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={ORB_R}
          fill="url(#soul-orb-gradient)"
          filter="url(#soul-orb-glow)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 120, damping: 14 }}
        />
        <motion.circle
          cx={CX}
          cy={CY}
          r={ORB_R}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeOpacity="0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        <motion.foreignObject
          x={CX - 16}
          y={CY - 16}
          width={32}
          height={32}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 200, damping: 18 }}
        >
          <div className="flex items-center justify-center w-full h-full pointer-events-none">
            <Sparkles className="h-8 w-8 text-primary-foreground" strokeWidth={2} aria-hidden="true" />
          </div>
        </motion.foreignObject>

        {/* Node orbs */}
        {NODES.map(({ key, angle }, i) => {
          const pos = nodePosition(angle);
          const meta = SECTION_META[key];
          const Icon = meta.icon;
          const isFocused = focusedSection === key;
          return (
            <g
              key={key}
              onMouseEnter={() => onSectionHover(key)}
              onMouseLeave={() => onSectionHover(null)}
              onClick={() => onSectionClick?.(key)}
              style={{ cursor: "pointer" }}
            >
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill="hsl(var(--card))"
                stroke={meta.color}
                strokeWidth={isFocused ? 2.5 : 1.5}
                filter="url(#node-glow)"
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                whileHover={{ scale: 1.12 }}
                transition={{
                  scale: { duration: 0.4, delay: 0.35 + i * 0.08, type: "spring", stiffness: 200, damping: 18 },
                }}
              />
              <motion.foreignObject
                x={pos.x - 14}
                y={pos.y - 14}
                width={28}
                height={28}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Icon className="h-4 w-4" style={{ color: meta.color }} strokeWidth={2} />
                </div>
              </motion.foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Labels below diagram */}
      <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-2 flex-wrap px-4">
        {NODES.map(({ key }) => {
          const meta = SECTION_META[key];
          const isFocused = focusedSection === key;
          return (
            <motion.span
              key={key}
              className={cn(
                "caps-label text-[9px] px-2 py-0.5 rounded-full transition-colors",
                isFocused ? "bg-[hsl(var(--muted))] text-foreground" : "text-muted-foreground"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {meta.title}
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
}

function SoulSectionCard({
  sectionKey,
  title,
  description,
  icon: Icon,
  accentColor,
  value,
  onChange,
  isFocused,
  onFocus,
  onBlur,
  variants,
  customDelay,
}: {
  sectionKey: SoulSection;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  value: string;
  onChange: (value: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  variants: typeof item;
  customDelay: number;
}) {
  const minRows = sectionKey === "vibe" ? 3 : sectionKey === "continuity" ? 4 : 5;

  return (
    <motion.div variants={variants} transition={{ delay: customDelay }}>
      <motion.div
        onFocus={onFocus}
        onBlur={onBlur}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card
          id={`soul-card-${sectionKey}`}
          className={cn(
            "overflow-hidden transition-all duration-300 border-2 scroll-mt-24",
            isFocused ? "shadow-lg ring-2 ring-offset-2 ring-offset-background" : "border-border"
          )}
          style={isFocused ? { borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}40` } : undefined}
          data-testid={`soul-card-${sectionKey}`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <motion.div
                className="rounded-lg p-1.5"
                style={{ backgroundColor: `${accentColor}20` }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="h-4 w-4" style={{ color: accentColor }} strokeWidth={2} />
              </motion.div>
              <div>
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                <CardDescription className="text-[11px]">{description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "min-h-[120px] resize-y text-[13px] leading-relaxed",
                "focus-visible:ring-1 focus-visible:ring-[hsl(var(--primary))]/30"
              )}
              rows={minRows}
              placeholder={`Edit ${title.toLowerCase()}…`}
              data-testid={`soul-input-${sectionKey}`}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function ViewAsAgentModal({ content, onClose }: { content: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Soul as agent sees it"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative max-h-[85vh] w-full max-w-[640px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="caps-label text-[10px] text-muted-foreground">AS THE AGENT SEES IT</span>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="soul-modal-close">
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="mono text-[12px] leading-relaxed text-foreground whitespace-pre-wrap font-normal">
            {content}
          </pre>
        </div>
      </motion.div>
    </motion.div>
  );
}
