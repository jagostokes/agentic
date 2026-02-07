import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { easings, durations } from "@/lib/animations";

type PersonalityMode = "preset" | "custom";
type SecurityMode = "OURS" | "CUSTOM";
type ComputePlan = "REGULAR" | "EXTRA" | "HYPER";
type ConnectorChoice = "SKIP" | "AGENT_OWN_ACCOUNT" | "CONNECT_MY_ACCOUNT";

type Connector = {
  key: string;
  label: string;
  description: string;
  choice: ConnectorChoice;
};

type FormData = {
  agentName: string;
  personalityMode: PersonalityMode;
  personalityPreset: string;
  customPersonality: string;
  securityMode: SecurityMode | null;
  securityProfileId: string;
  systemRules: string;
  toolPolicy: string;
  dataHandling: string;
  computePlan: ComputePlan | null;
  connectors: Connector[];
  generatedCredentials: Record<string, { username: string; password: string }>;
};

const PERSONALITY_PRESETS = [
  { id: "concise", label: "Concise Operator", description: "Direct, efficient, task-focused" },
  { id: "friendly", label: "Friendly Support", description: "Warm, helpful, conversational" },
  { id: "technical", label: "Technical Principal", description: "Deep expertise, precise terminology" },
  { id: "sales", label: "Sales SDR", description: "Persuasive, engaging, goal-oriented" },
];

const CONNECTOR_DEFS: Omit<Connector, "choice">[] = [
  { key: "gmail", label: "Gmail", description: "Email integration" },
  { key: "notes", label: "Notes", description: "Note-taking app" },
  { key: "text", label: "Text", description: "SMS messaging" },
  { key: "phone", label: "Phone Number", description: "Voice calls" },
  { key: "calendar", label: "Calendar", description: "Schedule management" },
  { key: "slack", label: "Slack", description: "Team messaging" },
];

function generateCredentials(connectorKey: string): { username: string; password: string } {
  const randomStr = () => Math.random().toString(36).substring(2, 10);
  return {
    username: `agent_${connectorKey}_${randomStr()}`,
    password: `${randomStr()}${randomStr()}`.toUpperCase(),
  };
}

export default function CreateAgentWizard({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    agentName: "",
    personalityMode: "preset",
    personalityPreset: "",
    customPersonality: "",
    securityMode: null,
    securityProfileId: "clawdbot_hardened_v1",
    systemRules: "",
    toolPolicy: "",
    dataHandling: "",
    computePlan: null,
    connectors: CONNECTOR_DEFS.map((c) => ({ ...c, choice: "SKIP" as ConnectorChoice })),
    generatedCredentials: {},
  });
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningTime, setProvisioningTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: durations.normal,
        easing: easings.smooth,
      });
    }
  }, []);

  // Provisioning timer
  useEffect(() => {
    if (!isProvisioning) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setProvisioningTime(elapsed);

      if (elapsed >= 17.0) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isProvisioning, onComplete]);

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.agentName.length >= 2 && formData.agentName.length <= 32 && /^[a-zA-Z0-9\s_-]+$/.test(formData.agentName);
      case 2:
        if (formData.personalityMode === "preset") {
          return !!formData.personalityPreset;
        } else {
          return formData.customPersonality.length >= 50 && formData.customPersonality.length <= 800;
        }
      case 3:
        if (!formData.securityMode) return false;
        if (formData.securityMode === "CUSTOM") {
          return (
            formData.systemRules.length >= 200 &&
            formData.systemRules.length <= 2000 &&
            !!formData.toolPolicy &&
            !!formData.dataHandling
          );
        }
        return true;
      case 4:
        return !!formData.computePlan;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 6 && canProceed(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAgent = () => {
    // Generate credentials for connectors with AGENT_OWN_ACCOUNT
    const credentials: Record<string, { username: string; password: string }> = {};
    formData.connectors.forEach((connector) => {
      if (connector.choice === "AGENT_OWN_ACCOUNT") {
        credentials[connector.key] = generateCredentials(connector.key);
      }
    });

    setFormData({ ...formData, generatedCredentials: credentials });
    setIsProvisioning(true);
  };

  if (isProvisioning) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--primary))] mx-auto mb-4" />
          <div className="mono text-[18px] font-semibold text-foreground mb-2">
            Provisioning agent…
          </div>
          <div className="mono text-[24px] font-bold text-[hsl(var(--primary))]">
            {provisioningTime.toFixed(1)}s
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full flex-col" style={{ opacity: 0 }}>
      {/* Stepper */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {[
            { num: 1, label: "Name" },
            { num: 2, label: "Personality" },
            { num: 3, label: "Security" },
            { num: 4, label: "Compute" },
            { num: 5, label: "Config" },
            { num: 6, label: "Summary" },
          ].map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    currentStep > step.num
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white"
                      : currentStep === step.num
                      ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {currentStep > step.num ? (
                    <Check className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <span className="mono text-[14px] font-semibold">{step.num}</span>
                  )}
                </div>
                <span className="mt-2 caps-label text-[10px] text-muted-foreground">{step.label}</span>
              </div>
              {idx < 5 && (
                <div
                  className={cn(
                    "h-0.5 w-12 mx-2 transition-all",
                    currentStep > step.num ? "bg-[hsl(var(--primary))]" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Stage 1: Name */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="mono text-[20px] font-bold text-foreground mb-2">Agent Name</h2>
                <p className="text-[13px] text-muted-foreground">
                  This is what users will see when interacting with your agent.
                </p>
              </div>
              <div>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  placeholder="Enter agent name"
                  className={cn(
                    "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-4 py-3 text-[14px]",
                    "focus:border-[hsl(var(--primary))]/50 focus:outline-none"
                  )}
                />
                {formData.agentName && !canProceed(1) && (
                  <p className="mt-2 text-[12px] text-destructive">
                    Name must be 2-32 characters and contain only letters, numbers, spaces, hyphens, or underscores.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Stage 2: Personality */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="mono text-[20px] font-bold text-foreground mb-2">Personality</h2>
                <p className="text-[13px] text-muted-foreground">
                  Choose how your agent communicates and behaves.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.personalityMode === "preset"}
                    onChange={() => setFormData({ ...formData, personalityMode: "preset" })}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span className="text-[14px] font-medium text-foreground">Use preset</span>
                </label>

                {formData.personalityMode === "preset" && (
                  <div className="ml-7 grid gap-2">
                    {PERSONALITY_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setFormData({ ...formData, personalityPreset: preset.id })}
                        className={cn(
                          "text-left rounded-lg border-2 p-4 transition-all",
                          formData.personalityPreset === preset.id
                            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                            : "border-border hover:border-[hsl(var(--primary))]/50"
                        )}
                      >
                        <div className="mono text-[14px] font-semibold text-foreground">{preset.label}</div>
                        <div className="text-[12px] text-muted-foreground mt-1">{preset.description}</div>
                      </button>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.personalityMode === "custom"}
                    onChange={() => setFormData({ ...formData, personalityMode: "custom" })}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span className="text-[14px] font-medium text-foreground">Write custom</span>
                </label>

                {formData.personalityMode === "custom" && (
                  <div className="ml-7">
                    <textarea
                      value={formData.customPersonality}
                      onChange={(e) => setFormData({ ...formData, customPersonality: e.target.value })}
                      placeholder="Describe your agent's personality..."
                      rows={6}
                      className={cn(
                        "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-4 py-3 text-[13px]",
                        "focus:border-[hsl(var(--primary))]/50 focus:outline-none"
                      )}
                    />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {formData.customPersonality.length} / 50-800 characters
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stage 3: Security */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="mono text-[20px] font-bold text-foreground mb-2">Security</h2>
                <p className="text-[13px] text-muted-foreground">Choose your security configuration.</p>
              </div>

              {/* Red warning box */}
              <div className="rounded-lg border-2 border-red-500/50 bg-red-500/10 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-[13px] text-red-600 dark:text-red-400">
                  Our default security is optimized against the failures observed in Clawdbot and has been extensively tested.
                </p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => setFormData({ ...formData, securityMode: "OURS" })}
                  className={cn(
                    "text-left rounded-lg border-2 p-6 transition-all",
                    formData.securityMode === "OURS"
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "border-border hover:border-[hsl(var(--primary))]/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <Shield className="h-8 w-8 text-[hsl(var(--primary))]" strokeWidth={1.5} />
                    <div>
                      <div className="mono text-[16px] font-bold text-foreground">Use our security</div>
                      <div className="text-[13px] text-emerald-600 font-medium mt-1">(Recommended)</div>
                      <div className="text-[12px] text-muted-foreground mt-2">
                        Pre-configured hardened security profile tested against common attack vectors
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, securityMode: "CUSTOM" })}
                  className={cn(
                    "text-left rounded-lg border-2 p-6 transition-all",
                    formData.securityMode === "CUSTOM"
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "border-border hover:border-[hsl(var(--primary))]/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <Shield className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                    <div>
                      <div className="mono text-[16px] font-bold text-foreground">Bring my own security</div>
                      <div className="text-[12px] text-muted-foreground mt-2">
                        Configure custom security rules and policies
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {formData.securityMode === "CUSTOM" && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                      SYSTEM RULES (200-2000 chars) *
                    </label>
                    <textarea
                      value={formData.systemRules}
                      onChange={(e) => setFormData({ ...formData, systemRules: e.target.value })}
                      rows={6}
                      className={cn(
                        "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-4 py-3 text-[13px]",
                        "focus:border-[hsl(var(--primary))]/50 focus:outline-none"
                      )}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">{formData.systemRules.length} characters</p>
                  </div>

                  <div>
                    <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                      TOOL POLICY *
                    </label>
                    <select
                      value={formData.toolPolicy}
                      onChange={(e) => setFormData({ ...formData, toolPolicy: e.target.value })}
                      className={cn(
                        "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-4 py-2 text-[13px]",
                        "focus:border-[hsl(var(--primary))]/50 focus:outline-none"
                      )}
                    >
                      <option value="">Select policy...</option>
                      <option value="Restricted">Restricted</option>
                      <option value="Standard">Standard</option>
                      <option value="Open">Open</option>
                    </select>
                  </div>

                  <div>
                    <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                      DATA HANDLING *
                    </label>
                    <select
                      value={formData.dataHandling}
                      onChange={(e) => setFormData({ ...formData, dataHandling: e.target.value })}
                      className={cn(
                        "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-4 py-2 text-[13px]",
                        "focus:border-[hsl(var(--primary))]/50 focus:outline-none"
                      )}
                    >
                      <option value="">Select handling...</option>
                      <option value="No PII">No PII</option>
                      <option value="PII allowed">PII allowed</option>
                      <option value="PII + regulated">PII + regulated</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 4: Compute */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="mono text-[20px] font-bold text-foreground mb-2">Compute Plan</h2>
                <p className="text-[13px] text-muted-foreground">Select the computational resources for your agent.</p>
              </div>

              <div className="grid gap-3">
                {[
                  { id: "REGULAR" as ComputePlan, label: "Regular Compute", price: "$20", desc: "Enough for any non-corporate user" },
                  { id: "EXTRA" as ComputePlan, label: "Extra Compute", price: "$30", desc: "Enough for any corporate user" },
                  { id: "HYPER" as ComputePlan, label: "Hyper Compute", price: "$60", desc: "Enough for all manner of requests" },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setFormData({ ...formData, computePlan: plan.id })}
                    className={cn(
                      "text-left rounded-lg border-2 p-4 transition-all flex items-center justify-between",
                      formData.computePlan === plan.id
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                        : "border-border hover:border-[hsl(var(--primary))]/50"
                    )}
                  >
                    <div>
                      <div className="mono text-[15px] font-bold text-foreground">{plan.label}</div>
                      <div className="text-[12px] text-muted-foreground mt-1">{plan.desc}</div>
                    </div>
                    <div className="mono text-[18px] font-bold text-[hsl(var(--primary))]">{plan.price}<span className="text-[12px] text-muted-foreground"> / mo</span></div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-[hsl(var(--muted))]/50 border border-border">
                <p className="text-[12px] text-muted-foreground">
                  We use compute-effective practices and open-source compute to maximize efficiency and speed.
                </p>
              </div>
            </div>
          )}

          {/* Stage 5: Configuration */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="mono text-[20px] font-bold text-foreground mb-2">Configuration</h2>
                <p className="text-[13px] text-muted-foreground">
                  Configure connector integrations for your agent.
                </p>
              </div>

              <div className="space-y-3">
                {formData.connectors.map((connector, idx) => (
                  <div key={connector.key} className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="mono text-[14px] font-semibold text-foreground">{connector.label}</div>
                        <div className="text-[11px] text-muted-foreground">{connector.description}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { value: "SKIP", label: "Do Not Configure" },
                        { value: "AGENT_OWN_ACCOUNT", label: "Agent Account" },
                        { value: "CONNECT_MY_ACCOUNT", label: "Connect Mine" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            const newConnectors = [...formData.connectors];
                            newConnectors[idx].choice = option.value as ConnectorChoice;
                            setFormData({ ...formData, connectors: newConnectors });
                          }}
                          className={cn(
                            "flex-1 rounded-md border px-3 py-2 text-[11px] font-medium transition-all",
                            connector.choice === option.value
                              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white"
                              : "border-border hover:border-[hsl(var(--primary))]/50"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 6: Summary */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="mono text-[20px] font-bold text-foreground mb-2">Summary</h2>
                <p className="text-[13px] text-muted-foreground">Review your agent configuration before creating.</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="caps-label text-[10px] text-muted-foreground mb-2">NAME</div>
                  <div className="mono text-[14px] text-foreground">{formData.agentName}</div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="caps-label text-[10px] text-muted-foreground mb-2">PERSONALITY</div>
                  <div className="text-[13px] text-foreground">
                    {formData.personalityMode === "preset"
                      ? PERSONALITY_PRESETS.find((p) => p.id === formData.personalityPreset)?.label
                      : formData.customPersonality.substring(0, 100) + "..."}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="caps-label text-[10px] text-muted-foreground mb-2">SECURITY</div>
                  <div className="text-[13px] text-foreground">
                    {formData.securityMode === "OURS" ? (
                      <>
                        <span className="font-semibold">Clawdbot Hardened v1</span>
                        <span className="text-emerald-600 ml-2">(Recommended)</span>
                      </>
                    ) : (
                      "Custom policy provided"
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="caps-label text-[10px] text-muted-foreground mb-2">COMPUTE</div>
                  <div className="text-[14px] font-semibold text-foreground">
                    {formData.computePlan === "REGULAR" && "Regular Compute - $20/mo"}
                    {formData.computePlan === "EXTRA" && "Extra Compute - $30/mo"}
                    {formData.computePlan === "HYPER" && "Hyper Compute - $60/mo"}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="caps-label text-[10px] text-muted-foreground mb-3">CONFIGURATION</div>
                  <div className="space-y-3">
                    {formData.connectors.map((connector) => {
                      if (connector.choice === "SKIP") return null;

                      const creds = formData.generatedCredentials[connector.key] || generateCredentials(connector.key);

                      return (
                        <div key={connector.key} className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-[13px] font-medium text-foreground">{connector.label}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {connector.choice === "AGENT_OWN_ACCOUNT" && "Agent account"}
                              {connector.choice === "CONNECT_MY_ACCOUNT" && "Will connect after creation"}
                            </div>
                            {connector.choice === "AGENT_OWN_ACCOUNT" && (
                              <div className="mt-2 space-y-1">
                                <div className="text-[11px]">
                                  <span className="text-muted-foreground">Username: </span>
                                  <span className="mono text-foreground">{creds.username}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-muted-foreground">Password: </span>
                                  <span className="mono text-[11px] text-foreground">
                                    {showPassword[connector.key] ? creds.password : "••••••••"}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setShowPassword({ ...showPassword, [connector.key]: !showPassword[connector.key] })
                                    }
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    {showPassword[connector.key] ? (
                                      <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md border border-border transition-colors",
              currentStep === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[hsl(var(--muted))]"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="mono text-[11px] font-medium">BACK</span>
          </button>

          {currentStep < 6 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed(currentStep)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md border transition-colors",
                canProceed(currentStep)
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
                  : "border-border bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <span className="mono text-[11px] font-medium">NEXT</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCreateAgent}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-md border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white",
                "hover:bg-[hsl(var(--primary))]/90 transition-colors"
              )}
            >
              <Zap className="h-4 w-4" />
              <span className="mono text-[11px] font-medium">CREATE AGENT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
