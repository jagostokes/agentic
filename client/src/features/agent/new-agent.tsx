import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import {
  Bot,
  Sparkles,
  Brain,
  Zap,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
  Settings,
  FileText,
  Network,
  AlertCircle,
  Info,
  Mail,
  Link,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createRipple, easings, durations } from "@/lib/animations";

type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AgentType = "general" | "specialist" | "researcher" | "assistant";
type GmailOption = "create" | "connect" | null;
type GoogleAccessLevel = "read-only" | "send" | "full" | null;

export default function NewAgent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState<AgentType | null>(null);
  const [gmailOption, setGmailOption] = useState<GmailOption>(null);
  const [googleAccessLevel, setGoogleAccessLevel] = useState<GoogleAccessLevel>(null);
  const [createdEmail, setCreatedEmail] = useState<string>("");
  const [agentPurpose, setAgentPurpose] = useState("");
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps: Step[] = [
    {
      id: "basics",
      title: "Basic Information",
      description: "Name your agent",
      icon: Bot,
    },
    {
      id: "connections",
      title: "Connections",
      description: "Set up integrations",
      icon: Network,
    },
    {
      id: "purpose",
      title: "Purpose & Goals",
      description: "Define what your agent does",
      icon: Sparkles,
    },
    {
      id: "capabilities",
      title: "Capabilities",
      description: "Select agent abilities",
      icon: Zap,
    },
    {
      id: "security",
      title: "Security Settings",
      description: "Configure security level",
      icon: Shield,
    },
    {
      id: "review",
      title: "Review & Create",
      description: "Confirm and launch",
      icon: Check,
    },
  ];

  const agentTypes = [
    {
      id: "general" as AgentType,
      name: "General Purpose",
      description: "Versatile agent for various tasks",
      icon: Bot,
      features: ["Multi-task handling", "Adaptive learning", "General knowledge"],
    },
    {
      id: "specialist" as AgentType,
      name: "Specialist",
      description: "Expert in a specific domain",
      icon: Brain,
      features: ["Deep expertise", "Domain focus", "Advanced reasoning"],
    },
    {
      id: "researcher" as AgentType,
      name: "Researcher",
      description: "Information gathering and analysis",
      icon: FileText,
      features: ["Data collection", "Analysis", "Report generation"],
    },
    {
      id: "assistant" as AgentType,
      name: "Personal Assistant",
      description: "Help with daily tasks and scheduling",
      icon: Sparkles,
      features: ["Task management", "Scheduling", "Reminders"],
    },
  ];

  const capabilities = [
    { id: "web-search", name: "Web Search", icon: Network },
    { id: "code-execution", name: "Code Execution", icon: FileText },
    { id: "file-management", name: "File Management", icon: FileText },
    { id: "api-integration", name: "API Integration", icon: Network },
    { id: "data-analysis", name: "Data Analysis", icon: Brain },
    { id: "natural-language", name: "Natural Language Processing", icon: Sparkles },
  ];

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: ".step-content",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: durations.normal,
        easing: easings.smooth,
      });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - create agent
      handleCreateAgent();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAgent = () => {
    // If user chose to create own email, generate email address
    if (gmailOption === "create") {
      const emailName = agentName.toLowerCase().replace(/\s+/g, "");
      setCreatedEmail(`${emailName}@jarvisagent.ai`);
    }
    // In real implementation, this would create the agent
    console.log("Agent created!");
  };

  const handleGoogleAuth = (accessLevel: GoogleAccessLevel) => {
    setGoogleAccessLevel(accessLevel);
    // In real implementation, this would redirect to Google OAuth
    // For now, we'll simulate it by just setting the access level
    console.log(`Redirecting to Google OAuth with ${accessLevel} access...`);
  };

  const toggleCapability = (id: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return agentName.trim() !== "";
      case 1:
        return gmailOption !== null;
      case 2:
        return agentPurpose.trim() !== "";
      case 3:
        return selectedCapabilities.length > 0;
      default:
        return true;
    }
  };

  return (
    <div ref={containerRef} className="flex h-full bg-background">
      {/* Sidebar - Steps */}
      <div className="w-[280px] shrink-0 border-r border-border bg-muted/30 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="mono text-[14px] font-bold text-foreground">New Agent</div>
              <div className="text-[11px] text-muted-foreground">Creation Wizard</div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
                  isActive && "bg-background border border-primary/50 shadow-sm",
                  !isActive && !isCompleted && "hover:bg-background/50",
                  index > currentStep && "opacity-50 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && "bg-primary/10 text-primary",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-[12px] font-medium mb-0.5",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70">
                    {step.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-8 p-4 rounded-lg bg-background border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-muted-foreground">Progress</span>
            <span className="text-[11px] font-medium text-foreground">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-8 py-6 bg-background">
          <div className="max-w-[900px] mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <div className="caps-label text-[10px] text-muted-foreground">
                STEP {currentStep + 1} OF {steps.length}
              </div>
            </div>
            <h1 className="mono text-[24px] font-bold text-foreground mb-1">
              {steps[currentStep].title}
            </h1>
            <p className="text-[14px] text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-[900px] mx-auto">
            <div className="step-content">
              {/* Step 0: Basics */}
              {currentStep === 0 && (
                <div className="space-y-8">
                  {/* Agent Name */}
                  <div>
                    <label className="block mb-3">
                      <span className="text-[13px] font-medium text-foreground mb-1 block">
                        Agent Name
                      </span>
                      <span className="text-[12px] text-muted-foreground">
                        Choose a unique name for your agent
                      </span>
                    </label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="e.g., Jarvis, Alfred, Friday"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Connections */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[13px] font-medium text-foreground mb-1">
                          Connect Services
                        </div>
                        <p className="text-[12px] text-muted-foreground">
                          Set up integrations for your agent. You can always add more connections later.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Gmail Connection */}
                  <div className="border-2 border-border rounded-lg p-6 bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-foreground">Gmail</div>
                        <div className="text-[12px] text-muted-foreground">
                          Email integration for your agent
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Option 1: Create Own Email */}
                      <button
                        onClick={() => setGmailOption("create")}
                        className={cn(
                          "w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left",
                          gmailOption === "create"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/60"
                        )}
                      >
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                            gmailOption === "create"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-medium text-foreground">
                              Create {agentName || "Agent"}'s Own Email
                            </span>
                            {gmailOption === "create" && (
                              <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                            )}
                          </div>
                          <p className="text-[12px] text-muted-foreground">
                            We'll create a dedicated email address for your agent
                          </p>
                          {gmailOption === "create" && createdEmail && (
                            <div className="mt-3 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                                Email Address Created
                              </div>
                              <div className="text-[13px] font-mono text-foreground">
                                {createdEmail}
                              </div>
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Option 2: Connect Your Email */}
                      <button
                        onClick={() => setGmailOption("connect")}
                        className={cn(
                          "w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left",
                          gmailOption === "connect"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/60"
                        )}
                      >
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                            gmailOption === "connect"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Link className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-medium text-foreground">
                              Connect to Your Email
                            </span>
                            {gmailOption === "connect" && (
                              <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                            )}
                          </div>
                          <p className="text-[12px] text-muted-foreground mb-3">
                            Connect your existing Gmail account with customizable permissions
                          </p>

                          {gmailOption === "connect" && (
                            <div className="space-y-2">
                              {!googleAccessLevel ? (
                                <>
                                  <div className="text-[11px] font-medium text-muted-foreground mb-2">
                                    Choose Access Level:
                                  </div>
                                  <button
                                    onClick={() => handleGoogleAuth("read-only")}
                                    className="w-full px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-[12px] font-medium text-foreground transition-colors"
                                  >
                                    Read Only Access
                                  </button>
                                  <button
                                    onClick={() => handleGoogleAuth("send")}
                                    className="w-full px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-[12px] font-medium text-foreground transition-colors"
                                  >
                                    Read & Send Access
                                  </button>
                                  <button
                                    onClick={() => handleGoogleAuth("full")}
                                    className="w-full px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-[12px] font-medium text-foreground transition-colors"
                                  >
                                    Full Access
                                  </button>
                                </>
                              ) : (
                                <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mb-1">
                                    Access Level Selected
                                  </div>
                                  <div className="text-[13px] text-foreground font-medium">
                                    You chose{" "}
                                    <span className="uppercase">
                                      {googleAccessLevel === "read-only"
                                        ? "READ ONLY"
                                        : googleAccessLevel === "send"
                                        ? "READ & SEND"
                                        : "FULL"}
                                    </span>{" "}
                                    access
                                  </div>
                                  <button
                                    onClick={() => setGoogleAccessLevel(null)}
                                    className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    Change access level
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Purpose */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[13px] font-medium text-foreground mb-1">
                          Define Your Agent's Purpose
                        </div>
                        <p className="text-[12px] text-muted-foreground">
                          Be specific about what you want your agent to accomplish. This helps
                          the agent understand its role and make better decisions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-3">
                      <span className="text-[13px] font-medium text-foreground mb-1 block">
                        Purpose & Goals
                      </span>
                      <span className="text-[12px] text-muted-foreground">
                        Describe what your agent should do and what outcomes you expect
                      </span>
                    </label>
                    <textarea
                      value={agentPurpose}
                      onChange={(e) => setAgentPurpose(e.target.value)}
                      placeholder="Example: Help me research and analyze scientific papers on machine learning, summarize key findings, and identify trends in the field."
                      rows={8}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {agentPurpose.length} / 500 characters
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Capabilities */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[13px] font-medium text-foreground mb-1">
                          Select Capabilities Carefully
                        </div>
                        <p className="text-[12px] text-muted-foreground">
                          More capabilities mean more power, but also require more resources.
                          Choose only what your agent needs.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-4">
                      <span className="text-[13px] font-medium text-foreground mb-1 block">
                        Agent Capabilities
                      </span>
                      <span className="text-[12px] text-muted-foreground">
                        Select the abilities your agent will have access to
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {capabilities.map((capability) => {
                        const Icon = capability.icon;
                        const isSelected = selectedCapabilities.includes(capability.id);

                        return (
                          <button
                            key={capability.id}
                            onClick={() => toggleCapability(capability.id)}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card hover:border-border/60"
                            )}
                          >
                            <div
                              className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                                isSelected
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-[13px] font-medium text-foreground">
                                {capability.name}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary" strokeWidth={2.5} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Security */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[13px] font-medium text-foreground mb-1">
                          Security Configuration
                        </div>
                        <p className="text-[12px] text-muted-foreground">
                          Choose a security preset. You can customize it later in the Security tab.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-6 rounded-lg border-2 border-border bg-card hover:border-primary/50 transition-all text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-foreground">
                            Standard Security
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Recommended
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>All critical features enabled</span>
                        </li>
                        <li className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Prompt injection protection</span>
                        </li>
                        <li className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Environment file protection</span>
                        </li>
                      </ul>
                    </button>

                    <button className="p-6 rounded-lg border-2 border-border bg-card hover:border-primary/50 transition-all text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Settings className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-foreground">
                            Custom Security
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Advanced
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-primary" />
                          <span>Full control over rules</span>
                        </li>
                        <li className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-primary" />
                          <span>Custom security files</span>
                        </li>
                        <li className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-primary" />
                          <span>Advanced configuration</span>
                        </li>
                      </ul>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-primary/5 border-2 border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-[16px] font-bold text-foreground">
                          {agentName || "Unnamed Agent"}
                        </div>
                        <div className="text-[12px] text-muted-foreground">
                          Ready to launch
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Gmail Connection Status */}
                      <div>
                        <div className="caps-label text-[10px] text-muted-foreground mb-2">
                          GMAIL CONNECTION
                        </div>
                        {gmailOption === "create" ? (
                          <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                            <div className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                              New Email Created
                            </div>
                            <div className="text-[13px] font-mono text-foreground">
                              {agentName.toLowerCase().replace(/\s+/g, "")}@jarvisagent.ai
                            </div>
                          </div>
                        ) : gmailOption === "connect" ? (
                          <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                            <div className="text-[12px] text-blue-600 dark:text-blue-400 font-medium mb-1">
                              Connected to Your Email
                            </div>
                            <div className="text-[13px] text-foreground">
                              Access Level:{" "}
                              <span className="font-semibold uppercase">
                                {googleAccessLevel === "read-only"
                                  ? "READ ONLY"
                                  : googleAccessLevel === "send"
                                  ? "READ & SEND"
                                  : "FULL"}
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <div className="caps-label text-[10px] text-muted-foreground mb-2">
                          PURPOSE
                        </div>
                        <p className="text-[13px] text-foreground leading-relaxed">
                          {agentPurpose}
                        </p>
                      </div>

                      <div>
                        <div className="caps-label text-[10px] text-muted-foreground mb-2">
                          CAPABILITIES ({selectedCapabilities.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedCapabilities.map((capId) => {
                            const cap = capabilities.find((c) => c.id === capId);
                            return (
                              <span
                                key={capId}
                                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium"
                              >
                                {cap?.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[13px] font-medium text-foreground mb-1">
                          Ready to Create
                        </div>
                        <p className="text-[12px] text-muted-foreground">
                          Your agent will be created with these settings. You can modify
                          everything later in the agent's configuration tabs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-8 py-4 bg-background">
          <div className="max-w-[900px] mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                currentStep === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "border border-border hover:bg-muted"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-[12px] font-medium">Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-lg transition-colors",
                canProceed()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <span className="text-[12px] font-medium">
                {currentStep === steps.length - 1 ? "Create Agent" : "Continue"}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
