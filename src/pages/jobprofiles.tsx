import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Briefcase, IndianRupee, Star, Filter, ArrowUpRight, ShieldCheck, Clock, CheckCircle2, Building, X, Send, Globe, Zap, ExternalLink, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { api } from "../services/api";

export default function JobProfiles() {
  const [searchParams] = useSearchParams();
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [externalJobs, setExternalJobs] = useState<any[]>([]);
  const [externalLoading, setExternalLoading] = useState(true);
  const [externalFilter, setExternalFilter] = useState({ company: '', location: '' });
  const [applications, setApplications] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    bio: '', experience: '', why_us: '', links: '', resume: ''
  });
  const [submitting, setSubmitting] = useState(false);


  const [search, setSearch] = useState(searchParams.get("q") || "");
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
    fetchExternalJobs();
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
      const [jobsRes, appsRes, profileRes] = await Promise.all([
        api.jobs.getAll(),
        api.applications.getMy().catch(() => []),
        api.profile.get().catch(() => null)
      ]);
      setJobsData(jobsRes);
      setApplications(appsRes);
      setStudentProfile(profileRes);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const fetchExternalJobs = async (filters?: { company?: string; location?: string }) => {
    setExternalLoading(true);
    try {
      const res = await api.jobs.getExternal({ ...filters, limit: 20 });
      setExternalJobs(res.jobs || []);
    } catch (err) {
      console.warn('External jobs unavailable:', err);
      setExternalJobs([]);
    } finally {
      setExternalLoading(false);
    }
  };

  const handleExternalFilter = () => {
    fetchExternalJobs({
      company: externalFilter.company || undefined,
      location: externalFilter.location || undefined,
    });
  };


  const handleToggleSave = async (jobId: string) => {
    try {
      const res = await api.profile.saveJob(jobId);
      setStudentProfile({ ...studentProfile, saved_jobs: res.saved_jobs });
    } catch (err: any) {
      alert(err.message || "Failed to save job");
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
      setFormData({ bio: '', experience: '', why_us: '', links: '', resume: '' });
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

  const isJobSaved = (jobId: string) => {
    return studentProfile?.saved_jobs?.some((id: string) => id === jobId) || false;
  };

  const filteredJobs = jobsData.filter((job) => {
    const jobId = job._id || job.id;
    const matchesSearch = ((job.title || "").toLowerCase().includes(search.toLowerCase()) || 
       (job.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
       (job.requirements || "").toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "Saved") {
      return isJobSaved(jobId);
    }

    if (activeTab === "Recommended") {
      const minCgpa = job.min_cgpa || 0;
      const myCgpa = studentProfile?.cgpa || 0;
      if (myCgpa < minCgpa) return false;
      
      const mySkillsStr = (studentProfile?.skills || "").toLowerCase();
      const jobSkills = (job.requirements || "").toLowerCase().split(',').map((s: string) => s.trim());
      
      // If student has at least one matching skill or both have generic/no skills
      if (jobSkills.length > 0 && jobSkills[0] !== "") {
          const hasMatchingSkill = jobSkills.some((skill: string) => mySkillsStr.includes(skill));
          return hasMatchingSkill;
      }
      return true; // if no specific skills required but CGPA matched
    }

    return true; // "All Jobs"
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
      <div className="w-10 h-10 border-[3px] border-sky-600/20 border-t-sky-600 rounded-full animate-spin"></div>
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
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Company <span className="text-gradient">Openings</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Live vacancies sorted by company. See who's hiring right now.
          </p>
        </div>
        <div className="flex p-1 bg-slate-200/50 backdrop-blur-md rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] w-full sm:w-fit border border-slate-200/50">
          {["All Jobs", "Recommended", "Saved"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300",
                activeTab === tab 
                  ? "bg-white text-sky-600 shadow-sm" 
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
        <div className="md:col-span-4 relative group focus-within:z-50" ref={searchContainerRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search roles or companies (e.g. Developer, TCS)..."
            className={cn(
              "w-full bg-white/90 backdrop-blur-sm border border-slate-200/80 py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all font-medium shadow-sm hover:bg-white",
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
                className="absolute top-full left-0 right-0 bg-white border border-t-0 border-sky-500/50 outline outline-4 outline-sky-500/10 rounded-b-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto custom-scrollbar"
              >
                <div className="px-3 py-2 bg-sky-50/50 border-b border-sky-100/50 flex items-center justify-between sticky top-0 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5">
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
                        <p className="text-xs font-semibold text-sky-600 mt-0.5">{job.company_name}</p>
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
      </motion.div>

      {/* ─── 🌐 Featured Jobs — All Openings (External API + Platform Registered) ─── */}
      <motion.div variants={item} className="space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-200/50">
              <Globe size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex flex-wrap items-center gap-2">
                🌐 All Job Openings
                <span className="px-2 py-0.5 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[10px] font-black uppercase tracking-widest">API + Platform</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Live openings from Google, Microsoft, Amazon, TCS, Infosys + registered companies</p>
            </div>
          </div>
          {/* Filters — scrollable on mobile */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto pb-1">
            <input
              type="text" placeholder="Company..."
              value={externalFilter.company}
              onChange={e => setExternalFilter(f => ({ ...f, company: e.target.value }))}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all w-28 sm:w-32 shrink-0"
            />
            <input
              type="text" placeholder="Location..."
              value={externalFilter.location}
              onChange={e => setExternalFilter(f => ({ ...f, location: e.target.value }))}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all w-28 sm:w-32 shrink-0"
            />
            <button onClick={handleExternalFilter} className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 shrink-0">
              <Filter size={13} /> Apply
            </button>
            <button onClick={() => { setExternalFilter({ company: '', location: '' }); fetchExternalJobs(); }} className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-sky-600 hover:border-sky-200 transition-all shrink-0" title="Reset">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {externalLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sky-50 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-2.5 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-2 bg-slate-100 rounded-full w-1/2" />
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full w-full" />
                <div className="h-2 bg-slate-100 rounded-full w-5/6" />
                <div className="h-9 bg-sky-50 rounded-xl w-full mt-2" />
              </div>
            ))}
          </div>
        ) : (() => {
          // Merge external API jobs + registered platform jobs for this section
          const platformJobs = jobsData.map((job: any) => ({
            id: job._id || job.id,
            title: job.title,
            company: job.company_name || 'Partner Company',
            location: job.location || 'India',
            salary: job.salary,
            description: job.description,
            applyLink: null, // internal apply
            source: 'platform' as const,
            jobRef: job, // keep full ref for internal apply
          }));

          // Apply company filter to platform jobs too
          const filteredPlatform = platformJobs.filter((j: any) => {
            if (externalFilter.company && !j.company.toLowerCase().includes(externalFilter.company.toLowerCase())) return false;
            if (externalFilter.location && !j.location.toLowerCase().includes(externalFilter.location.toLowerCase())) return false;
            return true;
          });

          const allJobs = [...externalJobs, ...filteredPlatform];

          return allJobs.length === 0 ? (
            <div className="py-12 text-center bg-sky-50/50 rounded-2xl border border-sky-100">
              <Globe size={32} className="text-sky-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold text-sm">No openings match your filters.</p>
              <button onClick={() => { setExternalFilter({ company: '', location: '' }); fetchExternalJobs(); }} className="mt-3 text-sky-600 font-bold text-sm hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {allJobs.map((job: any, i: number) => {
                  const isPlatform = job.source === 'platform';
                  const appStatus = isPlatform ? getAppStatus(job.id) : null;
                  return (
                    <motion.div
                      key={`${job.source}-${job.id}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                      whileHover={{ y: -3 }}
                      className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-sky-100/50 transition-all relative overflow-hidden"
                    >
                      {/* Decorative glow */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-sky-50 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-sky-100/70 transition-colors" />

                      {/* Source tag */}
                      <div className="absolute top-3 right-3">
                        {isPlatform ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={8} /> Platform
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Zap size={8} fill="currentColor" /> External
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        {/* Company Icon + Name */}
                        <div className="flex items-center gap-2.5 mb-3 pr-14">
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0",
                            isPlatform
                              ? "bg-gradient-to-br from-sky-600 to-sky-700 shadow-sky-200/50"
                              : "bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sky-200/50"
                          )}>
                            {(job.company || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-sky-600 truncate">{job.company}</p>
                            <h3 className="text-sm font-black text-slate-900 leading-tight line-clamp-2 group-hover:text-sky-700 transition-colors">{job.title}</h3>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <MapPin size={10} className="text-slate-400 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                              <IndianRupee size={10} className="shrink-0" />
                              <span className="truncate">{job.salary}</span>
                            </div>
                          )}
                          {job.description && (
                            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{job.description}</p>
                          )}
                        </div>

                        {/* Tags row */}
                        <div className="flex flex-wrap items-center gap-1 mb-3">
                          {isPlatform && job.jobRef?.requirements?.split(',').slice(0,2).map((s: string, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold border border-slate-100 truncate max-w-[80px]">{s.trim()}</span>
                          ))}
                          {!isPlatform && <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-bold border border-slate-100">Source: API</span>}
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-bold border border-amber-100 flex items-center gap-0.5"><Star size={7} fill="currentColor" /> Featured</span>
                        </div>
                      </div>

                      {/* CTA */}
                      {isPlatform ? (
                        appStatus ? (
                          <div className={cn(
                            "w-full px-3 py-2 font-bold rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider border",
                            appStatus.status === 'shortlisted' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            appStatus.status === 'rejected' ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-sky-50 text-sky-700 border-sky-100"
                          )}>
                            {appStatus.status === 'shortlisted' && <CheckCircle2 size={12} />} {appStatus.status}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(job.jobRef)}
                            className="w-full py-2 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider shadow-md shadow-sky-200 hover:from-sky-700 hover:to-sky-800 transition-all flex items-center justify-center gap-1.5"
                          >
                            Apply Now <ArrowUpRight size={13} />
                          </button>
                        )
                      ) : (
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider shadow-md shadow-sky-200 hover:from-sky-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-1.5"
                        >
                          Apply on Company Site <ExternalLink size={12} />
                        </a>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          );
        })()}
        <p className="text-[10px] text-slate-400 text-center font-medium">
          ⚡ External listings via Adzuna API, cached 45 min. Platform jobs apply directly through PlaceOn.
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div variants={item} className="flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200/80" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2"><ShieldCheck size={12} className="text-emerald-500" /> Campus Drives</span>
        <div className="flex-1 h-px bg-slate-200/80" />
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
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-sky-200/50">
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
                              <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors line-clamp-2">
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
                                  className="text-[10px] font-bold bg-slate-100/50 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200/50 group-hover:bg-sky-50/50 group-hover:border-sky-100/50 group-hover:text-sky-700 transition-colors truncate max-w-[100px]"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                              {job.min_cgpa && (
                                <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2.5 py-1.5 rounded-lg border border-sky-100 truncate max-w-[100px]">
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
                                "bg-sky-50 text-sky-700 border-sky-100"
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
                            <button 
                              onClick={() => handleToggleSave(jobId)} 
                              className={cn(
                                "px-3.5 border rounded-xl transition-all flex items-center justify-center",
                                isJobSaved(jobId) 
                                 ? "bg-amber-50 text-amber-500 border-amber-200" 
                                 : "border-slate-200/80 text-slate-400 hover:bg-slate-50 hover:text-amber-500 hover:border-amber-200"
                              )}>
                              <Star size={18} fill={isJobSaved(jobId) ? "currentColor" : "none"} />
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="relative mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Job <span className="text-gradient">Application</span></h2>
                  <p className="text-slate-500 font-medium">{selectedJob?.title} at {selectedJob?.company_name}</p>
                </div>
                <button onClick={() => setShowApplyModal(false)} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                  <X size={24} />
                </button>
              </div>

              {selectedJob?.description && (
                <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Job Description</h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                     {selectedJob.description}
                  </p>
                </div>
              )}

              <form onSubmit={handleApplySubmit} className="relative space-y-6 max-h-[50vh] overflow-y-auto pr-4 no-scrollbar">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Professional Introduction</label>
                  <textarea
                    required value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Briefly introduce yourself..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Relevant Experience & Skills</label>
                  <textarea
                    required value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    placeholder="List your key skills..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Motivation</label>
                  <textarea
                    required value={formData.why_us}
                    onChange={(e) => setFormData({...formData, why_us: e.target.value})}
                    placeholder="Why this company?"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Links</label>
                  <input
                    type="text" value={formData.links}
                    onChange={(e) => setFormData({...formData, links: e.target.value})}
                    placeholder="Portfolio/GitHub/LinkedIn"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Resume Link</label>
                  <input
                    type="text" required value={formData.resume}
                    onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                    placeholder="Google Drive, Dropbox, or Portfolio URL"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" disabled={submitting}
                    className="w-full py-5 bg-sky-600 text-white font-black rounded-3xl shadow-2xl shadow-sky-100 hover:bg-sky-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
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