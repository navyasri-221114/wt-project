import { GoogleGenAI } from "@google/genai";

const apiKey = typeof window !== 'undefined' ? (import.meta as any).env?.VITE_GEMINI_API_KEY : process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeResume = async (skills: string, projects: string, jobRequirements: string) => {
  if (!genAI) {
    console.warn("Gemini API Key missing. Returning mock analysis.");
    return { 
      score: 85, 
      feedback: "Great profile! (Mock Analysis: Add your GEMINI_API_KEY to .env for real AI feedback)",
      missingSkills: ["Example Skill 1", "Example Skill 2"],
      strengths: ["Strong Project Experience", "Technical Depth"]
    };
  }

  try {
    const prompt = `
      As an expert HR recruiter, analyze this candidate's profile against the job requirements.
      
      Candidate Skills: ${skills}
      Candidate Projects: ${projects}
      Job Requirements: ${jobRequirements}
      
      Provide a match analysis in JSON format ONLY. Do not include any other text or markdown:
      {
        "score": number (0-100),
        "feedback": "string (max 100 words)",
        "missingSkills": ["string"],
        "strengths": ["string"]
      }
    `;

    const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from possible markdown wrappers
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini AI error:", error);
    return { score: 60, feedback: "Error during AI analysis. Manual review recommended." };
  }
};

export const parseSummaryToResume = async (summary: string) => {
  if (!genAI) {
    console.warn("Gemini API Key missing. Returning mock resume data.");
    // Provide a more structured mock response so the user sees something happened
    return {
      name: "Alex johnson (Mock)",
      phone: "+91 00000 00000",
      email: "mock.alex@example.com",
      location: "City, Country",
      linkedin: "linkedin.com/in/alex",
      portfolio: "github.com/alex",
      objective: "Extracted from summary: " + summary.substring(0, 50) + "...",
      degree: "Computer Science Degree",
      college: "Your University",
      year: "2020-2024",
      cgpa: "9.0",
      languages: "React, Node.js, TypeScript",
      web_tech: "Tailwind CSS, Express",
      tools: "Git, VS Code",
      project1_title: "AI Resume Builder",
      project1_desc: "Simulated extraction since API key is missing.",
      project1_tech: "React, Gemini API",
      project2_title: "Second Project",
      project2_desc: "Another example project.",
      project2_tech: "Node.js",
      company: "Tech Intern Corp",
      role: "Software Intern",
      duration: "3 Months",
      work: "Worked on various feature implementations.",
      achievement1: "Best Intern Award",
      achievement2: "Solved 100+ LeetCode problems",
      strength1: "Fast Learner",
      strength2: "Team Player",
      spoken_languages: "English, Hindi"
    };
  }

  try {
    const prompt = `
      You are a professional resume generator.
      Convert the following unstructured user details/summary into a clean, structured JSON format for a resume.
      The output MUST be a valid JSON object matching this structure:
      {
        "name": "string",
        "phone": "string",
        "email": "string",
        "location": "string",
        "linkedin": "string",
        "portfolio": "string",
        "objective": "string",
        "degree": "string",
        "college": "string",
        "year": "string",
        "cgpa": "string",
        "languages": "string",
        "web_tech": "string",
        "tools": "string",
        "project1_title": "string",
        "project1_desc": "string",
        "project1_tech": "string",
        "project2_title": "string",
        "project2_desc": "string",
        "project2_tech": "string",
        "company": "string",
        "role": "string",
        "duration": "string",
        "work": "string",
        "achievement1": "string",
        "achievement2": "string",
        "strength1": "string",
        "strength2": "string",
        "spoken_languages": "string"
      }

      User Details/Summary:
      ${summary}

      Ensure the output is clean, professional, and ATS-friendly. JSON ONLY.
    `;

    const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini AI parse error:", error);
    return null;
  }
};
