import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it to your project environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Private Backend AI Route
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text or URL is required." });
      }

      const isUrl = /^https?:\/\//i.test(text.trim());
      let prompt = '';
      const currentDate = new Date().toDateString();

      if (isUrl) {
        prompt = `IMPORTANT: The current date is ${currentDate}. Do not flag any articles or events from the year 2026 as fake or future predictions simply because of the year. Treat 2026 as the present.

Analyze the following news article URL and explain why it might be misleading or fake. Focus on tone, claims, bias, and factual inconsistencies. You must use the googleSearch tool to search for the URL or its contents to gather the article text and context.

URL: ${text.trim()}

Extract the full article text and provide a structured assessment. Assign a probability score from 0 to 100 where 0 means completely real and 100 means completely fake. Extract EXCACT substrings from the article text as suspiciousQuotes if any sentences are misleading or biased.`;
      } else {
        prompt = `IMPORTANT: The current date is ${currentDate}. Do not flag any articles or events from the year 2026 as fake or future predictions simply because of the year. Treat 2026 as the present.

Analyze the following news article text and explain why it might be misleading or fake. Focus on tone, claims, bias, and factual inconsistencies:

[ARTICLE TEXT START]
${text}
[ARTICLE TEXT END]

Provide a structured assessment of the text and assign a probability score from 0 to 100 where 0 means completely real and 100 means completely fake. Extract EXCACT substrings from the article text as suspiciousQuotes if any sentences are misleading or biased.`;
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash",
        contents: prompt,
        tools: isUrl ? [{ googleSearch: {} }] : undefined,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "A score from 0 to 100 representing the likelihood the article is fake news. 0 is fully real, 100 is fully fake." },
              confidence: { type: Type.INTEGER, description: "A score from 0 to 100 representing the confidence in the AI model's assessment." },
              articleText: { type: Type.STRING, description: "The full text content of the article that was analyzed. Provide the raw text." },
              explanation: {
                type: Type.OBJECT,
                properties: {
                  keyIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key issues, factual inconsistencies, or logical fallacies." },
                  biasIndicators: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of indicators showing bias, emotional language, or lack of neutrality." },
                  suspiciousQuotes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exact sentences or phrases extracted from the articleText that are misleading, biased, or indicative of fake news." },
                  finalReasoning: { type: Type.STRING, description: "A paragraph summarizing the final reasoning for the assigned score." },
                },
                required: ["keyIssues", "biasIndicators", "suspiciousQuotes", "finalReasoning"],
              },
            },
            required: ["score", "confidence", "articleText", "explanation"],
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      
      let label = 'Uncertain';
      if (result.score <= 40) label = 'Likely Real';
      else if (result.score > 70) label = 'Likely Fake';

      res.json({
        score: result.score || 0,
        confidence: result.confidence || 0,
        label,
        articleText: result.articleText || text,
        explanation: {
          keyIssues: result.explanation?.keyIssues || [],
          biasIndicators: result.explanation?.biasIndicators || [],
          suspiciousQuotes: result.explanation?.suspiciousQuotes || [],
          finalReasoning: result.explanation?.finalReasoning || "No detailed reasoning provided."
        }
      });

    } catch (error: any) {
      console.error("Backend error during analysis:", error);
      res.status(500).json({ error: error.message || "Failed to analyze content." });
    }
  });

  // Vite middleware for dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Static production build fallback
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
