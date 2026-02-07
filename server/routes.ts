import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// In-memory task storage (temporary until database is set up)
const tasksStore: any[] = [];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Task Management Endpoints

  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      // Return tasks from in-memory store
      // In production, use: const tasks = await storage.getTasks();
      res.json(tasksStore);
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const { title, description, status = "scheduled", startDate, progress } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const newTask = {
        id: `task-${Date.now()}`,
        userId: "user1", // TODO: Get from auth
        title,
        description,
        status,
        startDate: startDate || null,
        progress: progress || (status === "inProgress" ? "0" : null),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in memory
      tasksStore.push(newTask);

      // In production: await storage.createTask(newTask);

      res.status(201).json(newTask);
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // Update task status
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, title, description, startDate, progress } = req.body;

      // Find and update task in memory store
      const taskIndex = tasksStore.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        return res.status(404).json({ error: "Task not found" });
      }

      tasksStore[taskIndex] = {
        ...tasksStore[taskIndex],
        ...(status !== undefined && { status }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(startDate !== undefined && { startDate }),
        ...(progress !== undefined && { progress }),
        updatedAt: new Date().toISOString(),
      };

      // In production: await storage.updateTask(id, { status, title, description, startDate, progress });

      res.json(tasksStore[taskIndex]);
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Remove from memory store
      const taskIndex = tasksStore.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        tasksStore.splice(taskIndex, 1);
      }

      // In production: await storage.deleteTask(id);

      res.status(204).send();
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Parse task from natural language using Grok
  app.post("/api/tasks/parse", async (req, res) => {
    try {
      const { input } = req.body;

      if (!input) {
        return res.status(400).json({ error: "Input is required" });
      }

      const apiKey = process.env.XAI_API_KEY;
      const apiUrl = process.env.XAI_API_URL || "https://api.x.ai/v1/chat/completions";

      if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
      }

      // Use Grok to parse the task
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4-latest",
          messages: [
            {
              role: "system",
              content: `You are a task parser. Parse the user's input and extract:
1. title: A concise task title (max 80 characters)
2. description: Detailed description of what needs to be done
3. status: One of "scheduled", "inProgress", "awaitingPermission", "done"
4. startDate: ISO 8601 date string if a specific date/time is mentioned, otherwise null
5. progress: A number 0-100 if mentioned, otherwise null for scheduled tasks, "0" for inProgress

Examples:
- "check emails tomorrow at 9am" → startDate: tomorrow at 9am in ISO format
- "review code next Monday" → startDate: next Monday in ISO format
- "analyze data" → startDate: null

Today's date is: ${new Date().toISOString()}

Respond ONLY with valid JSON in this exact format:
{"title": "string", "description": "string", "status": "scheduled", "startDate": "ISO string or null", "progress": "string or null"}

Do not include any other text or explanation.`
            },
            {
              role: "user",
              content: input
            }
          ],
          stream: false,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse task with Grok");
      }

      const data = await response.json();
      const parsedContent = data.choices?.[0]?.message?.content;

      if (!parsedContent) {
        throw new Error("No response from Grok");
      }

      // Parse the JSON response
      const taskData = JSON.parse(parsedContent);

      res.json(taskData);
    } catch (error) {
      console.error("Parse task error:", error);
      res.status(500).json({ error: "Failed to parse task" });
    }
  });

  // Chat API endpoint for xAI Grok integration
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const apiKey = process.env.XAI_API_KEY;
      const apiUrl = process.env.XAI_API_URL || "https://api.x.ai/v1/chat/completions";

      if (!apiKey) {
        console.error("XAI_API_KEY not configured");
        return res.status(500).json({ error: "API key not configured" });
      }

      // Call xAI Grok API
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4-latest",
          messages: messages,
          stream: false,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("xAI API error:", response.status, errorText);
        return res.status(response.status).json({
          error: "Failed to get response from AI",
          details: errorText
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}
