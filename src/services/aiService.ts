import { GoogleGenAI } from "@google/genai";

// 1. Better API Key checking - if it's the placeholder, we treat it as null to use Mock mode.
const getApiKey = () => {
  const key = typeof window !== 'undefined' 
    ? (import.meta as any).env?.VITE_GEMINI_API_KEY 
    : process.env.GEMINI_API_KEY;
  
  if (!key || key === "your_gemini_api_key_here" || key.trim() === "") return null;
  return key;
};

const apiKey = getApiKey();
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeResume = async (skills: string, projects: string, jobRequirements: string) => {
  if (!genAI) {
    return { 
      score: 85, 
      feedback: "Great profile! (Mock Mode: Add your GEMINI_API_KEY to .env for real AI feedback)",
      missingSkills: ["Example Skill 1", "Example Skill 2"],
      strengths: ["Strong Project Experience", "Technical Depth"]
    };
  }

  try {
    const prompt = `As an expert HR recruiter, analyze this resume. 
      Skills: ${skills}, Projects: ${projects}, JD: ${jobRequirements}
      Return JSON: { "score": number, "feedback": "string", "missingSkills": ["string"], "strengths": ["string"] }`;
    const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    return JSON.parse(text.substring(start, end));
  } catch (error) {
    console.error("Gemini AI error:", error);
    return { score: 60, feedback: "Error during AI analysis." };
  }
};

export const parseSummaryToResume = async (summaryText: string) => {
  if (!genAI) return null; // Component handles fallback
  try {
    const prompt = `Convert this text to resume JSON: "${summaryText}". 
    Fields: name, objective, degree, college, year, cgpa, languages, web_tech, tools, project1_title, project1_desc, project1_tech, project2_title, project2_desc, project2_tech, company, role, duration, work, achievement1, achievement2, strength1, strength2, spoken_languages.
    Only return raw JSON.`;
    const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    return JSON.parse(text.substring(start, end));
  } catch (err) {
    return null;
  }
};

export const suggestField = async (fieldName: string, currentDetails: any) => {
  if (!genAI) {
    // Premium Mock Suggestions
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
    
    const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^["']|["']$/g, '');
  } catch (err) { 
    return ""; 
  }
};

type ChatMsg = { role: "user" | "assistant"; text: string };

export const chatWithAI = async (
  messages: ChatMsg[],
  currentForm: any
): Promise<{ reply: string; resumeData: any | null }> => {

  const lastMsgTxt = (messages[messages.length - 1]?.text || "").toLowerCase();

  // 1. PREMIUM MOCK LOGIC (When no real API Key is provided)
  if (!genAI) {
    const s = lastMsgTxt;
    
    // Help & Greetings
    if (s.includes("hello") || s.includes("hi") || s.includes("hey")) {
      return {
        reply: "Hi there! 👋 I'm your AI Resume Assistant. I can help with specific parts of your resume or build a full profile. \n\nTry asking:\n• \"Give me a **summary** for a CSE student\"\n• \"Suggest **skills** for a web developer\"\n• \"Tell me some **projects** for ECE\"",
        resumeData: null
      };
    }

    // Surgical Requests (Summary/Skills/Projects)
    const isSummary = s.includes("summary") || s.includes("objective") || s.includes("about me");
    const isSkills = s.includes("skill") || s.includes("languages") || s.includes("tech");
    const isProjects = s.includes("project");
    const isCSE = s.includes("cse") || s.includes("computer science");
    const isECE = s.includes("ece") || s.includes("electronics");

    if (isSummary) {
        const text = isCSE 
            ? "Ambitious Computer Science student with a focus on full-stack development and cloud architecture. Proven track record of building scalable web applications and collaborating in agile teams. Passionate about solving complex problems through clean, efficient code."
            : isECE 
            ? "Detail-oriented Electronics & Communication Engineering student with expertise in embedded systems and IoT. Skilled in hardware-software integration, circuit design, and firmware development. Seeking to leverage technical skills in a challenging engineering role."
            : "Highly motivated student with strong analytical skills and a passion for technology. Committed to continuous learning and contributing to innovative projects within a professional team environment.";
        return {
            reply: `Here is a professional **summary** tailored for you:\n\n"${text}"\n\n✅ I've updated your resume summary!`,
            resumeData: { objective: text }
        };
    }

    if (isSkills) {
        const skills = isCSE 
            ? "JavaScript, TypeScript, Python, Java, React, Next.js, Docker, AWS, PostgreSQL" 
            : isECE 
            ? "Embedded C, Python, MATLAB, Verilog, Arduino, ESP32, Raspberry Pi, Keil"
            : "Java, Python, C++, SQL, Git";
        return {
            reply: `Here are some high-impact **skills** for your profile:\n\n**${skills}**\n\n✅ These have been added to your skills section!`,
            resumeData: { languages: skills }
        };
    }

    if (isProjects) {
        const p1 = isCSE ? "Smart Task Manager" : "IoT Health Monitor";
        const p1_desc = isCSE ? "Full-stack task manager with AI prioritization." : "Wearable sensor system for real-time health tracking.";
        return {
            reply: `I've suggested a new **project** for you: **${p1}**. \n\n"${p1_desc}"\n\n✅ Check the Projects tab to see the details!`,
            resumeData: { project1_title: p1, project1_desc: p1_desc }
        };
    }

    // Default Branch Profile (Full)
    if (isCSE) {
      return {
        reply: `I've built a full **Computer Science** profile for you with matching skills, summary, and projects. \n\n✅ Everything is filled! Click **Open Editor** to see.`,
        resumeData: {
          degree: "B.Tech in Computer Science & Engineering",
          languages: "JavaScript, TypeScript, Python, Java, C++",
          web_tech: "React.js, Next.js, Node.js, Express.js, Tailwind CSS",
          tools: "Git, Docker, AWS, PostgreSQL, MongoDB, Postman",
          objective: "A passionate Computer Science student with hands-on experience in full-stack web development and AI/ML systems. Skilled at building clean, scalable applications using modern JavaScript ecosystems.",
          project1_title: "Smart Task Manager", project1_tech: "React, Node.js, Socket.io, MongoDB",
          project1_desc: "Built a real-time collaborative task manager with JWT-auth and AI-assisted prioritization.",
          project2_title: "Compiler Visualizer", project2_tech: "React, TypeScript, D3.js",
          project2_desc: "Developed an interactive web tool that visualizes AST generation and tokenization for educational use."
        }
      };
    }

    if (isECE) {
      return {
        reply: `I've populated your resume with **ECE-focused** content, including Embedded Systems projects and hardware skills. \n\n✅ You're all set!`,
        resumeData: {
          degree: "B.Tech in Electronics & Communication Engineering",
          languages: "Embedded C, Python, MATLAB, Verilog, Assembly",
          web_tech: "MQTT, CoAP, Firebase, Bluetooth LE, Node-RED",
          tools: "Keil µVision, LTSpice, Arduino IDE, Raspberry Pi, Logic Analyzer",
          objective: "An Electronics & Communication Engineering student specializing in Embedded Systems design, IoT architecture, and Signal Processing.",
          project1_title: "Smart Health Monitor", project1_tech: "ESP32, MAX30105, Firebase",
          project1_desc: "Designed a wearable IoT health monitor tracking SpO2 and body temperature with live alerts.",
          project2_title: "Autonomous Line Follower", project2_tech: "STM32, IR Sensors, C",
          project2_desc: "Built a high-precision PID-controlled autonomous robot using STM32 microcontroller."
        }
      };
    }

    return {
      reply: "I'm ready to help! Ask for something specific like **'Give me a summary'** or **'Suggest skills'**. \n\n*Tip: Add a real API Key to .env for full ChatGPT-like brain power!*",
      resumeData: null
    };
  }

  // 2. REAL GEMINI LOGIC (When a valid key is provided)
  try {
    const chatHistory = messages.map(m =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`
    ).join("\n\n");

    const prompt = `You are a surgical and brilliant AI Resume Assistant. You act exactly like Gemini/ChatGPT.

USER INTENT: The user wants specific answers. If they ask for a summary, ONLY give a summary in your reply. If they ask for skills, ONLY give skills. Do not be wordy or give "full profiles" unless requested.

CURRENT RESUME DATA:
${JSON.stringify(currentForm, null, 2)}

CONVERSATION HISTORY:
${chatHistory}

STRICT REDUCED OUTPUT RULES:
1. Provide a direct, helpful answer in "reply".
2. If the user asks a question like "How are you?", answer normally.
3. If they ask for resume content, update ONLY relevant fields in "resumeData".
4. Be surgical. No Yapping.

Response Format (JSON):
{
  "reply": "Your specific answer here. Use **bold** for emphasis.",
  "resumeData": { ... } // Only include fields mentioned or requested.
}`;

    const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const respText = result.response.text().trim();
    
    // Extract JSON part robustly
    const start = respText.indexOf('{');
    const end = respText.lastIndexOf('}') + 1;
    
    if (start !== -1 && end !== -1) {
      const jsonStr = respText.substring(start, end);
      const parsed = JSON.parse(jsonStr);
      return { 
        reply: parsed.reply || "I've updated the specific details you asked for!", 
        resumeData: parsed.resumeData || null 
      };
    }
    
    return { reply: respText, resumeData: null };
  } catch (error) {
    console.error("Gemini critical error:", error);
    return { 
      reply: "I'm having a bit of trouble answering that specific question. Could you try rephrasing? I can help with summaries, skills, or projects!", 
      resumeData: null 
    };
  }
};
