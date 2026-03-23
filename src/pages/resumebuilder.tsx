import { useState, useRef, useEffect } from "react";
import { User, Mail, Phone, Link as LinkIcon, Github, Briefcase, GraduationCap, Award, Languages, Sparkles, Download, Edit3, Trash2, Plus, Send, Bot, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { exportResumePDF } from "../services/exportUtils";
import { chatWithAI, suggestField } from "../services/aiService";

type ChatMsg = { role: "user" | "assistant"; text: string };

export default function ResumeBuilder() {
  const [activeStep, setActiveStep] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { role: "assistant", text: "Hi! 👋 I'm your AI Resume Assistant — just like ChatGPT, but built for resumes.\n\nTell me about yourself! You can say things like:\n\n• \"I'm a CSE student interested in AI/ML, write a 6-line summary\"\n• \"Suggest skills for an ECE student\"\n• \"Help me brainstorm projects for my resume\"\n\nI'll chat with you and fill your resume automatically as we go!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [suggestingField, setSuggestingField] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({

    name: "Alex Johnson",
    phone: "+91 98765 43210",
    email: "alex.j@example.com",
    location: "Mumbai, India",
    linkedin: "linkedin.com/in/alexj",
    portfolio: "github.com/alexj",
    objective: "Highly motivated student with a strong foundation in Web Technologies and Problem Solving. Eager to contribute to high-impact projects and drive innovation within a professional team environment.",
    
    // Education
    degree: "B.Tech in Computer Science",
    college: "IIT Bombay",
    year: "2022-2026",
    cgpa: "9.2",

    // Skills
    languages: "Java, Python, C++, JavaScript, TypeScript",
    web_tech: "React, Next.js, Node.js, Express, Tailwind CSS",
    tools: "Git, Docker, AWS, Firebase, PostgreSQL",

    // Projects
    project1_title: "Campus Placement Portal",
    project1_desc: "Developed a full-stack placement management system with real-time analytics and automated resume tracking.",
    project1_tech: "MERN Stack, Socket.io",

    project2_title: "AI Interview Bot",
    project2_desc: "Built an AI-powered mock interview tool that provides real-time feedback using LLMs.",
    project2_tech: "Python, OpenAI API, React",

    // Experience
    company: "Google",
    role: "Software Engineering Intern",
    duration: "Summer 2025",
    work: "Optimized search latency by 15% and implemented new UI features for the cloud dashboard.",

    // Others
    achievement1: "Winner of SIH 2024 (Smart India Hackathon)",
    achievement2: "Ranked 150 globally in Google Kickstart Round F",
    strength1: "Strong analytical and problem-solving mindset",
    strength2: "Excellent team collaboration and communication",
    spoken_languages: "English (Professional), Hindi (Native), Spanish (Elementary)"
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const clearForm = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setForm({
        name: "", phone: "", email: "", location: "", linkedin: "", portfolio: "", objective: "",
        degree: "", college: "", year: "", cgpa: "",
        languages: "", web_tech: "", tools: "",
        project1_title: "", project1_desc: "", project1_tech: "",
        project2_title: "", project2_desc: "", project2_tech: "",
        company: "", role: "", duration: "", work: "",
        achievement1: "", achievement2: "", strength1: "", strength2: "", spoken_languages: ""
      });
    }
  };

  const steps = [
    { id: 'smart', label: 'AI Smart Fill', icon: Sparkles },
    { id: 'personal', label: 'Personal & Summary', icon: User },
    { id: 'education', label: 'Education & Skills', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'experience', label: 'Experience & Extras', icon: Award },
  ];

  useEffect(() => {
    // Slight timeout to ensure the message bubble has been rendered
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
    return () => clearTimeout(timer);
  }, [chatMessages, chatLoading]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", text: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const { reply, resumeData } = await chatWithAI(newMessages, form);
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
      if (resumeData) {
        setForm(prev => ({ ...prev, ...resumeData }));
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Please try again!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSuggest = async (fieldName: string) => {
    setSuggestingField(fieldName);
    try {
      const suggestion = await suggestField(fieldName, form);
      if (suggestion) {
        setForm(prev => ({ ...prev, [fieldName]: suggestion }));
      }
    } catch (err) {
      console.error("Suggestion failed", err);
    } finally {
      setSuggestingField(null);
    }
  };

  const copyAsText = () => {
    const text = `
${form.name.toUpperCase()}
${form.location} | ${form.phone} | ${form.email}
LinkedIn: ${form.linkedin} | GitHub: ${form.portfolio}

OBJECTIVE / SUMMARY
${form.objective}

EDUCATION
- ${form.degree} | ${form.college}
- Year: ${form.year} | CGPA: ${form.cgpa}

SKILLS
- Programming Languages: ${form.languages}
- Web Technologies: ${form.web_tech}
- Tools & Technologies: ${form.tools}

PROJECTS
1. Title: ${form.project1_title}
   Description: ${form.project1_desc}
   Technologies: ${form.project1_tech}

2. Title: ${form.project2_title}
   Description: ${form.project2_desc}
   Technologies: ${form.project2_tech}

EXPERIENCE
- Company: ${form.company}
- Role: ${form.role} | Duration: ${form.duration}
- Work Done: ${form.work}

ACHIEVEMENTS
- ${form.achievement1}
- ${form.achievement2}

STRENGTHS
- ${form.strength1}
- ${form.strength2}

ADDITIONAL
- Languages Known: ${form.spoken_languages}
    `.trim();
    
    navigator.clipboard.writeText(text);
    alert("Resume content copied as clean text!");
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-8">
      <div className="flex flex-col xl:flex-row gap-10">
        
        {/* Left Side - Editor */}
        <div className="xl:w-1/2 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Resume <span className="text-gradient">Generator</span></h1>
              <p className="text-slate-500 font-medium mt-1">Professional ATS-Friendly Format</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={clearForm}
                className="px-4 py-3 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2"
                title="Clear all fields"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={copyAsText}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <Edit3 size={18} />
                Copy Text
              </button>
              <button
                disabled={exporting}
                onClick={async () => {
                  setExporting(true);
                  try { exportResumePDF(form); }
                  finally { setExporting(false); }
                }}
                className="px-6 py-3 bg-sky-600 text-white font-black rounded-2xl shadow-lg shadow-sky-100 flex items-center gap-2 hover:bg-sky-700 transition-all disabled:opacity-70"
              >
                <Download size={20} />
                {exporting ? "Generating..." : "Export PDF"}
              </button>
            </div>
          </div>

          <div className="flex p-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto custom-scrollbar">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all whitespace-nowrap",
                  activeStep === idx 
                    ? "bg-slate-900 text-white shadow-xl" 
                    : "text-slate-400 hover:bg-slate-50"
                )}
              >
                <step.icon size={18} />
                {step.label}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px]">
             {/* Steps content... (unchanged except wrapping in motion.div) */}
             <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {activeStep === 0 && (
                  <div className="flex flex-col h-[580px]">
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
                      <div className="p-2.5 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-xl shadow-lg">
                        <Bot size={22} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg">AI Resume Assistant</h3>
                        <p className="text-xs text-sky-500 font-semibold">Powered by Gemini AI • Chat to build your resume</p>
                      </div>
                      <button
                        onClick={() => setActiveStep(1)}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-sky-600 transition-all"
                      >
                        Open Editor <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={cn("flex gap-4", msg.role === "user" ? "justify-end" : "justify-start")}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-200">
                              <Bot size={20} className="text-white" />
                            </div>
                          )}
                          <div className={cn(
                            "max-w-[85%] px-5 py-4 rounded-[1.5rem] text-[15px] leading-relaxed font-medium shadow-sm transition-all",
                            msg.role === "user"
                              ? "bg-slate-900 text-white rounded-br-none"
                              : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                          )}>
                            <div className="whitespace-pre-wrap">
                                {msg.text.split('\n').map((line, idx) => {
                                    // Simple bold formatter
                                    const parts = line.split(/(\*\*.*?\*\*)/g);
                                    return (
                                        <p key={idx} className={cn(idx > 0 && "mt-2")}>
                                            {parts.map((part, pIdx) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={pIdx} className="font-black text-sky-600">{part.slice(2, -2)}</strong>;
                                                }
                                                return part;
                                            })}
                                        </p>
                                    );
                                })}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {chatLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-200 flex-shrink-0">
                            <Bot size={20} className="text-white" />
                          </div>
                          <div className="bg-white border border-slate-100 px-6 py-5 rounded-[1.5rem] rounded-bl-none flex items-center gap-2 shadow-sm">
                            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                          </div>
                        </motion.div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input Box */}
                    <div className="mt-6">
                      <div className="flex gap-3 bg-slate-50 p-2 rounded-[2rem] border border-slate-200 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10 transition-all">
                        <input
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                          placeholder="Ask me anything or say 'I am a CSE student'..."
                          className="flex-1 bg-transparent px-4 py-3 outline-none font-medium text-slate-700 text-[15px] placeholder:text-slate-400"
                        />
                        <button
                          onClick={handleChatSend}
                          disabled={chatLoading || !chatInput.trim()}
                          className="w-12 h-12 flex items-center justify-center bg-sky-600 text-white rounded-full hover:bg-sky-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-100 flex-shrink-0"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Full Name" name="name" value={form.name} onChange={handleChange} icon={User} />
                      <InputGroup label="Location" name="location" value={form.location} onChange={handleChange} icon={Phone} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Email Address" name="email" value={form.email} onChange={handleChange} icon={Mail} />
                      <InputGroup label="Phone Number" name="phone" value={form.phone} onChange={handleChange} icon={Phone} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} icon={LinkIcon} />
                      <InputGroup label="GitHub / Portfolio" name="portfolio" value={form.portfolio} onChange={handleChange} icon={Github} />
                    </div>
                    <div className="relative">
                      <TextAreaGroup label="Professional Summary" name="objective" value={form.objective} onChange={handleChange} icon={Sparkles} />
                      <button 
                        onClick={() => handleSuggest('objective')}
                        disabled={!!suggestingField}
                        className="absolute right-4 top-10 p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-all"
                        title="Suggest professional summary"
                      >
                        {suggestingField === 'objective' ? <div className="w-4 h-4 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" /> : <Sparkles size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Degree" name="degree" value={form.degree} onChange={handleChange} icon={GraduationCap} />
                      <InputGroup label="College" name="college" value={form.college} onChange={handleChange} icon={GraduationCap} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Year" name="year" value={form.year} onChange={handleChange} icon={GraduationCap} />
                      <InputGroup label="CGPA / Percentage" name="cgpa" value={form.cgpa} onChange={handleChange} icon={GraduationCap} />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 relative">
                      <InputGroup label="Programming Languages" name="languages" value={form.languages} onChange={handleChange} icon={Award} />
                      <button 
                         onClick={() => handleSuggest('languages')}
                         disabled={!!suggestingField}
                         className="absolute right-4 top-10 p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-all"
                         title="Suggest skills for your branch"
                       >
                         {suggestingField === 'languages' ? <div className="w-4 h-4 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" /> : <Sparkles size={16} />}
                      </button>
                    </div>

                    <InputGroup label="Web Technologies" name="web_tech" value={form.web_tech} onChange={handleChange} icon={Award} />
                    <InputGroup label="Tools & Tech" name="tools" value={form.tools} onChange={handleChange} icon={Award} />
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-8">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <h3 className="font-black text-slate-800">Project 1</h3>
                      <InputGroup label="Title" name="project1_title" value={form.project1_title} onChange={handleChange} icon={Plus} />
                      <InputGroup label="Technologies" name="project1_tech" value={form.project1_tech} onChange={handleChange} icon={Plus} />
                      <TextAreaGroup label="Description" name="project1_desc" value={form.project1_desc} onChange={handleChange} icon={Plus} />
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <h3 className="font-black text-slate-800">Project 2</h3>
                      <InputGroup label="Title" name="project2_title" value={form.project2_title} onChange={handleChange} icon={Plus} />
                      <InputGroup label="Technologies" name="project2_tech" value={form.project2_tech} onChange={handleChange} icon={Plus} />
                      <TextAreaGroup label="Description" name="project2_desc" value={form.project2_desc} onChange={handleChange} icon={Plus} />
                    </div>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-6">
                    <div className="p-6 bg-sky-50/50 rounded-3xl border border-sky-100/50 space-y-4">
                      <h3 className="font-black text-sky-900">Experience</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="Company" name="company" value={form.company} onChange={handleChange} icon={Briefcase} />
                        <InputGroup label="Role" name="role" value={form.role} onChange={handleChange} icon={Briefcase} />
                      </div>
                      <InputGroup label="Duration" name="duration" value={form.duration} onChange={handleChange} icon={Briefcase} />
                      <TextAreaGroup label="Work Done" name="work" value={form.work} onChange={handleChange} icon={Briefcase} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextAreaGroup label="Achievement 1" name="achievement1" value={form.achievement1} onChange={handleChange} icon={Award} />
                      <TextAreaGroup label="Achievement 2" name="achievement2" value={form.achievement2} onChange={handleChange} icon={Award} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Strength 1" name="strength1" value={form.strength1} onChange={handleChange} icon={Sparkles} />
                      <InputGroup label="Strength 2" name="strength2" value={form.strength2} onChange={handleChange} icon={Sparkles} />
                    </div>
                    <InputGroup label="Languages Known" name="spoken_languages" value={form.spoken_languages} onChange={handleChange} icon={Languages} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side - Live Preview */}
        <div className="xl:w-1/2">
          <div className="sticky top-28">
             {/* Preview Card */}
            <div className="bg-white min-h-[842px] w-full shadow-2xl p-8 sm:p-12 overflow-hidden border border-slate-100 font-serif text-slate-900">
              
              {/* Header */}
              {(form.name || form.email || form.phone) && (
                <div className="text-center space-y-2 mb-6">
                  <h1 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => setForm({ ...form, name: e.currentTarget.innerText })}
                    className="text-3xl font-bold uppercase tracking-tight outline-none focus:bg-slate-50 min-h-[1.2em]"
                  >
                    {form.name || "YOUR NAME"}
                  </h1>
                  <p className="text-sm">
                    <Editable text={form.location} name="location" setForm={setForm} form={form} />
                    {(form.location && (form.phone || form.email)) ? " | " : ""}
                    <Editable text={form.phone} name="phone" setForm={setForm} form={form} />
                    {(form.phone && form.email) ? " | " : ""}
                    <Editable text={form.email} name="email" setForm={setForm} form={form} />
                  </p>
                  {(form.linkedin || form.portfolio) && (
                    <p className="text-xs text-sky-600 font-medium">
                      {form.linkedin && <>LinkedIn: <Editable text={form.linkedin} name="linkedin" setForm={setForm} form={form} /></>}
                      {form.linkedin && form.portfolio ? " | " : ""}
                      {form.portfolio && <>GitHub: <Editable text={form.portfolio} name="portfolio" setForm={setForm} form={form} /></>}
                    </p>
                  )}
                  <hr className="border-slate-300 mt-4" />
                </div>
              )}

              {/* Summary */}
              {form.objective && (
                <div className="space-y-2 mb-6 text-sm">
                  <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[13px]">Summary / Objective</h4>
                  <p 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => setForm({ ...form, objective: e.currentTarget.innerText })}
                    className="leading-relaxed text-slate-600 italic outline-none focus:bg-slate-50"
                  >
                    "{form.objective}"
                  </p>
                  <hr className="border-slate-200 mt-4" />
                </div>
              )}

              {/* Education */}
              {(form.degree || form.college) && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[13px]">Education</h4>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm">
                        <Editable text={form.degree} name="degree" setForm={setForm} form={form} placeholder="Degree Name" />
                      </p>
                      <p className="text-sm text-slate-600">
                        <Editable text={form.college} name="college" setForm={setForm} form={form} placeholder="College/University" />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        <Editable text={form.year} name="year" setForm={setForm} form={form} placeholder="Year" />
                      </p>
                      {form.cgpa && (
                        <p className="text-sm text-sky-600 font-bold">
                          CGPA: <Editable text={form.cgpa} name="cgpa" setForm={setForm} form={form} />
                        </p>
                      )}
                    </div>
                  </div>
                  <hr className="border-slate-200 mt-4" />
                </div>
              )}

              {/* Skills */}
              {(form.languages || form.web_tech || form.tools) && (
                <div className="space-y-2 mb-6 text-sm">
                  <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[13px]">Skills</h4>
                  <div className="space-y-1">
                    {form.languages && (
                      <p>
                        <span className="font-bold">Programming Languages:</span>{" "}
                        <Editable text={form.languages} name="languages" setForm={setForm} form={form} />
                      </p>
                    )}
                    {form.web_tech && (
                      <p>
                        <span className="font-bold">Web Technologies:</span>{" "}
                        <Editable text={form.web_tech} name="web_tech" setForm={setForm} form={form} />
                      </p>
                    )}
                    {form.tools && (
                      <p>
                        <span className="font-bold">Tools & Technologies:</span>{" "}
                        <Editable text={form.tools} name="tools" setForm={setForm} form={form} />
                      </p>
                    )}
                  </div>
                  <hr className="border-slate-200 mt-4" />
                </div>
              )}

              {/* Projects */}
              {(form.project1_title || form.project2_title) && (
                <div className="space-y-4 mb-6 text-sm">
                  <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[13px]">Projects</h4>
                  {form.project1_title && (
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <Editable text={form.project1_title} name="project1_title" setForm={setForm} form={form} />
                        <span className="text-sky-600 text-[11px]">
                          <Editable text={form.project1_tech} name="project1_tech" setForm={setForm} form={form} />
                        </span>
                      </div>
                      <p className="text-slate-600">• <Editable text={form.project1_desc} name="project1_desc" setForm={setForm} form={form} /></p>
                    </div>
                  )}
                  {form.project2_title && (
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <Editable text={form.project2_title} name="project2_title" setForm={setForm} form={form} />
                        <span className="text-sky-600 text-[11px]">
                          <Editable text={form.project2_tech} name="project2_tech" setForm={setForm} form={form} />
                        </span>
                      </div>
                      <p className="text-slate-600">• <Editable text={form.project2_desc} name="project2_desc" setForm={setForm} form={form} /></p>
                    </div>
                  )}
                  <hr className="border-slate-200 mt-4" />
                </div>
              )}

              {/* Experience */}
              {form.company && (
                <div className="space-y-2 mb-6 text-sm">
                  <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[13px]">Experience</h4>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-bold">
                        <Editable text={form.role} name="role" setForm={setForm} form={form} />
                      </p>
                      <p className="text-slate-600 italic text-[13px]">
                        <Editable text={form.company} name="company" setForm={setForm} form={form} />
                      </p>
                    </div>
                    <p className="font-bold text-[13px]">
                      <Editable text={form.duration} name="duration" setForm={setForm} form={form} />
                    </p>
                  </div>
                  <p className="text-slate-600">• <Editable text={form.work} name="work" setForm={setForm} form={form} /></p>
                  <hr className="border-slate-200 mt-4" />
                </div>
              )}

              {/* Achievements */}
              {(form.achievement1 || form.achievement2) && (
                <div className="space-y-2 mb-6 text-sm">
                  <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[13px]">Achievements</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {form.achievement1 && <li><Editable text={form.achievement1} name="achievement1" setForm={setForm} form={form} /></li>}
                    {form.achievement2 && <li><Editable text={form.achievement2} name="achievement2" setForm={setForm} form={form} /></li>}
                  </ul>
                  <hr className="border-slate-200 mt-4" />
                </div>
              )}

              {/* Strengths & Extra */}
              {(form.strength1 || form.strength2 || form.spoken_languages) && (
                <div className="grid grid-cols-2 gap-8 text-sm">
                  {(form.strength1 || form.strength2) && (
                    <div className="space-y-2">
                      <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[13px]">Strengths</h4>
                      <ul className="list-disc list-inside text-slate-600 text-[11px]">
                        {form.strength1 && <li><Editable text={form.strength1} name="strength1" setForm={setForm} form={form} /></li>}
                        {form.strength2 && <li><Editable text={form.strength2} name="strength2" setForm={setForm} form={form} /></li>}
                      </ul>
                    </div>
                  )}
                  {form.spoken_languages && (
                    <div className="space-y-2">
                      <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[13px]">Languages Known</h4>
                      <p className="text-slate-600 italic">
                        <Editable text={form.spoken_languages} name="spoken_languages" setForm={setForm} form={form} />
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Editable({ text, name, setForm, form, placeholder = "" }: { text: string, name: string, setForm: any, form: any, placeholder?: string }) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => setForm({ ...form, [name]: e.currentTarget.innerText })}
      className="outline-none focus:bg-sky-50 px-0.5 rounded transition-all min-w-[20px] inline-block"
    >
      {text || placeholder}
    </span>
  );
}

function InputGroup({ label, name, value, onChange, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-600 transition-colors" size={18} />
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all font-bold text-slate-700"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );
}

function TextAreaGroup({ label, name, value, onChange, icon: Icon, rows = 3 }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-4 text-slate-300 group-focus-within:text-sky-600 transition-colors" size={18} />
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all font-bold text-slate-700 resize-none"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );
}

function PreviewSection({ title, value }: { title: string, value: string }) {
  if (!value) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest border-b border-slate-100 pb-1">{title}</h4>
      <p className="text-[11px] font-bold text-slate-700 whitespace-pre-line leading-relaxed">{value}</p>
    </div>
  );
}