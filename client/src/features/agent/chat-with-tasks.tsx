import { useRef, useEffect } from "react";
import anime from "animejs";
import { easings, durations } from "@/lib/animations";
import TaskManager from "./task-manager";
import ChatInterface from "./chat-interface";

export default function ChatWithTasks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        duration: durations.normal,
        easing: easings.smooth,
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ opacity: 0 }}
    >
      {/* Task Manager - Top Half */}
      <div className="h-1/2 border-b border-border overflow-hidden">
        <TaskManager />
      </div>

      {/* Chat Interface - Bottom Half */}
      <div className="h-1/2 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
