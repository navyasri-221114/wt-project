import { useState, useRef } from "react";
import { User, Mail, Phone, Link as LinkIcon, Github, Briefcase, GraduationCap, Award, Languages, Sparkles, Download, Eye, Edit3, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function ResumeBuilder() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: "Alex Johnson",
    phone: "+91 98765 43210",
    email: "alex.j@example.com",
    linkedin: "linkedin.com/in/alexj",
    github: "github.com/alexj",
    objective: "Highly motivated Frontend Developer with 2+ years of experience in building responsive web applications...",
    education: "B.Tech in Computer Science, IIT Bombay (2022-2026)\nCGPA: 9.2",
    technicalSkills: "React, TypeScript, Next.js, Tailwind CSS, Node.js, GraphQL, PostgreSQL",
    softSkills: "Team Leadership, Problem Solving, Critical Thinking, Communication",
    projects: "CampusPortal - A comprehensive placement management system built with React and Express.\nAI Interview Assistant - Real-time interview coaching tool using LLMs.",
    internships: "Software Engineering Intern @ Google (Summer 2025)\nFrontend Intern @ StartupX (Winter 2024)",
    certifications: "AWS Certified Developer Associate\nGoogle Professional Web Developer",
    achievements: "Winner of SIH 2024\nRank 150 in Google Kickstart",
    activities: "Lead Organizer @ TechFest\nCore Member @ Open Source Club",
    languages: "English (Professional), Hindi (Native), Spanish (Elementary)",
    hobbies: "Chess, Open Source Contribution, Biking",
    declaration: "I hereby declare that the information provided is true to the best of my knowledge.",
    references: "Available upon request"
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const steps = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills & More', icon: Award },
  ];

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col xl:flex-row gap-10">
        
        {/* Left Side - Editor */}
        <div className="xl:w-1/2 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Resume <span className="text-gradient">Architect</span></h1>
              <p className="text-slate-500 font-medium mt-1">Craft a masterpiece that opens doors.</p>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all">
                <Trash2 size={20} />
              </button>
              <button className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all">
                <Download size={20} /> Export PDF
              </button>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex p-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto custom-scrollbar">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all whitespace-nowrap",
                  activeStep === idx 
                    ? "bg-slate-900 text-white shadow-xl" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                )}
              >
                <step.icon size={18} />
                {step.label}
              </button>
            ))}
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {activeStep === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <InputGroup label="Full Name" name="name" value={form.name} onChange={handleChange} icon={User} />
                      <InputGroup label="Email Address" name="email" value={form.email} onChange={handleChange} icon={Mail} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <InputGroup label="Phone Number" name="phone" value={form.phone} onChange={handleChange} icon={Phone} />
                      <InputGroup label="LinkedIn URL" name="linkedin" value={form.linkedin} onChange={handleChange} icon={LinkIcon} />
                    </div>
                    <InputGroup label="GitHub Profile" name="github" value={form.github} onChange={handleChange} icon={Github} />
                    <TextAreaGroup label="Career Objective" name="objective" value={form.objective} onChange={handleChange} icon={Sparkles} />
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-6">
                    <TextAreaGroup label="Key Projects" name="projects" value={form.projects} onChange={handleChange} icon={Plus} rows={6} />
                    <TextAreaGroup label="Internships & Work Experience" name="internships" value={form.internships} onChange={handleChange} icon={Briefcase} rows={6} />
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-6">
                    <TextAreaGroup label="Education History" name="education" value={form.education} onChange={handleChange} icon={GraduationCap} rows={5} />
                    <TextAreaGroup label="Certifications" name="certifications" value={form.certifications} onChange={handleChange} icon={Award} rows={4} />
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <TextAreaGroup label="Technical Skills" name="technicalSkills" value={form.technicalSkills} onChange={handleChange} icon={Edit3} />
                      <TextAreaGroup label="Soft Skills" name="softSkills" value={form.softSkills} onChange={handleChange} icon={Languages} />
                    </div>
                    <TextAreaGroup label="Achievements" name="achievements" value={form.achievements} onChange={handleChange} icon={Award} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side - Live Preview */}
        <div className="xl:w-1/2">
          <div className="sticky top-28">
            <div className="flex items-center gap-2 mb-6 px-4">
              <Eye size={18} className="text-indigo-600" />
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Real-time Preview</span>
            </div>

            <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative group">
              {/* Paper Background */}
              <div className="bg-white min-h-[842px] w-full shadow-2xl p-12 overflow-hidden relative">
                
                {/* Header Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[5rem]"></div>
                
                <header className="mb-8 relative">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{form.name || "YOUR NAME"}</h2>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    <span className="flex items-center gap-2"><Mail size={12} className="text-indigo-600" /> {form.email}</span>
                    <span className="flex items-center gap-2"><Phone size={12} className="text-indigo-600" /> {form.phone}</span>
                    <span className="flex items-center gap-2"><LinkIcon size={12} className="text-indigo-600" /> {form.linkedin}</span>
                  </div>
                </header>

                <div className="space-y-8">
                  <PreviewSection title="Summary" value={form.objective} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <PreviewSection title="Experience" value={form.internships} />
                    <PreviewSection title="Education" value={form.education} />
                  </div>
                  <PreviewSection title="Projects" value={form.projects} />
                  
                  <div className="grid grid-cols-2 gap-10 pt-4 border-t border-slate-100">
                    <div>
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Expertise</h4>
                      <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{form.technicalSkills}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Honors</h4>
                      <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{form.achievements}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Decor */}
                <div className="absolute bottom-10 left-12 right-12 flex justify-between items-center opacity-20">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 truncate max-w-[200px]">{form.name}</p>
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-indigo-600 rounded-full"></div>)}
                  </div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-all duration-500 rounded-[3.5rem] pointer-events-none flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <p className="text-xs font-black text-indigo-600 flex items-center gap-2"><Sparkles size={14} /> Design optimized for ATS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
          placeholder={`Enter your ${label.toLowerCase()}`}
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
        <Icon className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 resize-none"
          placeholder={`Describe your ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );
}

function PreviewSection({ title, value }: { title: string, value: string }) {
  if (!value) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-1">{title}</h4>
      <p className="text-[11px] font-bold text-slate-700 whitespace-pre-line leading-relaxed">{value}</p>
    </div>
  );
}