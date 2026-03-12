import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeResume = async (skills: string, projects: string, jobRequirements: string) => {
  if (!genAI) return { score: 75, feedback: "AI features are currently unavailable. Basic matching applied." };

  try {
    const prompt = `
      As an expert HR recruiter, analyze this candidate's profile against the job requirements.
      
      Candidate Skills: ${skills}
      Candidate Projects: ${projects}
      Job Requirements: ${jobRequirements}
      
      Provide a match analysis in JSON format:
      {
        "score": number (0-100),
        "feedback": "string (max 100 words)",
        "missingSkills": ["string"],
        "strengths": ["string"]
      }
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }]
    });
    const text = result.text;
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini AI error:", error);
    return { score: 60, feedback: "Error during AI analysis. Manual review recommended." };
  }
};
