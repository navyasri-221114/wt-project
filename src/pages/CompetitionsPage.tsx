import { useState } from "react";
import { Trophy, Calendar, Users, ArrowRight, Zap, Star, Target, Code } from "lucide-react";
import { motion } from "framer-motion"; // Corrected import for framer-motion
import { cn } from "../lib/utils";

export default function CompetitionsPage() {
  const [competitions] = useState([
    {
      id: 1,
      name: "Smart India Hackathon 2026",
      organizer: "Govt. of India",
      date: "June 15-20, 2026",
      participants: "50,000+",
      prize: "₹1,00,000",
      category: "Hackathon",
      difficulty: "Hard",
      tags: ["Innovation", "Problem Solving"]
    },
    {
      id: 2,
      name: "Google Kickstart Round G",
      organizer: "Google",
      date: "July 12, 2026",
      participants: "100,000+",
      prize: "Swags & Interviews",
      category: "Coding",
      difficulty: "Extreme",
      tags: ["Data Structures", "Algorithms"]
    },
    {
      id: 3,
      name: "TCS CodeVita Season 13",
      organizer: "TCS",
      date: "August 5, 2026",
      participants: "200,000+",
      prize: "Job Offers",
      category: "Coding",
      difficulty: "Medium",
      tags: ["Competitive Programming"]
    },
    {
      id: 4,
      name: "AWS GameDay 2026",
      organizer: "Amazon",
      date: "September 10, 2026",
      participants: "10,000+",
      prize: "AWS Credits",
      category: "Cloud",
      difficulty: "Advanced",
      tags: ["Cloud Architecture", "DevOps"]
    }
  ]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tech <span className="text-gradient">Arenas</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl">
            Test your skills against the best. Win prizes, earn badges, and get fast-tracked for interviews at top companies.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Now</p>
            <p className="text-xl font-black text-indigo-600">12</p>
          </div>
          <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Your Rank</p>
            <p className="text-xl font-black text-violet-600">#42</p>
          </div>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 gap-8"
      >
        {competitions.map((comp) => (
          <motion.div
            key={comp.id}
            variants={item}
            whileHover={{ y: -8 }}
            className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all p-10 overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -z-10 group-hover:bg-indigo-600 group-hover:w-full group-hover:h-full group-hover:rounded-none transition-all duration-500 opacity-20 group-hover:opacity-5"></div>

            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                  {comp.category === 'Coding' ? <Code className="text-indigo-600" size={32} /> : 
                   comp.category === 'Hackathon' ? <Zap className="text-orange-500" size={32} /> :
                   <Target className="text-blue-500" size={32} />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{comp.organizer}</p>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                    {comp.name}
                  </h3>
                </div>
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                comp.difficulty === 'Extreme' ? "bg-red-100 text-red-600" :
                comp.difficulty === 'Hard' ? "bg-orange-100 text-orange-600" :
                comp.difficulty === 'Advanced' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
              )}>
                {comp.difficulty}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 mb-10">
              <div className="flex items-center gap-3">
                <Calendar className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Timeline</p>
                  <p className="font-bold text-slate-700">{comp.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Engaged</p>
                  <p className="font-bold text-slate-700">{comp.participants}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Grand Prize</p>
                  <p className="font-black text-indigo-600">{comp.prize}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Focus</p>
                  <p className="font-bold text-slate-700 truncate">{comp.tags[0]}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group/btn">
                Register Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-5 py-4 border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                <Star size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}