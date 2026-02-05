import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import {
  Brain,
  Database,
  Clock,
  FileText,
  Layers,
  Settings2,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronDown,
  Hash,
  BarChart3,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createRipple, easings, durations } from "@/lib/animations";

type ContextItem = {
  id: string;
  name: string;
  type: "memory" | "instruction" | "constraint" | "priority";
  content: string;
  weight: number;
  enabled: boolean;
};

type ContextStats = {
  tokenCount: number;
  maxTokens: number;
  memoryUsage: number;
  contextDepth: number;
};

// Context item card
function ContextItemCard({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: ContextItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const typeConfig = {
    memory: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "MEMORY" },
    instruction: { color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30", label: "INSTRUCTION" },
    constraint: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "CONSTRAINT" },
    priority: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "PRIORITY" },
  };

  const config = typeConfig[item.type];

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex flex-col gap-3 p-4 rounded-lg border bg-card",
        "transition-all duration-200",
        item.enabled ? "border-[hsl(var(--primary))]/30" : "border-border opacity-60"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("px-2 py-0.5 rounded text-[9px] mono font-semibold", config.bg, config.color)}>
              {config.label}
            </span>
            <span className="mono text-[13px] font-semibold text-foreground truncate">{item.name}</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2">{item.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded hover:bg-[hsl(var(--muted))] transition-colors"
            title="Edit"
          >
            <Edit3 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-[hsl(var(--muted))] transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Hash className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
            <span className="text-[10px] text-muted-foreground">Weight: {item.weight}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
            <span className="text-[10px] text-muted-foreground">{Math.floor(item.content.length * 0.75)} tokens</span>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={onToggle}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors duration-200",
            item.enabled ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm",
              item.enabled ? "translate-x-4.5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}

// Add/Edit modal
function ContextModal({
  item,
  onSave,
  onClose,
}: {
  item?: ContextItem;
  onSave: (data: Omit<ContextItem, "id">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [type, setType] = useState<ContextItem["type"]>(item?.type || "memory");
  const [content, setContent] = useState(item?.content || "");
  const [weight, setWeight] = useState(item?.weight || 5);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      anime({
        targets: modalRef.current,
        scale: [0.95, 1],
        opacity: [0, 1],
        duration: durations.fast,
        easing: easings.snappy,
      });
    }
  }, []);

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return;
    onSave({ name, type, content, weight, enabled: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-[600px] rounded-xl border border-border bg-background shadow-2xl"
        style={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="mono text-[15px] font-bold text-foreground">
            {item ? "Edit Context Item" : "Add Context Item"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="caps-label text-[10px] text-muted-foreground mb-2 block">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., User Preferences"
              className="mono w-full px-3 py-2 rounded-lg border border-border bg-[hsl(var(--muted))] text-[13px] focus:border-[hsl(var(--primary))]/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="caps-label text-[10px] text-muted-foreground mb-2 block">TYPE</label>
            <div className="grid grid-cols-4 gap-2">
              {(["memory", "instruction", "constraint", "priority"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-[11px] mono font-medium transition-all",
                    type === t
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "border-border bg-background text-muted-foreground hover:border-[hsl(var(--primary))]/30"
                  )}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="caps-label text-[10px] text-muted-foreground mb-2 block">CONTENT</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the context content..."
              rows={4}
              className="mono w-full px-3 py-2 rounded-lg border border-border bg-[hsl(var(--muted))] text-[13px] focus:border-[hsl(var(--primary))]/50 focus:outline-none resize-none"
            />
            <div className="mt-1 text-[10px] text-muted-foreground">
              ~{Math.floor(content.length * 0.75)} tokens
            </div>
          </div>

          <div>
            <label className="caps-label text-[10px] text-muted-foreground mb-2 block">
              WEIGHT: {weight}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
              <span>Low Priority</span>
              <span>High Priority</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <span className="mono text-[11px] font-medium text-foreground">CANCEL</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim()}
            className={cn(
              "px-4 py-2 rounded-lg border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white",
              "hover:bg-[hsl(var(--primary))]/90 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <span className="mono text-[11px] font-medium">SAVE</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContextModification() {
  const [items, setItems] = useState<ContextItem[]>([
    {
      id: "1",
      name: "User Background",
      type: "memory",
      content: "User is a technical founder building an AI agent platform. Prefers concise, technical explanations.",
      weight: 8,
      enabled: true,
    },
    {
      id: "2",
      name: "Response Format",
      type: "instruction",
      content: "Always provide code examples when explaining technical concepts. Use markdown formatting.",
      weight: 7,
      enabled: true,
    },
    {
      id: "3",
      name: "Safety Boundaries",
      type: "constraint",
      content: "Never execute destructive operations without explicit confirmation. Always validate user inputs.",
      weight: 10,
      enabled: true,
    },
    {
      id: "4",
      name: "Focus Areas",
      type: "priority",
      content: "Prioritize security and performance over aesthetics. Focus on production-ready solutions.",
      weight: 6,
      enabled: true,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContextItem | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll(".context-card"),
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(60, { start: 100 }),
        duration: durations.normal,
        easing: easings.smooth,
      });
    }
  }, [items.length]);

  const stats: ContextStats = {
    tokenCount: items
      .filter((i) => i.enabled)
      .reduce((sum, i) => sum + Math.floor(i.content.length * 0.75), 0),
    maxTokens: 8192,
    memoryUsage: 45,
    contextDepth: items.filter((i) => i.enabled).length,
  };

  const handleAdd = () => {
    setEditingItem(undefined);
    setShowModal(true);
  };

  const handleEdit = (item: ContextItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = (data: Omit<ContextItem, "id">) => {
    if (editingItem) {
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? { ...data, id: i.id } : i)));
    } else {
      setItems((prev) => [...prev, { ...data, id: Date.now().toString() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggle = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
  };

  const groupedItems = {
    memory: items.filter((i) => i.type === "memory"),
    instruction: items.filter((i) => i.type === "instruction"),
    constraint: items.filter((i) => i.type === "constraint"),
    priority: items.filter((i) => i.type === "priority"),
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mono text-[16px] font-bold text-foreground">Context Modification</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Configure agent memory, instructions, and operational context
            </p>
          </div>

          <button
            onClick={(e) => {
              createRipple(e);
              handleAdd();
            }}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden",
              "border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white",
              "hover:bg-[hsl(var(--primary))]/90 transition-colors"
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="mono text-[11px] font-medium">ADD ITEM</span>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-border px-6 py-3 bg-[hsl(var(--muted))]/30">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={2} />
              <span className="caps-label text-[10px] text-muted-foreground">TOKEN USAGE</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="mono text-[15px] font-bold text-foreground">{stats.tokenCount}</span>
              <span className="text-[11px] text-muted-foreground">/ {stats.maxTokens}</span>
            </div>
            <div className="mt-1.5 h-1 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
              <div
                className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                style={{ width: `${(stats.tokenCount / stats.maxTokens) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={2} />
              <span className="caps-label text-[10px] text-muted-foreground">CONTEXT DEPTH</span>
            </div>
            <div className="mono text-[15px] font-bold text-foreground">{stats.contextDepth}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Active items</div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Maximize2 className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={2} />
              <span className="caps-label text-[10px] text-muted-foreground">MEMORY USAGE</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="mono text-[15px] font-bold text-foreground">{stats.memoryUsage}</span>
              <span className="text-[11px] text-muted-foreground">%</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Of allocated</div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={2} />
              <span className="caps-label text-[10px] text-muted-foreground">LAST UPDATED</span>
            </div>
            <div className="text-[13px] text-foreground">{new Date().toLocaleTimeString()}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Auto-synced</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] space-y-6">
          {Object.entries(groupedItems).map(([type, typeItems]) => {
            if (typeItems.length === 0) return null;

            const typeLabels = {
              memory: "Memory Context",
              instruction: "Instructions",
              constraint: "Constraints",
              priority: "Priorities",
            };

            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="caps-label text-[11px] text-muted-foreground">
                    {typeLabels[type as keyof typeof typeLabels]}
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground/60">{typeItems.length} items</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {typeItems.map((item) => (
                    <div key={item.id} className="context-card opacity-0">
                      <ContextItemCard
                        item={item}
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                        onToggle={() => handleToggle(item.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1.5} />
              <h3 className="mono text-[14px] font-semibold text-foreground mb-2">No Context Items</h3>
              <p className="text-[12px] text-muted-foreground max-w-[400px] mb-4">
                Add context items to customize how your agent understands and responds to requests
              </p>
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 transition-colors"
              >
                <span className="mono text-[11px] font-medium">ADD FIRST ITEM</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ContextModal item={editingItem} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
