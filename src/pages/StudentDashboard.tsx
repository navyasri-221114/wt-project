import React, { useState, useEffect } from 'react';
import {
  Briefcase, MapPin, IndianRupee, Clock, CheckCircle2,
  AlertCircle, Video, Users, Sparkles, Target, TrendingUp,
  ChevronRight, ArrowUpRight, Search, Filter, Send, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    why_us: '',
    links: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isPolling = false) => {
    try {
      const [jobsRes, appsRes, interviewsRes] = await Promise.all([
        api.jobs.getAll(),
        api.applications.getMy(),
        api.interviews.getMy()
      ]);
      setJobs(jobsRes);
      setApplications(appsRes);
      setInterviews(interviewsRes);
    } catch (err) {
      console.error(err);
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
      fetchData();
      alert("Application submitted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const getAppStatus = (jobId: string) => {
    return applications.find(app => (app.job_id?._id || app.job_id?.id || app.job_id) === jobId || app.job_id === jobId);
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.location && j.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Constructing Dashboard...</p>
    </div>
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
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your <span className="text-gradient">Career Radar</span></h1>
          <p className="text-slate-500 font-medium mt-1">Discover opportunities personalized for your growth.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
          <Link to="/jobs" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all">
            Explore All Positions <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Live Applications" value={applications.length} color="indigo" icon={Target} trend="3 active processes" />
        <StatCard label="Interviews" value={interviews.filter(i => i.status === 'scheduled').length} color="violet" icon={Video} trend="Next session: Tomorrow" />
        <StatCard label="Shortlisted" value={applications.filter(a => a.status === 'shortlisted').length} color="green" icon={CheckCircle2} trend="+1 in last 24h" />
        <StatCard label="AI Readiness" value="84%" color="amber" icon={Sparkles} trend="Top 15% of candidates" />
      </div>

      {/* Primary Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

        {/* Left Aspect: Recommended Experiences */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Sparkles size={24} className="text-indigo-600" />
              Tailored Openings
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search openings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 text-sm w-64"
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Filter size={20} /></button>
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {filteredJobs.map((job) => {
                const jobId = job._id || job.id;
                const app = getAppStatus(jobId);
                return (
                  <motion.div
                    layout
                    key={jobId}
                    variants={item}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border-4 border-slate-50 shadow-2xl shadow-indigo-100 overflow-hidden">
                          {job.company_name ? job.company_name[0] : 'J'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-indigo-600 font-bold text-sm tracking-tight">{job.company_name}</p>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <p className="text-slate-400 text-xs font-bold">{job.location || 'Remote'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto">
                        {app ? (
                          <div className={cn(
                            "px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest text-center border",
                            app.status === 'shortlisted' ? "bg-green-50 text-green-700 border-green-100" :
                              app.status === 'rejected' ? "bg-red-50 text-red-700 border-red-100" :
                                "bg-indigo-50 text-indigo-700 border-indigo-100"
                          )}>
                            {app.status}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(job)}
                            className="w-full md:w-auto px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            Quick Apply <ChevronRight size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-slate-50">
                      <Metric icon={IndianRupee} label="Expected Package" value={job.salary} />
                      <Metric icon={AlertCircle} label="Eligibility" value={`${job.min_cgpa}+ CGPA`} />
                      <Metric icon={Users} label="Total Capacity" value={`${job.vacancies || 1} Seats`} />
                      <Metric icon={Clock} label="Closing Date" value="4 Days Left" />
                    </div>

                    <div className="mt-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{job.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Aspect: Operational Intelligence */}
        <div className="xl:col-span-4 space-y-10">
          {/* Upcoming Sessions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Live Engagements</h2>
              {interviews.length > 0 && <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />}
            </div>

            <div className="space-y-4">
              {interviews.filter(i => i.status === 'scheduled').length > 0 ? (
                interviews.filter(i => i.status === 'scheduled').map((interview) => (
                  <motion.div
                    key={interview.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="relative space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                          <Video size={24} className="text-indigo-400" />
                        </div>
                        <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">Virtual</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-black mb-1">{interview.title}</h3>
                        <p className="text-indigo-400 font-bold text-sm">{interview.company_name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-white/50 text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                        <Clock size={14} />
                        {new Date(interview.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      <Link
                        to={`/interview/${interview.room_id}`}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl"
                      >
                        Enter Room <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center">
                  <Video size={40} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Active Sessions</p>
                </div>
              )}
            </div>
          </section>

          {/* Activity Log */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Activity Stream</h2>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {applications.length === 0 ? (
                <div className="p-12 text-center text-slate-300 italic font-medium">No movement yet.</div>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-6 hover:bg-slate-50 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-tight">{app.title}</h4>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                        {new Date(app.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 mb-4">{app.company_name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          app.status === 'shortlisted' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                            app.status === 'rejected' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                              "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        )} />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{app.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

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
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden text-left"
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
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Briefly introduce yourself..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Relevant Experience & Skills</label>
                  <textarea
                    required value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="List your key skills..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Motivation</label>
                  <textarea
                    required value={formData.why_us}
                    onChange={(e) => setFormData({ ...formData, why_us: e.target.value })}
                    placeholder="Why this company?"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Links</label>
                  <input
                    type="text" value={formData.links}
                    onChange={(e) => setFormData({ ...formData, links: e.target.value })}
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

function StatCard({ label, value, color, icon: Icon, trend }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600"
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all hover:border-indigo-100"
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg shadow-indigo-100/10", colors[color])}>
        <Icon size={28} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-900 mb-2">{value}</p>
      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
        <TrendingUp size={12} className="text-indigo-400" /> {trend}
      </div>
    </motion.div>
  );
}

function Metric({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <Icon size={12} />
        {label}
      </div>
      <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}
