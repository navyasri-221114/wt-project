import { useState } from "react";
import { Search, ChevronDown, MessageCircle, Mail, Phone, ExternalLink, FileText, Shield, Lightbulb, Briefcase, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I apply for a job?",
      answer: "Navigate to the 'Job Profiles' section from the sidebar. Browse through available roles, and once you find a position that matches your profile, simply click the 'Apply Now' button. You can track your application status in the Dashboard.",
      category: "Applications",
      icon: Briefcase
    },
    {
      question: "Can I edit my resume once submitted?",
      answer: "Yes, you can update your resume at any time through the 'Resume Builder' section. However, please note that for already submitted applications, companies will see the version of the resume that was active at the time of application.",
      category: "Resume",
      icon: FileText
    },
    {
      question: "How are AI Scores calculated?",
      answer: "Our AI engine analyzes your resume against the job description provided by the company. It evaluates skills, experience, and educational background to provide a compatibility score. This helps companies identify the best matches efficiently.",
      category: "Technology",
      icon: Lightbulb
    },
    {
      question: "What should I do if I miss an interview?",
      answer: "If you've missed a scheduled interview, we recommend contacting the company directly through their contact information provided in the 'Companies' section. You can also reach out to the placement cell for assistance.",
      category: "Interviews",
      icon: Clock
    },
    {
      question: "Is my profile visible to all companies?",
      answer: "By default, your profile is visible to all registered companies on the platform. You can manage your privacy settings in the 'Profile' section if you wish to restrict visibility to specific organizations.",
      category: "Privacy",
      icon: Shield
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) || 
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest"
        >
          <MessageCircle size={14} /> Support Center
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">How can we <span className="text-gradient">help you?</span></h1>
        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
          Search our knowledge base or explore categories below to find answers to common questions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
        <input
          type="text"
          placeholder="Search for questions, keywords, or topics..."
          className="w-full bg-white border border-slate-200 rounded-[2rem] py-6 pl-16 pr-8 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-lg shadow-xl shadow-slate-200/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={false}
            className={cn(
              "bg-white rounded-3xl border transition-all duration-300 overflow-hidden",
              openIndex === index ? "border-indigo-200 shadow-xl shadow-indigo-500/5" : "border-slate-100 shadow-sm hover:border-slate-200"
            )}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-8 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                  openIndex === index ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400"
                )}>
                  <faq.icon size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1 block">{faq.category}</span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{faq.question}</h3>
                </div>
              </div>
              <ChevronDown 
                size={24} 
                className={cn("text-slate-300 transition-transform duration-500", openIndex === index && "rotate-180 text-indigo-600")} 
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-8 pb-8 pt-2 pl-[6.5rem]">
                    <div className="h-px bg-slate-50 mb-6"></div>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                    <button className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all">
                      Learn more in documentation <ExternalLink size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Contact Cards */}
      <div className="grid md:grid-cols-3 gap-6 pt-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center group hover:border-indigo-200 transition-all">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Mail size={28} />
          </div>
          <h4 className="text-xl font-black text-slate-900 mb-2">Email Us</h4>
          <p className="text-slate-500 font-semibold mb-4">Response within 24 hours</p>
          <a href="mailto:support@campuspro.com" className="text-indigo-600 font-black text-sm uppercase tracking-widest">Contact Support</a>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center group hover:border-indigo-200 transition-all">
          <div className="w-16 h-16 bg-violet-50 rounded-3xl flex items-center justify-center text-violet-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
            <MessageCircle size={28} />
          </div>
          <h4 className="text-xl font-black text-slate-900 mb-2">Live Chat</h4>
          <p className="text-slate-500 font-semibold mb-4">Available 9am - 6pm</p>
          <button className="text-violet-600 font-black text-sm uppercase tracking-widest">Start Chatting</button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center group hover:border-indigo-200 transition-all">
          <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Phone size={28} />
          </div>
          <h4 className="text-xl font-black text-slate-900 mb-2">Call Center</h4>
          <p className="text-slate-500 font-semibold mb-4">Mon-Fri toll-free</p>
          <a href="tel:+1800CAMPUS" className="text-blue-600 font-black text-sm uppercase tracking-widest">View Phone Nos</a>
        </div>
      </div>
    </div>
  );
}