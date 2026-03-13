import { useState } from "react";
import { Search, MapPin, Briefcase, IndianRupee, Star, Filter, ArrowUpRight, ShieldCheck, Clock, Building2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export default function JobProfiles() {
  const jobsData = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Google",
      location: "Bangalore",
      type: "Full Time",
      salary: "18-25 LPA",
      posted: "2 days ago",
      skills: ["React", "TypeScript", "Tailwind"],
      trending: true
    },
    {
      id: 2,
      title: "Backend Developer",
      company: "Amazon",
      location: "Hyderabad",
      type: "Full Time",
      salary: "20-30 LPA",
      posted: "5 days ago",
      skills: ["Node.js", "AWS", "PostgreSQL"],
      trending: false
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "Microsoft",
      location: "Remote",
      type: "Remote",
      salary: "22-35 LPA",
      posted: "1 day ago",
      skills: ["React", "Node.js", "Azure"],
      trending: true
    },
    {
      id: 4,
      title: "UI/UX Designer",
      company: "Adobe",
      location: "Bangalore",
      type: "Hybrid",
      salary: "15-22 LPA",
      posted: "1 week ago",
      skills: ["Figma", "Design Systems", "Prototyping"],
      trending: false
    },
    {
      id: 5,
      title: "Software Engineer",
      company: "Meta",
      location: "Bangalore",
      type: "Full Time",
      salary: "25-40 LPA",
      posted: "3 days ago",
      skills: ["C++", "Systems Design", "Python"],
      trending: true
    },
    {
      id: 6,
      title: "Data Analyst",
      company: "Netflix",
      location: "Remote",
      type: "Remote",
      salary: "18-28 LPA",
      posted: "4 days ago",
      skills: ["Python", "SQL", "Tableau"],
      trending: false
    }
  ];

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeTab, setActiveTab] = useState("All Jobs");

  const filteredJobs = jobsData.filter((job) =>
    (job.title.toLowerCase().includes(search.toLowerCase()) || 
     job.company.toLowerCase().includes(search.toLowerCase())) &&
    job.location.toLowerCase().includes(locationFilter.toLowerCase())
  );

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Discover <span className="text-gradient">Opportunities</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-md">
            Find the perfect role that matches your skills. We've curated the best openings from top-tier companies.
          </p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit">
          {["All Jobs", "Recommended", "Saved"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === tab ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search job title, company, or keywords..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative group">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Location..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all">
          <Filter size={20} />
          More Filters
        </button>
      </div>

      {/* Job Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredJobs.length > 0 ? filteredJobs.map((job) => (
          <motion.div
            key={job.id}
            variants={item}
            whileHover={{ y: -5 }}
            className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden group"
          >
            {job.trending && (
              <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Star size={10} fill="currentColor" /> Trending
              </div>
            )}

            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                <Building2 className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-slate-900 leading-tight truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-indigo-600 font-bold text-sm">{job.company}</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <ShieldCheck size={14} className="text-green-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 mb-8">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <MapPin size={16} className="text-indigo-400" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <Briefcase size={16} className="text-indigo-400" />
                {job.type}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <IndianRupee size={16} className="text-indigo-400" />
                {job.salary}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <Clock size={16} className="text-indigo-400" />
                {job.posted}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-[11px] font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex gap-4">
              <button className="flex-1 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group/btn">
                Apply Now
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button className="px-4 py-3.5 border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                <Star size={20} />
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No jobs found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your filters to find more opportunities.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}