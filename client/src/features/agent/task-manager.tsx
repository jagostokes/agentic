import { useState, useEffect, useRef } from "react";
import anime from "animejs";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  MoreVertical,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { easings, durations } from "@/lib/animations";
import CreateTaskDialog from "./create-task-dialog";

type TaskStatus = "scheduled" | "inProgress" | "awaitingPermission" | "done";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  startDate?: Date | string | null;
  progress?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function TaskCard({ task, index }: { task: Task; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: durations.normal,
        delay: index * 50,
        easing: easings.smooth,
      });
    }
  }, [index]);

  const getStatusIcon = () => {
    switch (task.status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" strokeWidth={2} />;
      case "inProgress":
        return <ListTodo className="h-4 w-4 text-amber-500" strokeWidth={2} />;
      case "awaitingPermission":
        return <AlertCircle className="h-4 w-4 text-orange-500" strokeWidth={2} />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={2} />;
    }
  };

  const formatStartDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border bg-background p-3",
        "hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/50",
        "transition-all duration-200",
        "opacity-0"
      )}
    >
      <div className="mt-0.5">{getStatusIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="mono text-[12px] font-medium text-foreground">
          {task.title}
        </div>
        {task.description && (
          <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
            {task.description}
          </div>
        )}

        {/* Progress bar for In Progress tasks */}
        {task.status === "inProgress" && task.progress !== null && task.progress !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="caps-label text-[9px] text-muted-foreground">PROGRESS</span>
              <span className="mono text-[10px] font-semibold text-amber-600">{task.progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Start date for Scheduled tasks */}
        {task.status === "scheduled" && task.startDate && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-600">
            <Clock className="h-3 w-3" strokeWidth={2} />
            <span className="font-medium">{formatStartDate(task.startDate)}</span>
          </div>
        )}

        <div className="mt-2 text-[10px] text-muted-foreground/60">
          Updated {new Date(task.updatedAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <button
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "p-1 rounded-md hover:bg-[hsl(var(--muted))] text-muted-foreground"
        )}
        title="Task options"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function EmptyTaskState({ status }: { status: TaskStatus }) {
  const getMessage = () => {
    switch (status) {
      case "scheduled":
        return "No scheduled tasks";
      case "inProgress":
        return "No tasks in progress";
      case "awaitingPermission":
        return "No tasks awaiting permission";
      case "done":
        return "No completed tasks";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border bg-[hsl(var(--muted))]/50">
        <ListTodo className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">{getMessage()}</p>
    </div>
  );
}

// Task column component
function TaskColumn({
  status,
  tasks,
  icon: Icon,
  label,
  color,
}: {
  status: TaskStatus;
  tasks: Task[];
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-background overflow-hidden">
      {/* Column Header */}
      <div className={cn("border-b border-border px-3 py-2", color)}>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" strokeWidth={2} />
          <span className="caps-label text-[11px] font-semibold">{label}</span>
          <span className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
            status === "scheduled" && "bg-blue-500/20 text-blue-600",
            status === "inProgress" && "bg-amber-500/20 text-amber-600",
            status === "awaitingPermission" && "bg-orange-500/20 text-orange-600",
            status === "done" && "bg-emerald-500/20 text-emerald-600"
          )}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {tasks.length === 0 ? (
          <EmptyTaskState status={status} />
        ) : (
          tasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))
        )}
      </div>
    </div>
  );
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTask, setIsFirstTask] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        duration: durations.fast,
        easing: easings.smooth,
      });
    }
  }, []);

  // Auto-transition first task from scheduled to in progress
  useEffect(() => {
    if (isFirstTask && tasks.length > 0) {
      const firstScheduledTask = tasks.find(t => t.status === "scheduled");

      if (firstScheduledTask) {
        setTimeout(async () => {
          try {
            // Update task status on backend
            await fetch(`/api/tasks/${firstScheduledTask.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: "inProgress", progress: "0" }),
            });

            // Update local state
            setTasks((prev) =>
              prev.map((task) =>
                task.id === firstScheduledTask.id
                  ? { ...task, status: "inProgress", progress: "0" }
                  : task
              )
            );

            setIsFirstTask(false);
          } catch (error) {
            console.error("Error transitioning task:", error);
          }
        }, 1000);
      }
    }
  }, [tasks, isFirstTask]);

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks();

    // Listen for task creation events from chat
    const handleTaskCreatedEvent = (event: CustomEvent) => {
      const newTask = event.detail;
      setTasks((prev) => [...prev, newTask]);
    };

    window.addEventListener("task-created", handleTaskCreatedEvent as EventListener);

    return () => {
      window.removeEventListener("task-created", handleTaskCreatedEvent as EventListener);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const scheduledTasks = getTasksByStatus("scheduled");
  const inProgressTasks = getTasksByStatus("inProgress");
  const awaitingPermissionTasks = getTasksByStatus("awaitingPermission");
  const doneTasks = getTasksByStatus("done");

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col bg-background"
      style={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="mono text-[14px] font-semibold text-foreground">Task Manager</div>
            <div className="text-[11px] text-muted-foreground">
              Agent tasks organized by status
            </div>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] px-3 py-1.5",
              "text-white hover:bg-[hsl(var(--primary))]/90",
              "transition-colors duration-150"
            )}
            title="Add task"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="caps-label text-[10px]">NEW TASK</span>
          </button>
        </div>
      </div>

      {/* Task Columns Grid */}
      <div className="flex-1 grid grid-cols-4 gap-3 p-3 overflow-hidden">
        {isLoading ? (
          <div className="col-span-4 flex items-center justify-center py-12">
            <div className="text-[13px] text-muted-foreground">Loading tasks...</div>
          </div>
        ) : (
          <>
            <TaskColumn
              status="scheduled"
              tasks={scheduledTasks}
              icon={Clock}
              label="SCHEDULED"
              color="bg-blue-500/10"
            />
            <TaskColumn
              status="inProgress"
              tasks={inProgressTasks}
              icon={ListTodo}
              label="IN PROGRESS"
              color="bg-amber-500/10"
            />
            <TaskColumn
              status="awaitingPermission"
              tasks={awaitingPermissionTasks}
              icon={AlertCircle}
              label="AWAITING"
              color="bg-orange-500/10"
            />
            <TaskColumn
              status="done"
              tasks={doneTasks}
              icon={CheckCircle2}
              label="DONE"
              color="bg-emerald-500/10"
            />
          </>
        )}
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
