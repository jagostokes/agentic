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
  List,
  Grid3x3,
  Plus,
  Search,
  File,
  FileText,
  Folder,
  Trash2,
  Edit3,
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

type ViewMode = "list" | "box";

type SecurityFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  icon: React.ComponentType<{ className?: string }>;
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
                "mb-4 flex h-14 w-14 items-center justify-center rounded-xl border-2 transition-all",
                "border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10",
                "group-hover:border-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))]/20"
              )}>
                <Icon className="h-7 w-7 text-[hsl(var(--primary))]" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="mono text-[15px] font-bold text-foreground mb-2">{mode.title}</h3>
              <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
                {mode.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5 mb-6">
                {mode.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-auto flex items-center gap-2 text-[hsl(var(--primary))] font-medium text-[13px]">
                <span>Select Mode</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// File Manager for Custom Mode
function SecurityFileManager() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [files, setFiles] = useState<SecurityFile[]>([
    {
      id: "f1",
      name: "api-rate-limits.json",
      type: "Rate Limiting",
      size: "1.2 KB",
      modified: "2 hours ago",
      icon: Ban,
    },
    {
      id: "f2",
      name: "prompt-injection-rules.txt",
      type: "Injection Defense",
      size: "3.4 KB",
      modified: "1 day ago",
      icon: AlertTriangle,
    },
    {
      id: "f3",
      name: "environment-whitelist.conf",
      type: "Environment Protection",
      size: "892 B",
      modified: "3 hours ago",
      icon: FileKey,
    },
  ]);

  const handleCreateFile = () => {
    const newFile: SecurityFile = {
      id: `f${files.length + 1}`,
      name: `new-security-rule-${files.length + 1}.txt`,
      type: "Custom Rule",
      size: "0 B",
      modified: "Just now",
      icon: FileText,
    };
    setFiles([...files, newFile]);
    setShowCreateDialog(false);
  };

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-border px-6 py-4 bg-background">
        <div className="flex items-center justify-between max-w-[1400px]">
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-md border border-border p-1 bg-muted/30">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-all",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-3.5 w-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode("box")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-all",
                  viewMode === "box"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid3x3 className="h-3.5 w-3.5" />
                <span>Box</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-[12px] rounded-md border border-border bg-background w-[200px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* New file button */}
          <button
            onClick={handleCreateFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Security File</span>
          </button>
        </div>
      </div>

      {/* Files content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-[1400px]">
          {viewMode === "list" ? (
            <div className="rounded-lg border border-border bg-background overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="text-left px-4 py-3 caps-label text-[10px] text-muted-foreground">
                      NAME
                    </th>
                    <th className="text-left px-4 py-3 caps-label text-[10px] text-muted-foreground">
                      TYPE
                    </th>
                    <th className="text-left px-4 py-3 caps-label text-[10px] text-muted-foreground">
                      SIZE
                    </th>
                    <th className="text-left px-4 py-3 caps-label text-[10px] text-muted-foreground">
                      MODIFIED
                    </th>
                    <th className="text-right px-4 py-3 caps-label text-[10px] text-muted-foreground">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => {
                    const Icon = file.icon;
                    return (
                      <tr
                        key={file.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center">
                              <Icon className="h-4 w-4 text-foreground" />
                            </div>
                            <span className="text-[13px] font-medium text-foreground">
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="caps-label text-[10px] text-muted-foreground">
                            {file.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-muted-foreground">
                          {file.size}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-muted-foreground">
                          {file.modified}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 rounded hover:bg-muted transition-colors">
                              <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => {
                const Icon = file.icon;
                return (
                  <div
                    key={file.id}
                    className="group rounded-lg border border-border bg-background p-4 hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-muted transition-colors">
                          <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[13px] font-medium text-foreground mb-1 truncate">
                      {file.name}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                      <span className="caps-label">{file.type}</span>
                      <span>•</span>
                      <span>{file.size}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground/70">
                      {file.modified}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground">No security files found</p>
              <p className="text-[12px] text-muted-foreground/70 mt-1">
                Create a new file to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({
  feature,
  onToggle,
}: {
  feature: SecurityFeature;
  onToggle: () => void;
}) {
  const Icon = feature.icon;

  const levelConfig = {
    critical: { color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/10", label: "CRITICAL" },
    high: { color: "text-amber-500", bg: "bg-amber-500/10", label: "HIGH" },
    medium: { color: "text-blue-500", bg: "bg-blue-500/10", label: "MEDIUM" },
  };

  const config = levelConfig[feature.level];

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg border-2 p-5 transition-all duration-200",
        feature.enabled
          ? "border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/5"
          : "border-border bg-card hover:border-border/60"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
            feature.enabled ? "border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10" : "border-border bg-muted/30"
          )}>
            <Icon className={cn("h-5 w-5", feature.enabled ? "text-[hsl(var(--primary))]" : "text-muted-foreground")} strokeWidth={2} />
          </div>
          <div>
            <h3 className="mono text-[13px] font-semibold text-foreground mb-0.5">{feature.name}</h3>
            <span className={cn("caps-label text-[9px] px-1.5 py-0.5 rounded", config.bg, config.color)}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={(e) => {
            createRipple(e);
            onToggle();
          }}
          className={cn(
            "relative h-6 w-11 rounded-full border-2 transition-colors overflow-hidden",
            feature.enabled
              ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
              : "bg-muted border-border"
          )}
        >
          <div
            className={cn(
              "absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white transition-all duration-200",
              feature.enabled ? "left-[22px]" : "left-[2px]"
            )}
          />
        </button>
      </div>

      {/* Description */}
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

// Security Assessment Panel
function SecurityAssessment({
  features,
  onClose,
}: {
  features: SecurityFeature[];
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      anime({
        targets: panelRef.current,
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: durations.normal,
        easing: easings.smooth,
      });
    }
  }, []);

  const enabledCount = features.filter((f) => f.enabled).length;
  const criticalEnabled = features.filter((f) => f.level === "critical" && f.enabled).length;
  const criticalTotal = features.filter((f) => f.level === "critical").length;
  const score = Math.round((enabledCount / features.length) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "emerald";
    if (score >= 50) return "amber";
    return "red";
  };

  const color = getScoreColor(score);

  return (
    <div
      ref={panelRef}
      className="mb-6 max-w-[1400px] rounded-lg border-2 border-[hsl(var(--primary))]/30 bg-card p-6 opacity-0"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="mono text-[15px] font-bold text-foreground mb-1">Security Assessment</h3>
          <p className="text-[12px] text-muted-foreground">
            Real-time analysis of your security configuration
          </p>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Score */}
        <div className="flex flex-col items-center p-6 rounded-lg border border-border bg-muted/30">
          <div className={cn(
            "text-4xl font-bold mb-2",
            color === "emerald" && "text-emerald-500",
            color === "amber" && "text-amber-500",
            color === "red" && "text-[hsl(var(--destructive))]"
          )}>
            {score}%
          </div>
          <div className="caps-label text-[10px] text-muted-foreground">SECURITY SCORE</div>
        </div>

        {/* Vulnerabilities */}
        <div className="flex flex-col items-center p-6 rounded-lg border border-border bg-muted/30">
          <div className="text-4xl font-bold text-amber-500 mb-2">
            {features.length - enabledCount}
          </div>
          <div className="caps-label text-[10px] text-muted-foreground">DISABLED FEATURES</div>
        </div>

        {/* Critical */}
        <div className="flex flex-col items-center p-6 rounded-lg border border-border bg-muted/30">
          <div className={cn(
            "text-4xl font-bold mb-2",
            criticalEnabled === criticalTotal ? "text-emerald-500" : "text-[hsl(var(--destructive))]"
          )}>
            {criticalEnabled}/{criticalTotal}
          </div>
          <div className="caps-label text-[10px] text-muted-foreground">CRITICAL ACTIVE</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 rounded-lg bg-muted/30">
        <div className="caps-label text-[10px] text-muted-foreground mb-3">RECOMMENDATIONS</div>
        <ul className="space-y-2">
          {features
            .filter((f) => !f.enabled && f.level === "critical")
            .map((f) => (
              <li key={f.id} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Enable <strong className="text-foreground">{f.name}</strong> to improve security</span>
              </li>
            ))}
          {features.filter((f) => !f.enabled && f.level === "critical").length === 0 && (
            <li className="flex items-start gap-2 text-[12px] text-emerald-500">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>All critical security features are enabled</span>
            </li>
          )}
        </ul>
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

  // Custom mode shows file manager
  if (mode === "custom") {
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
                  <span className="px-2 py-0.5 rounded-md text-[10px] mono font-semibold bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                    CUSTOM MODE
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Manage custom security rules and configurations
                </p>
              </div>
            </div>
          </div>
        </div>

        <SecurityFileManager />
      </div>
    );
  }

  // Base mode shows feature toggles
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
                <span className="px-2 py-0.5 rounded-md text-[10px] mono font-semibold bg-emerald-500/10 text-emerald-500">
                  BASE MODE
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
