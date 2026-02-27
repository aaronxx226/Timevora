import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Feedback API endpoint
  app.post("/api/feedback", async (req, res) => {
    const { name, email, message } = req.body;
    const targetEmail = "ytmindfuelshorts@gmail.com";

    console.log(`>>> Received feedback from ${email}: ${message}`);

    try {
      // Check if SMTP credentials are provided
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;

      if (user && pass) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass }
        });

        await transporter.sendMail({
          from: `"Timevora Feedback" <${user}>`,
          to: targetEmail,
          subject: `New Feedback from ${name}`,
          text: `From: ${name} (${email})\n\nMessage:\n${message}`,
        });
        console.log(">>> Email sent successfully");
      } else {
        console.warn(">>> EMAIL_USER or EMAIL_PASS not set. Email not sent, but feedback logged.");
      }

      res.status(200).json({ 
        success: true, 
        message: "Feedback received! (Note: Actual email delivery requires server configuration)" 
      });
    } catch (error) {
      console.error(">>> Error in feedback endpoint:", error);
      res.status(500).json({ success: false, message: "Failed to process feedback" });
    }
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
