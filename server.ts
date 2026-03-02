import { createApp } from "./api/_app.js";

// For local execution
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  createApp().then(app => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> Timevora Server running on http://localhost:${PORT}`);
    });
  });
}
