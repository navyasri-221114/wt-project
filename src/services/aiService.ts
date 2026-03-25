import { GoogleGenAI } from "@google/genai";

// 1. Better API Key checking
const getApiKey = () => {
  const key1 = typeof window !== 'undefined' ? import.meta.env.VITE_GEMINI_API_KEY : null;
  const key2 = typeof process !== 'undefined' ? (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY) : null;
  const key = key1 || key2;

  if (!key || key === "your_gemini_api_key_here" || key.trim() === "") return null;
  return key;
};

const apiKey = getApiKey();

// 2. Initialize Gemini - Allowing it to pick the best stable version
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  apiVersion: "v1beta" // Some 2.x models are only in beta preview
}) : null;

// 3. Centralized Production-Ready AI Call with Intelligent Model Fallbacks
const safeGenerateContent = async (prompt: string) => {
  if (!ai) throw new Error("AI Assistant not initialized. Missing API Key.");

  // Only models confirmed available for this API key (gemini-1.5-x NOT supported)
  const models = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-001"
  ];
  let quotaExhausted = false;

  let lastError = null;

  for (let i = 0; i < models.length; i++) {
    try {
      const response = await ai.models.generateContent({
        model: models[i],
        contents: prompt
      });
      return response;
    } catch (e: any) {
      lastError = e;
      const errStr = String(e?.message || e?.statusText || e).toLowerCase();

      // If we find that 1.5-flash isn't working at all, we move on quickly
      if (errStr.includes("not found") || errStr.includes("404")) {
        continue;
      }

      // If we hit quota (429), try the next model bucket
      if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("resource_exhausted")) {
        quotaExhausted = true;
        await new Promise(res => setTimeout(res, 500 * (i + 1)));
        continue;
      }

      throw e; // Hard error like 401 Unauthorized
    }
  }

  // If all models failed due to quota, throw a readable message
  if (quotaExhausted) {
    throw new Error(
      "⚠️ Daily API quota exceeded for all models.\n\n" +
      "Your free tier limit has been reached for today. You have two options:\n" +
      "1. Wait ~24 hours for the quota to reset automatically.\n" +
      "2. Visit https://ai.dev/rate-limit to upgrade your plan for unlimited access."
    );
  }

  throw lastError; // All models failed, bubble up the most relevant one
};

export const analyzeResume = async (skills: string, projects: string, jobRequirements: string) => {
  if (!ai) {
    return {
      score: 85,
      feedback: "Great profile! (Mock Mode: Add your VITE_GEMINI_API_KEY to .env for real AI feedback)",
      missingSkills: ["Example Skill 1", "Example Skill 2"],
      strengths: ["Strong Project Experience", "Technical Depth"]
    };
  }

  try {
    const prompt = `As an expert HR recruiter, analyze this resume. 
      Skills: ${skills}, Projects: ${projects}, JD: ${jobRequirements}
      Return JSON: { "score": number, "feedback": "string", "missingSkills": ["string"], "strengths": ["string"] }`;

    const response = await safeGenerateContent(prompt);

    const text = response.text || "";
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end));
    }
    return { score: 70, feedback: "Analysis returned incomplete data." };
  } catch (error) {
    console.error("Gemini AI error:", error);
    return { score: 60, feedback: "Error during AI analysis." };
  }
};

export const parseSummaryToResume = async (summaryText: string) => {
  if (!ai) return null;
  try {
    const prompt = `Convert this text to resume JSON: "${summaryText}". 
    Fields: name, objective, degree, college, year, cgpa, languages, web_tech, tools, project1_title, project1_desc, project1_tech, project2_title, project2_desc, project2_tech, company, role, duration, work, achievement1, achievement2, strength1, strength2, spoken_languages.
    Only return raw JSON.`;

    const response = await safeGenerateContent(prompt);

    const text = response.text || "";
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end));
    }
    return null;
  } catch (err) {
    console.error("Error parsing summary:", err);
    return null;
  }
};

export const suggestField = async (fieldName: string, currentDetails: any) => {
  if (!ai) {
    const degree = currentDetails.degree?.toLowerCase() || "";
    if (fieldName === 'objective') {
      if (degree.includes("computer") || degree.includes("cse"))
        return "Ambitious Computer Science student with a focus on full-stack development and cloud architecture. Proven track record of building scalable web applications and collaborating in agile teams. Passionate about solving complex problems through clean, efficient code.";
      if (degree.includes("electronics") || degree.includes("ece"))
        return "Detail-oriented Electronics & Communication Engineering student with expertise in embedded systems and IoT. Skilled in hardware-software integration, circuit design, and firmware development. Seeking to leverage technical skills in a challenging engineering role.";
      return "Results-oriented student with strong analytical skills and a passion for technology. Committed to continuous learning and contributing to innovative projects within a professional team environment.";
    }
    if (fieldName === 'languages') {
      if (degree.includes("computer") || degree.includes("cse")) return "Java, Python, C++, JavaScript, TypeScript, SQL, Go";
      if (degree.includes("electronics") || degree.includes("ece")) return "Embedded C, Python, MATLAB, Verilog, VHDL, C++";
      return "Java, Python, C++, SQL";
    }
    return `Professional ${fieldName} content tailored for ${currentDetails.degree || "your field"}...`;
  }

  try {
    const prompt = `As an expert career coach, suggest highly professional, ATS-friendly content for the "${fieldName}" section of a resume.
    Student Background: ${currentDetails.degree || "Not specified"}
    Current Skills: ${currentDetails.languages || "Not specified"}
    
    Requirements:
    - Use strong action verbs.
    - Keep it concise but impactful.
    - Return ONLY the suggested text, no commentary or quotes.`;

    const response = await safeGenerateContent(prompt);
    return (response.text || "").trim().replace(/^["']|["']$/g, '');
  } catch (err) {
    console.error("Error suggesting field:", err);
    return "";
  }
};

type ChatMsg = { role: "user" | "assistant"; text: string };

export const chatWithAI = async (
  messages: ChatMsg[],
  currentForm: any
): Promise<{ reply: string; resumeData: any | null; action?: "download" }> => {

  const lastMsgTxt = (messages[messages.length - 1]?.text || "").toLowerCase();

  if (!ai) {
    const s = lastMsgTxt;
    if (s.includes("hello") || s.includes("hi") || s.includes("hey")) {
      return {
        reply: "Hi there! 👋 I'm your AI Resume Assistant. I can help with specific parts of your resume or build a full profile.",
        resumeData: null
      };
    }

    if (s.includes("download") || s.includes("export")) {
      return {
        reply: "Downloading your resume right now! 🚀 Check your downloads folder.",
        resumeData: null,
        action: "download"
      };
    }

    return {
      reply: "I'm ready to help! Ask for something specific like **'Give me a summary'** or **'Suggest skills'**. \n\n*Tip: Add a real API Key to .env for full ChatGPT-like brain power!*",
      resumeData: null
    };
  }

  try {
    const chatHistory = messages.map(m =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`
    ).join("\n\n");

    const prompt = `You are an expert resume writer and technical recruiter AI Resume Assistant. Your task is to generate a professional, ATS-friendly resume tailored specifically for the candidate based on their inputs.

1. Understand Company Type:
- Product-based (Google, Microsoft, Amazon, etc.): Focus on strong projects with real-world impact, problem-solving, technical depth, use metrics (e.g., improved performance by 30%).
- Service-based (Infosys, TCS, Wipro, etc.): Focus on academic performance, consistency, certifications, fundamental skills, clear and simple explanations.
- Unknown company: Intelligently assume style based on name and generate a balanced resume.

2. Writing Style Rules:
- Use strong action verbs (Developed, Built, Optimized, Designed).
- Keep it concise, professional, and ATS-friendly.
- Tailor the Professional Summary, Skills, and Projects directly to the user's target company or role.

3. Output Format instructions for "reply" field:
- If the user specifies a company to target, your "reply" MUST include:
  - A brief explanation of the suggested resume style (Modern / Minimal / Technical / Corporate) and why it suits the company.
  - A short section at the end called: "Why this resume fits [Company Name]" (Explain in 3-4 points).

CURRENT RESUME DATA:
${JSON.stringify(currentForm, null, 2)}

CONVERSATION HISTORY:
${chatHistory}

STRICT REDUCED OUTPUT RULES:
1. Provide a direct, helpful, natural answer in "reply", following the template above to evaluate fit for a company. Be chatty like ChatGPT.
2. If they provide info like company name, branch, skills, projects, update relevant fields in "resumeData" applying your expert recruiter transformations.
3. VERY IMPORTANT: Your final output MUST be pure JSON matching this exact structure:
{
  "reply": "your text response, formatted with markdown",
  "resumeData": { "fieldName": "newValue", ... },
  "action": "download" // ONLY add this exact key-value if the user explicitly asks to download or export the resume PDF. Otherwise, omit it completely.
}

FIELDS YOU CAN UPDATE:
name, objective, degree, college, year, cgpa, languages, web_tech, tools, project1_title, project1_desc, project1_tech, project2_title, project2_desc, project2_tech, company, role, duration, work, achievement1, achievement2, strength1, strength2, spoken_languages, job_title, ref1_name, ref1_role, ref1_contact, ref2_name, ref2_role, ref2_contact, templateStyle (choose from "modern", "corporate", "minimal", "technical").`;

    const response = await safeGenerateContent(prompt);

    const respText = response?.text || "";
    const start = respText.indexOf('{');
    const end = respText.lastIndexOf('}') + 1;

    if (start !== -1 && end !== -1) {
      let parsed;
      try {
        parsed = JSON.parse(respText.substring(start, end));
      } catch (e) {
        return { reply: "I tried to build that for you but my output formatting failed. Could you rephrase your request?", resumeData: null };
      }
      return {
        reply: parsed.reply || "I've updated the specific details you asked for!",
        resumeData: parsed.resumeData || null,
        action: parsed.action
      };
    }

    return { reply: respText, resumeData: null };
  } catch (error: any) {
    console.error("Gemini critical error:", error);
    const errorMessage = error?.statusText || error?.message || String(error);
    return {
      reply: `Gemini API Error: ${errorMessage}\n\nPlease check your Quota or try again shortly.`,
      resumeData: null
    };
  }
};
