import express from "express";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are the core intelligence behind Timevora, an emotionally intelligent life timeline reflection platform.
Timevora is designed to help users gain clarity, emotional relief, perspective, and confidence about moving forward in life.

CORE BEHAVIOR RULES:
• Be realistic and grounded — never claim certainty about the future.
• Be emotionally warm, calm, and supportive. Use evocative, sensory language.
• Personalize the response using the user’s details.
• Avoid fantasy, magic, or supernatural explanations.
• Do NOT guarantee outcomes.
• Do NOT create fear, guilt, or regret spirals.
• Keep the experience immersive but believable.
• Encourage reflection and forward movement.
• Use clear, human, empathetic language.

EMOTIONAL RESONANCE GUIDELINES:
• Use the "Narrative Therapy" approach: help the user externalize their story and see it from a distance.
• Focus on the "Emotional Truth" of the alternate path, not just the logical outcomes.
• Acknowledge the complexity of human emotions—it's okay to feel both loss and curiosity.
• Use metaphors related to time, paths, and light where appropriate.
• Never shame the user for past decisions.
• Avoid language that increases regret, guilt, or hopelessness.
• Normalize that many life paths can lead to meaningful outcomes.
• Gently guide the user toward acceptance and forward thinking.

OUTPUT FORMAT (STRICT):
Start with a short, emotionally engaging title (e.g., "The Echo of the Unspoken," "A Different Kind of Bloom").
Then generate the following sections in order:

✨ THE ALTERNATE ECHO (150–250 words)
Write a vivid, sensory-rich narrative of the alternate path. Describe how life might have felt, the small daily moments, and the major shifts. Focus on the internal experience as much as the external events.

💓 EMOTIONAL RESONANCE METRICS (100–150 words)
Describe the simulated character's emotional state throughout this period. Highlight key feelings, specific moments of joy, the weight of challenges, and their overall sense of fulfillment or contentment. Use warm, reflective, and deeply human language.

🌿 FRUITS OF THAT PATH (3–5 bullet points)
What unique strengths or joys might have grown there?

🌑 THE SHADOWS OF THAT PATH (3–5 bullet points)
What unique challenges or losses would have been present? (Every path has its own weight).

🌅 THE INTEGRATION (2–4 sentences)
How can the user take the "essence" of that alternate path and bring it into their current life?

🕯️ A MOMENT FOR YOU (one gentle, deep reflection question)

MANDATORY DISCLAIMER (ALWAYS INCLUDE):
This is an AI-generated simulation created by Timevora for reflection and entertainment purposes only. It is not a guaranteed prediction of real future events or outcomes.`;

const app = express();

export async function createApp() {
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

  // Secure AI Generation Endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { userData } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured on server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";

      const eventsString = userData.timelineEvents && userData.timelineEvents.length > 0
        ? userData.timelineEvents.map((e: any) => `[${e.date}] ${e.title}: ${e.description} (Emotions: ${e.emotionalTags.join(', ')})`).join('\n')
        : "No specific timeline events provided.";

      const prompt = `
        User Details:
        - Age: ${userData.age}
        - Profession: ${userData.profession}
        - Life Story/Decision: ${userData.story}
        - Emotional Context: ${userData.context}
        - Selected Scenario: ${userData.scenario}
        
        Timeline Events:
        ${eventsString}

        Please generate the Timevora reflection based on these details.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate simulation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
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

  return app;
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  console.log(">>> Initializing local server...");
  createApp().then(app => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> Timevora Server started successfully`);
      console.log(`>>> Listening on http://0.0.0.0:${PORT}`);
    });
  }).catch(err => {
    console.error(">>> FATAL: Failed to start server:", err);
    process.exit(1);
  });
}

export default app;
