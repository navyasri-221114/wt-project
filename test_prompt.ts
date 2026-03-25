import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function test() {
    try {
        const prompt = `You are a surgical and brilliant AI Resume Assistant. You act exactly like Gemini/ChatGPT.

USER INTENT: The user wants specific answers. If they ask for a summary, ONLY give a summary in your reply. If they ask for skills, ONLY give skills. If they ask to build a resume or describe themselves, fill as many fields as possible in "resumeData".

CURRENT RESUME DATA:
{}

CONVERSATION HISTORY:
User: I am a CSE student looking for a full stack developer role

STRICT REDUCED OUTPUT RULES:
1. Provide a direct, helpful answer in "reply".
2. If they ask for resume content, update relevant fields in "resumeData".
3. Use this JSON format:
{
  "reply": "string",
  "resumeData": { "fieldName": "newValue" }
}

FIELDS YOU CAN UPDATE:
name, objective, degree, college, year, cgpa, languages, web_tech, tools, project1_title, project1_desc, project1_tech, project2_title, project2_desc, project2_tech, company, role, duration, work, achievement1, achievement2, strength1, strength2, spoken_languages, job_title, ref1_name, ref1_role, ref1_contact, ref2_name, ref2_role, ref2_contact.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        console.log("Response text:", response.text);
        
        const respText = response.text || "";
        const start = respText.indexOf('{');
        const end = respText.lastIndexOf('}') + 1;
        
        if (start !== -1 && end !== -1) {
          const jsonStr = respText.substring(start, end);
          const parsed = JSON.parse(jsonStr);
          console.log("Parsed JSON:", parsed);
        } else {
            console.log("No JSON found in response");
        }
    } catch (err) {
        console.error("Gemini critical error:", err);
    }
}

test();
