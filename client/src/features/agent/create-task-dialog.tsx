import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import { X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { easings, durations } from "@/lib/animations";

type TaskStatus = "scheduled" | "inProgress" | "awaitingPermission" | "done";

type CreateTaskDialogProps = {
  open: boolean;
  onClose: () => void;
  onTaskCreated: (task: any) => void;
};

export default function CreateTaskDialog({ open, onClose, onTaskCreated }: CreateTaskDialogProps) {
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("scheduled");
  const [startDate, setStartDate] = useState("");
  const [progress, setProgress] = useState("0");
  const [isParsing, setIsParsing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Animate in
      if (overlayRef.current) {
        anime({
          targets: overlayRef.current,
          opacity: [0, 1],
          duration: durations.fast,
          easing: easings.smooth,
        });
      }
      if (dialogRef.current) {
        anime({
          targets: dialogRef.current,
          translateY: [20, 0],
          opacity: [0, 1],
          duration: durations.normal,
          easing: easings.smooth,
        });
      }
    }
  }, [open]);

  const handleClose = () => {
    if (overlayRef.current && dialogRef.current) {
      anime({
        targets: overlayRef.current,
        opacity: [1, 0],
        duration: durations.fast,
        easing: easings.smooth,
      });
      anime({
        targets: dialogRef.current,
        translateY: [0, 20],
        opacity: [1, 0],
        duration: durations.fast,
        easing: easings.smooth,
        complete: () => {
          onClose();
          // Reset form
          setInput("");
          setTitle("");
          setDescription("");
          setStatus("scheduled");
          setStartDate("");
          setProgress("0");
          setUseAI(false);
        },
      });
    }
  };

  const handleParseWithAI = async () => {
    if (!input.trim()) return;

    setIsParsing(true);
    try {
      const response = await fetch("/api/tasks/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: input.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse task");
      }

      const data = await response.json();
      setTitle(data.title || "");
      setDescription(data.description || "");
      setStatus(data.status || "scheduled");
      setStartDate(data.startDate || "");
      setProgress(data.progress || "0");
      setUseAI(false);
    } catch (error) {
      console.error("Error parsing task:", error);
      alert("Failed to parse task with AI. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreate = async () => {
    const taskTitle = useAI ? input.trim() : title.trim();
    if (!taskTitle) {
      alert("Please provide a task title");
      return;
    }

    setIsCreating(true);
    try {
      // If using AI mode, parse first
      if (useAI) {
        const parseResponse = await fetch("/api/tasks/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: taskTitle }),
        });

        if (!parseResponse.ok) {
          throw new Error("Failed to parse task");
        }

        const parsedData = await parseResponse.json();

        // Create task with parsed data
        const taskData = {
          ...parsedData,
          startDate: parsedData.startDate || null,
          progress: parsedData.progress || (parsedData.status === "inProgress" ? "0" : null),
        };

        const createResponse = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create task");
        }

        const newTask = await createResponse.json();
        onTaskCreated(newTask);
      } else {
        // Create task with manual input
        const taskData: any = {
          title: taskTitle,
          description: description.trim(),
          status,
        };

        // Add startDate for scheduled tasks
        if (status === "scheduled" && startDate) {
          taskData.startDate = new Date(startDate).toISOString();
        }

        // Add progress for in-progress tasks
        if (status === "inProgress") {
          taskData.progress = progress;
        }

        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error("Failed to create task");
        }

        const newTask = await response.json();
        onTaskCreated(newTask);
      }

      handleClose();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
        style={{ opacity: 0 }}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          ref={dialogRef}
          className="pointer-events-auto w-full max-w-md rounded-lg border border-border bg-background shadow-lg"
          style={{ opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="mono text-[14px] font-semibold text-foreground">Create New Task</h2>
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-md hover:bg-[hsl(var(--muted))] flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* AI Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-[hsl(var(--muted))]/30">
              <input
                type="checkbox"
                id="use-ai"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="h-4 w-4 rounded accent-[hsl(var(--primary))]"
              />
              <label htmlFor="use-ai" className="flex items-center gap-2 text-[12px] text-foreground cursor-pointer">
                <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span>Use AI to parse task from description</span>
              </label>
            </div>

            {useAI ? (
              <>
                {/* AI Input Mode */}
                <div>
                  <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                    DESCRIBE YOUR TASK
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., look over my emails and allocate them to the correct label"
                    rows={4}
                    className={cn(
                      "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-3 py-2 text-[13px]",
                      "focus:border-[hsl(var(--primary))]/50 focus:outline-none",
                      "placeholder:text-muted-foreground/60"
                    )}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Describe what you want to accomplish in natural language
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Manual Input Mode */}
                <div>
                  <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                    TITLE *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                    className={cn(
                      "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-3 py-2 text-[13px]",
                      "focus:border-[hsl(var(--primary))]/50 focus:outline-none",
                      "placeholder:text-muted-foreground/60"
                    )}
                  />
                </div>

                <div>
                  <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                    DESCRIPTION
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What needs to be done?"
                    rows={3}
                    className={cn(
                      "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-3 py-2 text-[13px]",
                      "focus:border-[hsl(var(--primary))]/50 focus:outline-none",
                      "placeholder:text-muted-foreground/60"
                    )}
                  />
                </div>

                <div>
                  <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                    STATUS
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className={cn(
                      "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-3 py-2 text-[13px]",
                      "focus:border-[hsl(var(--primary))]/50 focus:outline-none"
                    )}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="inProgress">In Progress</option>
                    <option value="awaitingPermission">Awaiting Permission</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                {/* Start Date for Scheduled tasks */}
                {status === "scheduled" && (
                  <div>
                    <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                      START DATE (OPTIONAL)
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={cn(
                        "w-full rounded-md border border-border bg-[hsl(var(--muted))] px-3 py-2 text-[13px]",
                        "focus:border-[hsl(var(--primary))]/50 focus:outline-none"
                      )}
                    />
                  </div>
                )}

                {/* Progress for In Progress tasks */}
                {status === "inProgress" && (
                  <div>
                    <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                      PROGRESS (0-100)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                        className="flex-1"
                      />
                      <span className="mono text-[13px] font-semibold text-foreground w-12 text-right">
                        {progress}%
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-md border border-border hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <span className="mono text-[11px] font-medium text-foreground">CANCEL</span>
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || isParsing || (useAI ? !input.trim() : !title.trim())}
              className={cn(
                "px-4 py-2 rounded-md border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white",
                "hover:bg-[hsl(var(--primary))]/90 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              )}
            >
              {(isCreating || isParsing) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span className="mono text-[11px] font-medium">
                {isCreating ? "CREATING..." : isParsing ? "PARSING..." : "CREATE TASK"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
