import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Error logging endpoint we added earlier
  app.post('/api/log', (req, res) => {
    try {
      const errorData = req.body;
      const logEntry = `\n====== CLIENT ERROR ======\n${JSON.stringify(errorData, null, 2)}\n`;
      fs.appendFileSync(path.join(process.cwd(), 'client-error.log'), logEntry);
      res.status(200).send('Logged successfully');
    } catch (e) {
      console.error('Failed to log client error:', e);
      res.status(500).send('Failed to log error');
    }
  });

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
