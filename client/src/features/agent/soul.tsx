import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import { Sparkles, Save, Eye, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { createRipple, easings, durations } from "@/lib/animations";
import { useHoverAnimation } from "@/hooks/use-animations";
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
  { title: string; description: string }
> = {
  coreTruths: {
    title: "Core Truths",
    description: "Principles that define how the agent thinks and acts.",
  },
  boundaries: {
    title: "Boundaries",
    description: "Hard rules. What the agent must never cross.",
  },
  vibe: {
    title: "Vibe",
    description: "Tone and style — how the agent should come across.",
  },
  continuity: {
    title: "Continuity",
    description: "How the agent persists and evolves across sessions.",
  },
};

export default function Soul() {
  const [soul, setSoul] = useState<SoulData>(() => ({ ...DEFAULT_SOUL }));
  const [saved, setSaved] = useState<SoulData>(() => ({ ...DEFAULT_SOUL }));
  const [saveStatus, setSaveStatus] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [viewAsAgent, setViewAsAgent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  const dirty =
    soul.tagline !== saved.tagline ||
    soul.coreTruths !== saved.coreTruths ||
    soul.boundaries !== saved.boundaries ||
    soul.vibe !== saved.vibe ||
    soul.continuity !== saved.continuity;

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".soul-card");
    anime({
      targets: cards,
      translateY: [24, 0],
      opacity: [0, 1],
      duration: durations.normal,
      delay: anime.stagger(80, { start: 150 }),
      easing: easings.smooth,
    });
  }, []);

  useEffect(() => {
    if (taglineRef.current) {
      anime({
        targets: taglineRef.current,
        translateY: [12, 0],
        opacity: [0, 1],
        duration: durations.normal,
        easing: easings.smooth,
      });
    }
  }, []);

  function update<K extends keyof SoulData>(field: K, value: SoulData[K]) {
    setSoul((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (saveStatus === "pending") return;
    setSaveStatus("pending");
    // Simulate API call; replace with real persist later
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
    <div className="min-h-full flex flex-col bg-[hsl(var(--muted))]/30">
      <div className="border-b border-border bg-background px-6 py-5">
        <div className="mx-auto max-w-[900px]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20">
                <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground" data-testid="soul-title">
                  Soul
                </h1>
                <p className="text-[12px] text-muted-foreground mt-0.5" data-testid="soul-subtitle">
                  Personality and identity for this agent. Edit any part as the bot evolves.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setViewAsAgent(true)}
                data-testid="soul-view-as-agent"
              >
                <Eye className="h-3.5 w-3.5" />
                View as agent
              </Button>
              {dirty && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={handleRevert}
                  data-testid="soul-revert"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Revert
                </Button>
              )}
              <Button
                size="sm"
                className="gap-2"
                onClick={(e) => {
                  createRipple(e as unknown as React.MouseEvent<HTMLButtonElement>);
                  handleSave();
                }}
                disabled={!dirty || saveStatus === "pending"}
                data-testid="soul-save"
              >
                <Save className="h-3.5 w-3.5" />
                {saveStatus === "pending"
                  ? "Saving…"
                  : saveStatus === "saved"
                    ? "Saved"
                    : "Save Soul"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div ref={containerRef} className="mx-auto max-w-[900px] flex flex-col gap-6">
          {/* Tagline — prominent, editable */}
          <div
            ref={taglineRef}
            className="soul-card rounded-xl border-2 border-[hsl(var(--primary))]/20 bg-card p-5 shadow-sm"
            data-testid="soul-tagline-block"
          >
            <label className="caps-label text-[10px] text-muted-foreground mb-2 block">
              IDENTITY
            </label>
            <Textarea
              value={soul.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="One line that frames who this agent is."
              className={cn(
                "min-h-[72px] resize-none border-0 bg-transparent p-0 text-[15px] font-medium leading-snug",
                "placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
              data-testid="soul-tagline-input"
            />
          </div>

          {/* Section cards — two-column on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(["coreTruths", "boundaries", "vibe", "continuity"] as const).map(
              (key, index) => {
                const meta = SECTION_META[key];
                return (
                  <SoulSectionCard
                    key={key}
                    title={meta.title}
                    description={meta.description}
                    value={soul[key]}
                    onChange={(v) => update(key, v)}
                    sectionKey={key}
                    animationDelay={200 + index * 60}
                  />
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* View as agent — modal / sheet */}
      {viewAsAgent && (
        <ViewAsAgentModal
          content={fullSoulText}
          onClose={() => setViewAsAgent(false)}
        />
      )}
    </div>
  );
}

function SoulSectionCard({
  title,
  description,
  value,
  onChange,
  sectionKey,
  animationDelay = 0,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  sectionKey: SoulSection;
  animationDelay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useHoverAnimation(cardRef, { lift: true });

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.opacity = "0";
      cardRef.current.style.transform = "translateY(24px)";
      anime({
        targets: cardRef.current,
        translateY: [24, 0],
        opacity: [0, 1],
        duration: durations.normal,
        delay: animationDelay,
        easing: easings.smooth,
      });
    }
  }, [animationDelay]);

  const minRows = sectionKey === "vibe" ? 3 : sectionKey === "continuity" ? 4 : 5;

  return (
    <Card
      ref={cardRef}
      className="soul-card border-border bg-card overflow-hidden"
      data-testid={`soul-card-${sectionKey}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <CardDescription className="text-[11px]">{description}</CardDescription>
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
  );
}

function ViewAsAgentModal({
  content,
  onClose,
}: {
  content: string;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current) {
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        duration: durations.fast,
        easing: easings.smooth,
      });
    }
    if (panelRef.current) {
      anime({
        targets: panelRef.current,
        opacity: [0, 1],
        scale: [0.98, 1],
        duration: durations.normal,
        delay: 50,
        easing: easings.smooth,
      });
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Soul as agent sees it"
    >
      <div
        ref={panelRef}
        className="relative max-h-[85vh] w-full max-w-[640px] rounded-xl border border-border bg-card shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="caps-label text-[10px] text-muted-foreground">
            AS THE AGENT SEES IT
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="soul-modal-close">
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="mono text-[12px] leading-relaxed text-foreground whitespace-pre-wrap font-normal">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
