import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

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
