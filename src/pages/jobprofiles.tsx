import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, IndianRupee, Star, Filter, ArrowUpRight, ShieldCheck, Clock, Building2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { api } from "../services/api";

export default function JobProfiles() {
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeTab, setActiveTab] = useState("All Jobs");

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => clearInterval(interval);
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

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      await api.applications.apply(jobId as any);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Something went wrong while applying");
    } finally {
      setApplying(null);
    }
  };

  const getAppStatus = (jobId: string) => {
    return applications.find(app => (app.job_id?.id || app.job_id?._id || app.job_id) === jobId || app.job_id === jobId);
  };

  const filteredJobs = jobsData.filter((job) =>
    (job.title.toLowerCase().includes(search.toLowerCase()) || 
     (job.company_name || "").toLowerCase().includes(search.toLowerCase())) &&
    (job.location || "Remote").toLowerCase().includes(locationFilter.toLowerCase())
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Loading Jobs...</p>
    </div>
  );

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
        <AnimatePresence>
          {filteredJobs.length > 0 ? filteredJobs.map((job) => {
            const jobId = job._id || job.id;
            const app = getAppStatus(jobId);
            return (
              <motion.div
                layout
                key={jobId}
                variants={item}
                whileHover={{ y: -5 }}
                className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Trending Badge Simulation based on vacancies check */}
                {job.vacancies > 5 && (
                  <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Trending
                  </div>
                )}

                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white shadow-xl shadow-indigo-100 transition-all">
                       {job.company_name ? job.company_name[0] : 'C'}
                    </div>
                    <div className="flex-1 min-w-0 pr-10">
                      <h3 className="text-xl font-black text-slate-900 leading-tight truncate">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-indigo-600 font-bold text-sm tracking-tight">{job.company_name}</span>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <ShieldCheck size={14} className="text-green-500" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                      <MapPin size={16} className="text-indigo-400" />
                      {job.location || "Remote"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                      <Briefcase size={16} className="text-indigo-400" />
                      {job.vacancies || 1} Seats
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                      <IndianRupee size={16} className="text-indigo-400" />
                      {job.salary || "Not specified"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                      <Clock size={16} className="text-indigo-400" />
                      Closing Soon
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {job.requirements?.split(',').slice(0,3).map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="text-[11px] font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors truncate max-w-[100px]"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                    {job.min_cgpa && (
                       <span className="text-[11px] font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-100 truncate max-w-[100px]">
                         {job.min_cgpa}+ CGPA
                       </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  {app ? (
                    <div className={cn(
                       "flex-1 px-6 py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest",
                       app.status === 'shortlisted' ? "bg-green-50 text-green-700 border border-green-100" :
                       app.status === 'rejected' ? "bg-red-50 text-red-700 border border-red-100" :
                       "bg-slate-100 text-slate-500 border border-slate-200"
                    )}>
                      {app.status === 'shortlisted' && <CheckCircle2 size={18} />}
                      {app.status}
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleApply(jobId)}
                      disabled={applying === jobId}
                      className="flex-1 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                    >
                      {applying === jobId ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>Apply Now <ArrowUpRight size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" /></>
                      )}
                    </button>
                  )}
                  <button className="px-4 py-3.5 border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                    <Star size={20} />
                  </button>
                </div>
              </motion.div>
            )
          }) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No jobs found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters to find more opportunities.</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}