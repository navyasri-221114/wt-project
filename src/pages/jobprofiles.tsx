import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Briefcase, IndianRupee, Star, Filter, ArrowUpRight, ShieldCheck, Clock, CheckCircle2, Building, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { api } from "../services/api";

export default function JobProfiles() {
  const [searchParams] = useSearchParams();
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    bio: '', experience: '', why_us: '', links: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeTab, setActiveTab] = useState("All Jobs");
  
  // Search Autocomplete State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async (isPolling = false) => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.jobs.getAll(),
        api.applications.getMy().catch(() => []) 
      ]);
      setJobsData(jobsRes);
      setApplications(appsRes);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const handleApply = async (job: any) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    
    setSubmitting(true);
    try {
      await api.applications.apply((selectedJob._id || selectedJob.id) as any, formData);
      setShowApplyModal(false);
      setFormData({ bio: '', experience: '', why_us: '', links: '' });
      fetchData(true);
      alert("Application submitted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };


  const getAppStatus = (jobId: string) => {
    return applications.find(app => (app.job_id?.id || app.job_id?._id || app.job_id) === jobId || app.job_id === jobId);
  };

  const filteredJobs = jobsData.filter((job) => {
    if (activeTab === "Saved") return false; // Mock saved filter logic
    return (
      ((job.title || "").toLowerCase().includes(search.toLowerCase()) || 
       (job.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
       (job.requirements || "").toLowerCase().includes(search.toLowerCase())) &&
      (job.location || "Remote").toLowerCase().includes(locationFilter.toLowerCase())
    );
  });

  // Group filtered jobs by company for the main view
  const jobsByCompany = filteredJobs.reduce((acc: Record<string, any[]>, job: any) => {
    const company = job.company_name || 'Unknown Company';
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(job);
    return acc;
  }, {});

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-[3px] border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">Loading Opportunities...</p>
    </div>
  );

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 max-w-[1400px] mx-auto"
    >
      {/* ─── Page Header ─── */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            Company <span className="text-gradient">Openings</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 max-w-md">
            Live vacancies sorted by company. See exactly who's hiring right now.
          </p>
        </div>
        <div className="flex p-1 bg-slate-200/50 backdrop-blur-md rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] w-fit border border-slate-200/50">
          {["All Jobs", "Recommended", "Saved"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300",
                activeTab === tab 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Search + Filters ─── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        <div className="md:col-span-2 relative group focus-within:z-50" ref={searchContainerRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search roles or companies (e.g. Developer, TCS)..."
            className={cn(
              "w-full bg-white/90 backdrop-blur-sm border border-slate-200/80 py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium shadow-sm hover:bg-white",
              isSearchFocused && search.trim() !== "" && filteredJobs.length > 0 ? "rounded-t-2xl rounded-b-none border-b-0" : "rounded-2xl"
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />

          {/* ─── Live Search Autocomplete Dropdown ─── */}
          <AnimatePresence>
            {isSearchFocused && search.trim() !== "" && filteredJobs.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
                className="absolute top-full left-0 right-0 bg-white border border-t-0 border-indigo-500/50 outline outline-4 outline-indigo-500/10 rounded-b-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto custom-scrollbar"
              >
                <div className="px-3 py-2 bg-indigo-50/50 border-b border-indigo-100/50 flex items-center justify-between sticky top-0 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Live Matches
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{filteredJobs.length} Found</span>
                </div>
                <div className="divide-y divide-slate-100/80">
                  {filteredJobs.slice(0, 10).map(job => (
                    <button 
                      key={job._id || job.id}
                      onClick={() => {
                        setSearch(job.title);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{job.title}</p>
                        <p className="text-xs font-semibold text-indigo-600 mt-0.5">{job.company_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-black uppercase tracking-wider border border-green-100/50">
                          {job.vacancies || 1} Openings
                        </span>
                      </div>
                    </button>
                  ))}
                  {filteredJobs.length > 10 && (
                    <div className="px-4 py-3 text-center text-xs font-semibold text-slate-500 bg-slate-50">
                      + {filteredJobs.length - 10} more matches. Keep typing to narrow down.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative group focus-within:z-10">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Location..."
            className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium shadow-sm hover:bg-white"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover:shadow active:scale-[0.98]">
          <Filter size={20} />
          Filters
        </button>
      </motion.div>

      {/* ─── Grouped Job Cards Grid ─── */}
      <motion.div variants={container} className="space-y-12 pb-16">
        <AnimatePresence>
          {Object.keys(jobsByCompany).length > 0 ? (
            (Object.entries(jobsByCompany) as [string, any[]][]).map(([company, jobs]) => {
              const totalVacancies = jobs.reduce((sum: number, job: any) => sum + (job.vacancies || 1), 0);
              
              return (
                <motion.div 
                  layout
                  key={company}
                  variants={item}
                  className="space-y-6"
                >
                  {/* Company Header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-200/60 pb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200/50">
                        {company[0]}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
                          {company}
                          <ShieldCheck size={20} className="text-emerald-500" />
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {jobs.length} Active Role{jobs.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-sm font-black text-emerald-700">
                        {totalVacancies} LIVE VACANC{totalVacancies !== 1 ? 'IES' : 'Y'}
                      </span>
                    </div>
                  </div>

                  {/* Company's Jobs Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {(jobs as any[]).map((job: any) => {
                      const jobId = job._id || job.id;
                      const app = getAppStatus(jobId);
                      return (
                        <motion.div
                          layout
                          key={jobId}
                          whileHover={{ y: -5 }}
                          className="card-premium p-7 flex flex-col justify-between relative group bg-white border-slate-200/80 shadow-sm"
                        >
                          {/* Status Badges */}
                          <div className="absolute top-4 right-4 flex gap-2">
                            {job.vacancies > 5 && (
                              <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border border-amber-100">
                                <Star size={10} fill="currentColor" /> High Demand
                              </div>
                            )}
                          </div>

                          <div>
                            {/* Job Title */}
                            <div className="mb-5 pr-8">
                              <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {job.title}
                              </h3>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-y-4 mb-6 py-4 border-y border-slate-100/80">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                  <MapPin size={11} /> Location
                                </div>
                                <p className="text-sm font-bold text-slate-800 truncate">{job.location || "Remote"}</p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                  <Briefcase size={11} /> Openings
                                </div>
                                <p className="text-sm font-bold text-slate-800 flex items-center gap-1 text-emerald-600">
                                  {job.vacancies || 1} Seats
                                </p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                  <IndianRupee size={11} /> Package
                                </div>
                                <p className="text-sm font-bold text-slate-800">{job.salary || "N/A"}</p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                  <Clock size={11} /> Deadline
                                </div>
                                <p className="text-sm font-bold text-slate-800 text-orange-600">4 Days Left</p>
                              </div>
                            </div>
                            
                            {/* Skills tags */}
                            <div className="flex flex-wrap gap-2 mb-8">
                              {job.requirements?.split(',').slice(0,3).map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="text-[10px] font-bold bg-slate-100/50 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200/50 group-hover:bg-indigo-50/50 group-hover:border-indigo-100/50 group-hover:text-indigo-700 transition-colors truncate max-w-[100px]"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                              {job.min_cgpa && (
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-lg border border-indigo-100 truncate max-w-[100px]">
                                  {job.min_cgpa}+ CGPA
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 mt-auto">
                            {app ? (
                              <div className={cn(
                                "flex-1 px-4 py-2.5 font-bold rounded-xl flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider border",
                                app.status === 'shortlisted' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                app.status === 'rejected' ? "bg-red-50 text-red-700 border-red-100" :
                                "bg-indigo-50 text-indigo-700 border-indigo-100"
                              )}>
                                {app.status === 'shortlisted' && <CheckCircle2 size={14} />}
                                {app.status}
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleApply(job)}
                                className="flex-1 btn-gradient py-2.5 text-sm flex items-center justify-center gap-2 group/btn"
                              >
                                Apply Now <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                              </button>
                            )}
                            <button className="px-3.5 border border-slate-200/80 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-amber-500 hover:border-amber-200 transition-all">
                              <Star size={18} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="col-span-full py-20 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/50">
                <Search size={28} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">No opportunities found</h3>
              <p className="text-slate-500 mt-1 text-sm font-medium">Try adjusting your search or filters to see more results.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowApplyModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden no-scrollbar"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="relative mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Job <span className="text-gradient">Application</span></h2>
                  <p className="text-slate-500 font-medium">{selectedJob?.title} at {selectedJob?.company_name}</p>
                </div>
                <button onClick={() => setShowApplyModal(false)} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="relative space-y-6 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Professional Introduction</label>
                  <textarea
                    required value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Briefly introduce yourself..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Relevant Experience & Skills</label>
                  <textarea
                    required value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    placeholder="List your key skills..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Motivation</label>
                  <textarea
                    required value={formData.why_us}
                    onChange={(e) => setFormData({...formData, why_us: e.target.value})}
                    placeholder="Why this company?"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Links</label>
                  <input
                    type="text" value={formData.links}
                    onChange={(e) => setFormData({...formData, links: e.target.value})}
                    placeholder="Portfolio/GitHub/LinkedIn"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" disabled={submitting}
                    className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Application"} <Send size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}