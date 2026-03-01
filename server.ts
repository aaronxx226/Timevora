import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Apex to www redirect (Google-side redirect)
  app.use((req, res, next) => {
    const host = req.get('host');
    if (host === 'trytimevora.online') {
      return res.redirect(301, `https://www.trytimevora.online${req.originalUrl}`);
    }
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log(">>> Attaching Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log(">>> Vite middleware attached");
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> Timevora Server started successfully`);
    console.log(`>>> Listening on http://0.0.0.0:${PORT}`);
    console.log(`>>> Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

console.log(">>> Initializing server...");
startServer().catch(err => {
  console.error(">>> FATAL: Failed to start server:", err);
  process.exit(1);
});
