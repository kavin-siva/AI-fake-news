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
  try {
    const response = await fetch('/api/analyze', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to analyze the content.");
    }
    
    return data;
  } catch (error: any) {
    console.error("Client Error fetching analysis:", error);
    throw new Error(error.message || "Failed to connect to the analysis server. Please try again later.");
  }
}
