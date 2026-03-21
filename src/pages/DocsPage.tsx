import { motion } from "motion/react";
import {
  FileText, Briefcase, Sparkles, Video, Shield,
  HelpCircle, ChevronRight, BookOpen, User,
  CheckCircle2, AlertCircle
} from "lucide-react";

export default function DocsPage() {
  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      content: "Welcome to CampusPro! This platform is designed to streamline your career journey. Start by completing your profile and building your resume using our intelligent builder."
    },
    {
      id: "job-applications",
      title: "Job Applications",
      icon: Briefcase,
      content: "Browse positions tailored to your profile. Each job listing includes eligibility criteria such as minimum CGPA, required skills, and salary packages. Once you apply, you can track your status in real-time from your dashboard."
    },
    {
      id: "ai-readiness",
      title: "AI Readiness & Scoring",
      icon: Sparkles,
      content: "Our AI engine analyzes your resume against job descriptions. A higher score indicates a better match. Improve your score by highlighting relevant skills and experiences mentioned in the job description."
    },
    {
      id: "interviews",
      title: "Interview Process",
      icon: Video,
      content: "Scheduled interviews will appear in your 'Live Engagements'. Our built-in interview room supports video, chat, and a synchronized scratchpad for technical rounds. Ensure your camera and microphone are functional before joining."
    },
    {
      id: "profile-privacy",
      title: "Profile & Privacy",
      icon: Shield,
      content: "Your profile is your digital identity. Keep it updated with your latest academic records and certifications. Companies use this data to find potential candidates for specialized roles."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-full text-xs font-black uppercase tracking-widest">
          <BookOpen size={14} /> Knowledge Base
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Platform <span className="text-gradient">Documentation</span></h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl">
          Everything you need to know about using the Campus Placement Portal effectively.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Navigation - Sidebar */}
        <div className="md:col-span-3">
          <div className="sticky top-32 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Table of Contents</p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all group"
              >
                <section.icon size={18} className="group-hover:scale-110 transition-transform" />
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 space-y-20">
          {sections.map((section) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                  <section.icon size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{section.title}</h2>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm leading-relaxed">
                <p className="text-lg text-slate-600 font-medium mb-8">
                  {section.content}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-3 text-sky-600 font-black text-xs uppercase tracking-widest mb-3">
                      <CheckCircle2 size={16} /> Best Practice
                    </div>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                      Always double-check your profile details before applying to avoid rejection based on data mismatch.
                    </p>
                  </div>
                  <div className="p-6 bg-yellow-50 rounded-3xl border border-yellow-100">
                    <div className="flex items-center gap-3 text-yellow-600 font-black text-xs uppercase tracking-widest mb-3">
                      <AlertCircle size={16} /> Important Note
                    </div>
                    <p className="text-sm text-slate-600 font-bold leading-relaxed">
                      Application deadlines are strict. Ensure you apply at least 24 hours before the closing time.
                    </p>
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-50">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Related Knowledge</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Application Flow", "Resume Tips", "Technical Interviews", "Data Safety"].map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-wider hover:border-sky-200 hover:text-sky-600 cursor-default transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          ))}

          {/* Support CTA */}
          <div className="bg-sky-600 p-12 rounded-[3rem] text-center space-y-6 shadow-2xl shadow-sky-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full -mr-32 -mb-32 blur-3xl" />

            <h3 className="text-3xl font-black text-white relative z-10">Still have questions?</h3>
            <p className="text-sky-100 font-medium max-w-md mx-auto relative z-10">
              Our support team is available 24/7 to assist you with any platform-related issues.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-10">
              <button className="px-8 py-4 bg-white text-sky-600 font-black rounded-2xl shadow-xl hover:bg-slate-50 transition-all active:scale-95">
                Contact Support
              </button>
              <button className="px-8 py-4 bg-sky-500 text-white font-black rounded-2xl hover:bg-sky-400 transition-all">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
