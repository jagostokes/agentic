import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import {
  Brain,
  Shield,
  Sparkles,
  Zap,
  Network,
  FileText,
  List,
  Grid3x3,
  GitBranch,
  Plus,
  Search,
  Settings2,
  Folder,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { easings, durations } from "@/lib/animations";

type ViewMode = "mindmap" | "list" | "box";

type MindmapNode = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: "center" | "link" | "content";
  navigateTo?: string; // Tab name to navigate to
  x: number; // Position for mindmap
  y: number;
};

type ContextFile = {
  id: string;
  name: string;
  type: "security" | "soul" | "skills" | "connections" | "background";
  size: string;
  modified: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function ContextModification({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("mindmap");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Sample files for list/box view
  const files: ContextFile[] = [
    {
      id: "f1",
      name: "Security Protocols",
      type: "security",
      size: "2.4 KB",
      modified: "2 hours ago",
      icon: Shield,
    },
    {
      id: "f2",
      name: "Core Purpose",
      type: "soul",
      size: "1.8 KB",
      modified: "1 day ago",
      icon: Sparkles,
    },
    {
      id: "f3",
      name: "Agent Abilities",
      type: "skills",
      size: "3.2 KB",
      modified: "3 hours ago",
      icon: Zap,
    },
    {
      id: "f4",
      name: "External APIs",
      type: "connections",
      size: "4.1 KB",
      modified: "5 hours ago",
      icon: Network,
    },
    {
      id: "f5",
      name: "Knowledge Base",
      type: "background",
      size: "12.7 KB",
      modified: "1 day ago",
      icon: FileText,
    },
  ];

  // Mindmap nodes with positions (centered layout)
  const nodes: MindmapNode[] = [
    {
      id: "center",
      label: "Agent Thinking\n& Specs",
      icon: Brain,
      type: "center",
      x: 50, // center percentage
      y: 50,
    },
    {
      id: "security",
      label: "SECURITY",
      icon: Shield,
      type: "link",
      navigateTo: "SECURITY",
      x: 50,
      y: 20,
    },
    {
      id: "soul",
      label: "SOUL",
      icon: Sparkles,
      type: "link",
      navigateTo: "SOUL / PURPOSE",
      x: 80,
      y: 35,
    },
    {
      id: "skills",
      label: "SKILLS",
      icon: Zap,
      type: "link",
      navigateTo: "ABILITIES",
      x: 80,
      y: 65,
    },
    {
      id: "connections",
      label: "CONNECTIONS",
      icon: Network,
      type: "content",
      x: 50,
      y: 80,
    },
    {
      id: "background",
      label: "BACKGROUND\nINFORMATION",
      icon: FileText,
      type: "content",
      x: 20,
      y: 50,
    },
  ];

  const handleNodeClick = (node: MindmapNode) => {
    setSelectedNode(node.id);

    // Pulse animation
    const element = document.getElementById(`node-${node.id}`);
    if (element) {
      anime({
        targets: element,
        scale: [1, 1.1, 1],
        duration: durations.fast,
        easing: easings.bounce,
      });
    }

    // Navigate if it's a link node
    if (node.navigateTo && onNavigate) {
      setTimeout(() => {
        onNavigate(node.navigateTo!);
      }, 300);
    }
  };

  useEffect(() => {
    if (viewMode === "mindmap" && containerRef.current) {
      // Animate nodes entrance
      anime({
        targets: ".mindmap-node",
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: durations.normal,
        delay: anime.stagger(100),
        easing: easings.smooth,
      });

      // Animate connections
      anime({
        targets: ".mindmap-connection",
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: durations.slow,
        delay: 200,
        easing: easings.smooth,
      });
    }
  }, [viewMode]);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header - Similar to dashboard top bar */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="mono text-[14px] font-semibold">Context Modification</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Manage agent knowledge and configurations
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-md border border-border p-1 bg-muted/30">
              <button
                onClick={() => setViewMode("mindmap")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-all",
                  viewMode === "mindmap"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>Mindmap</span>
              </button>
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
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-[12px] rounded-md border border-border bg-background w-[200px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Add new */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span>New File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-[hsl(var(--muted))]/30">
        {viewMode === "mindmap" && (
          <div className="relative h-full w-full p-8">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Draw connections from center to all other nodes */}
              {nodes
                .filter((n) => n.type !== "center")
                .map((node) => {
                  const centerNode = nodes.find((n) => n.type === "center")!;
                  const x1 = `${centerNode.x}%`;
                  const y1 = `${centerNode.y}%`;
                  const x2 = `${node.x}%`;
                  const y2 = `${node.y}%`;

                  return (
                    <line
                      key={`connection-${node.id}`}
                      className="mindmap-connection"
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                      opacity="0.4"
                    />
                  );
                })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const Icon = node.icon;
              const isCenter = node.type === "center";
              const isLink = node.type === "link";

              return (
                <div
                  key={node.id}
                  id={`node-${node.id}`}
                  className="mindmap-node absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    opacity: 0,
                  }}
                >
                  <button
                    onClick={() => handleNodeClick(node)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 transition-all duration-200",
                      isLink && "cursor-pointer hover:scale-105",
                      !isLink && !isCenter && "cursor-default"
                    )}
                  >
                    {/* Node circle */}
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-full border-2 transition-all",
                        isCenter
                          ? "h-24 w-24 border-primary bg-primary/10 shadow-lg"
                          : "h-16 w-16 border-border bg-background shadow-md",
                        isLink && "hover:border-primary hover:shadow-lg",
                        selectedNode === node.id && "border-primary ring-4 ring-primary/20"
                      )}
                    >
                      <Icon
                        className={cn(
                          isCenter ? "h-10 w-10" : "h-7 w-7",
                          isCenter ? "text-primary" : "text-foreground",
                          isLink && "group-hover:text-primary transition-colors"
                        )}
                      />
                    </div>

                    {/* Label */}
                    <div
                      className={cn(
                        "text-center whitespace-pre-line",
                        isCenter
                          ? "mono text-[13px] font-bold text-foreground"
                          : "caps-label text-[10px] font-medium text-muted-foreground",
                        isLink && "group-hover:text-primary transition-colors"
                      )}
                    >
                      {node.label}
                    </div>

                    {/* Link indicator */}
                    {isLink && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-primary-foreground">→</span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "list" && (
          <div className="p-6">
            <div className="max-w-[1200px] mx-auto">
              {/* List view */}
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
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file, idx) => {
                      const Icon = file.icon;
                      return (
                        <tr
                          key={file.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === "box" && (
          <div className="p-6">
            <div className="max-w-[1200px] mx-auto">
              {/* Grid view */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => {
                  const Icon = file.icon;
                  return (
                    <div
                      key={file.id}
                      className="group rounded-lg border border-border bg-background p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Icon className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-foreground mb-1 truncate">
                            {file.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="caps-label">{file.type}</span>
                            <span>•</span>
                            <span>{file.size}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground/70 mt-1">
                            {file.modified}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
