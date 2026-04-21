import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  score: number;
  label: 'Likely Real' | 'Uncertain' | 'Likely Fake';
  confidence: number;
  articleText: string;
  explanation: {
    keyIssues: string[];
    biasIndicators: string[];
    suspiciousQuotes: string[];
    finalReasoning: string;
  };
}

export async function analyzeNews(text: string): Promise<AnalysisResult> {
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

Provide a structured assessment of the text and assign a probability score from 0 to 100 where 0 means completely real and 100 means completely fake. Extract EXCACT substrings from the article text as suspiciousQuotes if any sentences are misleading or biased.
`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      tools: isUrl ? [{ googleSearch: {} }] : undefined,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "A score from 0 to 100 representing the likelihood the article is fake news. 0 is fully real, 100 is fully fake.",
            },
            confidence: {
              type: Type.INTEGER,
              description: "A score from 0 to 100 representing the confidence in the AI model's assessment.",
            },
            articleText: {
              type: Type.STRING,
              description: "The full text content of the article that was analyzed. Provide the raw text.",
            },
            explanation: {
              type: Type.OBJECT,
              properties: {
                keyIssues: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of key issues, factual inconsistencies, or logical fallacies.",
                },
                biasIndicators: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of indicators showing bias, emotional language, or lack of neutrality.",
                },
                suspiciousQuotes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exact sentences or phrases extracted from the articleText that are misleading, biased, or indicative of fake news.",
                },
                finalReasoning: {
                  type: Type.STRING,
                  description: "A paragraph summarizing the final reasoning for the assigned score.",
                },
              },
              required: ["keyIssues", "biasIndicators", "suspiciousQuotes", "finalReasoning"],
            },
          },
          required: ["score", "confidence", "articleText", "explanation"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    // Determine label based on requested rules:
    // 0-40 -> Likely Real
    // 41-70 -> Uncertain
    // 71-100 -> Likely Fake
    let label: AnalysisResult['label'] = 'Uncertain';
    if (result.score <= 40) {
      label = 'Likely Real';
    } else if (result.score > 70) {
      label = 'Likely Fake';
    }

    return {
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
    };
  } catch (error) {
    console.error("Error analyzing news with Gemini:", error);
    throw new Error("Failed to analyze the content. Please try again.");
  }
}
