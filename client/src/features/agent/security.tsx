import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  AlertTriangle,
  RefreshCw,
  FileKey,
  BrainCircuit,
  Ban,
  CheckCircle2,
  ChevronRight,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createRipple, easings, durations } from "@/lib/animations";

type SecurityMode = "base" | "custom" | null;
type SecurityFeature = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  enabled: boolean;
  level: "critical" | "high" | "medium";
};

// Landing page with mode selection
function SecurityLanding({ onModeSelect }: { onModeSelect: (mode: SecurityMode) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll(".animate-card"),
        translateY: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(150, { start: 200 }),
        duration: durations.slow,
        easing: easings.smooth,
      });
    }
  }, []);

  const modes = [
    {
      id: "base" as SecurityMode,
      title: "Assume Base Security Features",
      description: "Pre-configured security settings optimized for most use cases. Includes all essential protections with recommended defaults.",
      icon: ShieldCheck,
      features: ["Environment protection", "Prompt injection defense", "Loop detection", "Decision safeguards"],
      color: "emerald",
    },
    {
      id: "custom" as SecurityMode,
      title: "Create Own Security",
      description: "Customize every security parameter to match your specific requirements. Full control over all protection mechanisms.",
      icon: Settings,
      features: ["Fine-grained controls", "Custom rules", "Advanced configuration", "Audit logging"],
      color: "primary",
    },
  ];

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center min-h-full p-8">
      {/* Header */}
      <div className="animate-card text-center mb-12 opacity-0">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 mb-6">
          <Shield className="h-10 w-10 text-[hsl(var(--primary))]" strokeWidth={1.5} />
        </div>
        <h2 className="mono text-2xl font-bold text-foreground mb-2">Security Configuration</h2>
        <p className="text-[14px] text-muted-foreground max-w-[500px]">
          Choose your security approach to protect your agent from vulnerabilities and ensure safe operation
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-[900px]">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={(e) => {
                createRipple(e);
                onModeSelect(mode.id);
              }}
              className={cn(
                "animate-card group relative flex flex-col items-start p-8 rounded-xl border-2 bg-card text-left opacity-0",
                "transition-all duration-300 overflow-hidden",
                "hover:border-[hsl(var(--primary))] hover:shadow-lg hover:-translate-y-1",
                "border-border"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl border mb-6",
                mode.color === "emerald"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10"
              )}>
                <Icon className={cn(
                  "h-7 w-7",
                  mode.color === "emerald" ? "text-emerald-500" : "text-[hsl(var(--primary))]"
                )} strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="mono text-lg font-bold text-foreground mb-2">{mode.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
                {mode.description}
              </p>

              {/* Features list */}
              <div className="space-y-2 mb-6 w-full">
                {mode.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={2} />
                    <span className="text-[12px] text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Arrow indicator */}
              <div className="flex items-center gap-2 mt-auto text-[hsl(var(--primary))] group-hover:gap-3 transition-all">
                <span className="mono text-[12px] font-semibold">SELECT</span>
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </div>

              {/* Hover effect background */}
              <div className="absolute inset-0 bg-[hsl(var(--primary))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Security feature toggle card
function FeatureCard({ feature, onToggle }: { feature: SecurityFeature; onToggle: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = feature.icon;

  const levelConfig = {
    critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", label: "CRITICAL" },
    high: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "HIGH" },
    medium: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "MEDIUM" },
  };

  const config = levelConfig[feature.level];

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex items-start gap-4 p-5 rounded-lg border bg-card",
        "transition-all duration-200",
        feature.enabled ? "border-[hsl(var(--primary))]/50 shadow-sm" : "border-border",
        "hover:border-[hsl(var(--primary))]/50"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border",
        feature.enabled ? config.border : "border-border",
        feature.enabled ? config.bg : "bg-[hsl(var(--muted))]"
      )}>
        <Icon className={cn(
          "h-6 w-6",
          feature.enabled ? config.color : "text-muted-foreground"
        )} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h4 className="mono text-[14px] font-semibold text-foreground">{feature.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("caps-label text-[9px]", config.color)}>{config.label}</span>
              <span className="text-[10px] text-muted-foreground/60">PRIORITY</span>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={(e) => {
              createRipple(e);
              onToggle();
            }}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors duration-200",
              feature.enabled ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"
            )}
            role="switch"
            aria-checked={feature.enabled}
          >
            <div className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 shadow-sm",
              feature.enabled ? "translate-x-5.5" : "translate-x-0.5"
            )} />
          </button>
        </div>

        <p className="text-[12px] text-muted-foreground leading-relaxed">
          {feature.description}
        </p>

        {/* Status indicator */}
        <div className="flex items-center gap-2 mt-3">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            feature.enabled ? "bg-emerald-500" : "bg-muted-foreground"
          )} />
          <span className="caps-label text-[10px] text-muted-foreground">
            {feature.enabled ? "ACTIVE" : "DISABLED"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Security Assessment Panel
function SecurityAssessment({ features, onClose }: { features: SecurityFeature[]; onClose: () => void }) {
  const assessmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (assessmentRef.current) {
      anime({
        targets: assessmentRef.current,
        height: [0, assessmentRef.current.scrollHeight],
        opacity: [0, 1],
        duration: durations.normal,
        easing: easings.smooth,
      });
    }
  }, []);

  const criticalEnabled = features.filter((f) => f.level === "critical" && f.enabled).length;
  const highEnabled = features.filter((f) => f.level === "high" && f.enabled).length;
  const totalEnabled = features.filter((f) => f.enabled).length;

  const score = Math.round((totalEnabled / features.length) * 100);
  const criticalScore = features.filter((f) => f.level === "critical").length === criticalEnabled;
  const highScore = features.filter((f) => f.level === "high").length === highEnabled;

  const overallStatus = criticalScore && highScore ? "secure" : criticalScore ? "moderate" : "vulnerable";

  const statusConfig = {
    secure: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/50", label: "SECURE" },
    moderate: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/50", label: "MODERATE RISK" },
    vulnerable: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/50", label: "VULNERABLE" },
  };

  const config = statusConfig[overallStatus];

  const vulnerabilities = features.filter((f) => !f.enabled && (f.level === "critical" || f.level === "high"));
  const recommendations = [
    ...(!criticalScore ? ["Enable all critical security features immediately"] : []),
    ...(!highScore ? ["Consider enabling high-priority protections"] : []),
    ...(features.find((f) => f.id === "env" && !f.enabled) ? ["Environment file protection is disabled - credentials may be exposed"] : []),
    ...(features.find((f) => f.id === "injection" && !f.enabled) ? ["Prompt injection defense is off - agent is vulnerable to manipulation"] : []),
  ];

  return (
    <div
      ref={assessmentRef}
      className="mb-4 max-w-[1400px] rounded-lg border-2 bg-card overflow-hidden"
      style={{ borderColor: `hsl(var(--${overallStatus === "secure" ? "primary" : overallStatus === "moderate" ? "amber" : "destructive"}))` }}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between p-4 border-b", config.bg)}>
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", config.border, config.bg)}>
            <ShieldCheck className={cn("h-5 w-5", config.color)} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="mono text-[14px] font-bold text-foreground">Security Assessment</h3>
              <span className={cn("px-2 py-0.5 rounded text-[9px] mono font-semibold", config.bg, config.color)}>
                {config.label}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Generated {new Date().toLocaleTimeString()} • Score: {score}/100
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border border-border bg-background">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("h-2 w-2 rounded-full", criticalScore ? "bg-emerald-500" : "bg-red-500")} />
              <span className="caps-label text-[10px] text-muted-foreground">CRITICAL</span>
            </div>
            <div className="mono text-[18px] font-bold text-foreground">
              {criticalEnabled}/{features.filter((f) => f.level === "critical").length}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {criticalScore ? "All protected" : "Gaps detected"}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-background">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("h-2 w-2 rounded-full", highScore ? "bg-emerald-500" : "bg-amber-500")} />
              <span className="caps-label text-[10px] text-muted-foreground">HIGH PRIORITY</span>
            </div>
            <div className="mono text-[18px] font-bold text-foreground">
              {highEnabled}/{features.filter((f) => f.level === "high").length}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {highScore ? "Fully enabled" : "Review needed"}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-background">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="caps-label text-[10px] text-muted-foreground">OVERALL SCORE</span>
            </div>
            <div className="mono text-[18px] font-bold text-foreground">{score}%</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Security coverage</div>
          </div>
        </div>

        {/* Vulnerabilities */}
        {vulnerabilities.length > 0 && (
          <div>
            <h4 className="caps-label text-[11px] text-muted-foreground mb-2">ACTIVE VULNERABILITIES</h4>
            <div className="space-y-2">
              {vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="flex items-start gap-2 p-2 rounded border border-red-500/30 bg-red-500/5">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <div className="mono text-[11px] font-semibold text-foreground">{vuln.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{vuln.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="caps-label text-[11px] text-muted-foreground mb-2">RECOMMENDATIONS</h4>
            <div className="space-y-1.5">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0 mt-1.5" />
                  <span className="text-[11px] text-muted-foreground">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success message */}
        {overallStatus === "secure" && (
          <div className="flex items-center gap-2 p-3 rounded border border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={2} />
            <span className="text-[12px] text-muted-foreground">
              Your agent meets all critical security requirements. Continue monitoring for emerging threats.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Main security configuration component
export default function Security() {
  const [mode, setMode] = useState<SecurityMode>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [features, setFeatures] = useState<SecurityFeature[]>([
    {
      id: "env",
      name: "Environment File Protection",
      icon: FileKey,
      description: "Prevents unauthorized access to .env files and sensitive configuration. Automatically encrypts credentials and validates environment variable access patterns.",
      enabled: true,
      level: "critical",
    },
    {
      id: "injection",
      name: "Prompt Injection Defense",
      icon: AlertTriangle,
      description: "Detects and blocks malicious prompt injection attempts. Uses multi-layer validation to prevent instruction manipulation and unauthorized command execution.",
      enabled: true,
      level: "critical",
    },
    {
      id: "loop",
      name: "Loop Protection",
      icon: RefreshCw,
      description: "Monitors execution patterns to detect and prevent infinite loops. Enforces maximum iteration limits and tracks recursive behavior with automatic circuit breaking.",
      enabled: true,
      level: "high",
    },
    {
      id: "decision",
      name: "Non-Retractable Decision Security",
      icon: Lock,
      description: "Ensures critical decisions cannot be reversed or tampered with after execution. Creates immutable audit trail for sensitive operations and enforces decision permanence.",
      enabled: true,
      level: "high",
    },
    {
      id: "api",
      name: "API Rate Limiting",
      icon: Ban,
      description: "Protects against API abuse and ensures fair resource usage. Implements token bucket algorithm with configurable thresholds per endpoint.",
      enabled: false,
      level: "medium",
    },
    {
      id: "audit",
      name: "Security Audit Logging",
      icon: Key,
      description: "Comprehensive logging of all security-relevant events. Tamper-proof log storage with real-time alerting for suspicious activities.",
      enabled: false,
      level: "medium",
    },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll(".feature-card"),
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(80, { start: 100 }),
        duration: durations.normal,
        easing: easings.smooth,
      });
    }
  }, [mode]);

  const handleModeSelect = (selectedMode: SecurityMode) => {
    setMode(selectedMode);

    if (selectedMode === "base") {
      // Enable critical and high priority features
      setFeatures((prev) =>
        prev.map((f) => ({
          ...f,
          enabled: f.level === "critical" || f.level === "high",
        }))
      );
    }
  };

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleReset = () => {
    setMode(null);
  };

  if (!mode) {
    return <SecurityLanding onModeSelect={handleModeSelect} />;
  }

  const enabledCount = features.filter((f) => f.enabled).length;
  const criticalEnabled = features.filter((f) => f.level === "critical" && f.enabled).length;
  const criticalTotal = features.filter((f) => f.level === "critical").length;

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-[hsl(var(--muted))] transition-colors"
              title="Back to mode selection"
            >
              <ChevronRight className="h-4 w-4 rotate-180 text-muted-foreground" strokeWidth={2} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="mono text-[16px] font-bold text-foreground">Security Configuration</h2>
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] mono font-semibold",
                  mode === "base"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                )}>
                  {mode === "base" ? "BASE MODE" : "CUSTOM MODE"}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Configure security features and protection mechanisms
              </p>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="mono text-[13px] font-semibold text-foreground">{enabledCount}/{features.length}</div>
              <div className="caps-label text-[10px] text-muted-foreground">ENABLED</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-right">
              <div className={cn(
                "mono text-[13px] font-semibold",
                criticalEnabled === criticalTotal ? "text-emerald-500" : "text-amber-500"
              )}>
                {criticalEnabled}/{criticalTotal}
              </div>
              <div className="caps-label text-[10px] text-muted-foreground">CRITICAL</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <button
              onClick={(e) => {
                createRipple(e);
                setShowAssessment(!showAssessment);
              }}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden transition-colors",
                showAssessment
                  ? "border border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                  : "border border-border bg-background hover:bg-[hsl(var(--muted))]"
              )}
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={2} />
              <span className="mono text-[11px] font-medium">
                {showAssessment ? "HIDE ASSESSMENT" : "ASSESS SECURITY NOW"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Assessment Panel */}
        {showAssessment && (
          <SecurityAssessment features={features} onClose={() => setShowAssessment(false)} />
        )}

        <div className="grid grid-cols-2 gap-4 max-w-[1400px]">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card opacity-0">
              <FeatureCard feature={feature} onToggle={() => toggleFeature(feature.id)} />
            </div>
          ))}
        </div>

        {/* Warning banner if critical features disabled */}
        {criticalEnabled < criticalTotal && (
          <div className="mt-6 max-w-[1400px] rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <div className="mono text-[13px] font-semibold text-amber-500 mb-1">
                  Critical Security Features Disabled
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Some critical security features are currently disabled. This may leave your agent vulnerable to attacks.
                  Enable all critical features for maximum protection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success banner if all critical enabled */}
        {criticalEnabled === criticalTotal && (
          <div className="mt-6 max-w-[1400px] rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <div className="mono text-[13px] font-semibold text-emerald-500 mb-1">
                  All Critical Features Active
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Your agent is protected by all essential security features. Continue to monitor and adjust settings as needed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-border px-6 py-4 bg-background">
        <div className="flex items-center justify-between max-w-[1400px]">
          <div className="text-[11px] text-muted-foreground">
            Changes are applied immediately. Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFeatures((prev) =>
                  prev.map((f) => ({ ...f, enabled: f.level === "critical" }))
                );
              }}
              className="px-4 py-2 rounded-md border border-border hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <span className="mono text-[11px] font-medium text-foreground">ENABLE CRITICAL ONLY</span>
            </button>
            <button
              onClick={() => {
                setFeatures((prev) => prev.map((f) => ({ ...f, enabled: true })));
              }}
              className="px-4 py-2 rounded-md border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 transition-colors"
            >
              <span className="mono text-[11px] font-medium">ENABLE ALL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
