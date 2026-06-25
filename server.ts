import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API proxy route to Apps Script (POST)
  app.post("/api/proxy", async (req, res) => {
    try {
      const { url, payload } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Apps Script Web App URL is required" });
      }

      console.log(`Proxying POST request to Apps Script: ${url}`);

      // Forward request to Apps Script
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8", // Apps Script doPost often prefers simple text post or plain
        },
        body: JSON.stringify(payload || {}),
        redirect: "follow",
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (parseError) {
        res.json({ success: true, text });
      }
    } catch (error: any) {
      console.error("Proxy POST error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with Google Apps Script" });
    }
  });

  // API proxy route to Apps Script (GET)
  app.get("/api/proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).json({ error: "URL query parameter is required" });
      }

      console.log(`Proxying GET request to Apps Script: ${targetUrl}`);

      const response = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch {
        res.send(text);
      }
    } catch (error: any) {
      console.error("Proxy GET error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with Google Apps Script" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
