import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Briefcase, ChevronRight, Star, Check, X, 
  Video, Clock, Sparkles, Filter, Search, MoreHorizontal,
  Mail, Phone, FileText, LayoutDashboard, Send, Target,
  Zap, ShieldCheck, BarChart3, TrendingUp, UserCheck, Calendar, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    min_cgpa: 6.0,
    vacancies: 1
  });

  useEffect(() => {
    fetchJobs();
    fetchInterviews();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.jobs.getMy();
      setJobs(res);
      if (res.length > 0 && !selectedJob) {
        handleSelectJob(res[0]);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await api.interviews.getMy();
      setInterviews(res);
    } catch (err) {
      console.error("Error fetching interviews:", err);
    }
  };

  const handleSelectJob = async (job: any) => {
    setSelectedJob(job);
    try {
      const res = await api.applications.getByJob(job.id);
      setApplicants(res);
    } catch (err) {
       console.error("Error fetching applicants:", err);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.jobs.create(newJob);
      setShowPostModal(false);
      setNewJob({ title: '', description: '', requirements: '', salary: '', location: '', min_cgpa: 6.0, vacancies: 1 });
      fetchJobs();
    } catch (err) {
      alert("Failed to post job");
    }
  };

  const handleUpdateStatus = async (appId: number, status: string) => {
    try {
      await api.applications.updateStatus(appId, status);
      if (selectedJob) handleSelectJob(selectedJob);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleScheduleInterview = async (applicationId: number) => {
    const date = prompt("Enter interview date (YYYY-MM-DD HH:MM):", "2026-03-15 10:00");
    if (!date) return;
    try {
      await api.interviews.schedule({ application_id: applicationId, scheduled_at: date });
      alert('Interview scheduled successfully');
      fetchInterviews();
      if (selectedJob) handleSelectJob(selectedJob);
    } catch (err) {
      alert('Failed to schedule interview');
    }
  };

  const handleAIShortlist = async () => {
    if (!applicants.length) return;
    const count = prompt("How many top candidates to shortlist?", "3");
    if (!count) return;
    
    const topCandidates = [...applicants]
      .sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0))
      .slice(0, parseInt(count));

    if (confirm(`Shortlist top ${topCandidates.length} candidates based on AI matching scores?`)) {
      try {
        await Promise.all(topCandidates.map(c => api.applications.updateStatus(c.id, 'shortlisted')));
        alert('AI Engine has successfully shortlisted the top talent.');
        if (selectedJob) handleSelectJob(selectedJob);
      } catch (err) {
        alert('Failed to shortlist candidates');
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Talent <span className="text-gradient">Command Center</span></h1>
          <p className="text-slate-500 font-medium mt-1">Acquire and manage top-tier talent for your organization.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
          <button 
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transition-transform active:scale-95"
          >
            <Plus size={18} /> New Posting
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Active Postings" value={jobs.length} color="indigo" icon={Briefcase} trend="+2 from last week" />
        <StatCard label="Total Applicants" value={jobs.reduce((acc, j) => acc + (j.application_count || 0), 0)} color="violet" icon={Users} trend="40% avg. match" />
        <StatCard label="Live Interviews" value={interviews.length} color="blue" icon={Video} trend="3 scheduled today" />
        <StatCard label="Conversion Rate" value="12%" color="green" icon={TrendingUp} trend="+4.5% efficiency" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left Side: Job Postings Control */}
        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Postings Repository</h2>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-indigo-600"><Filter size={18} /></button>
              <button className="p-2 text-slate-400 hover:text-indigo-600"><Search size={18} /></button>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {jobs.map((job) => (
              <motion.button
                layout
                key={job.id}
                onClick={() => handleSelectJob(job)}
                className={cn(
                  "w-full p-6 text-left rounded-[2rem] border transition-all relative overflow-hidden group",
                  selectedJob?.id === job.id 
                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-indigo-500/10" 
                    : "bg-white border-slate-100 hover:border-indigo-100 shadow-sm"
                )}
              >
                {selectedJob?.id === job.id && (
                  <motion.div layoutId="job-glow" className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl -mr-16 -mt-16" />
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors",
                    selectedJob?.id === job.id ? "bg-white/10 text-white" : "bg-indigo-50 text-indigo-600"
                  )}>
                    <Briefcase size={24} />
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
                    selectedJob?.id === job.id ? "bg-white/10 text-indigo-300" : "bg-green-50 text-green-600"
                  )}>
                    {job.vacancies} Left
                  </div>
                </div>
                
                <h3 className="text-xl font-black mb-1 truncate leading-tight">{job.title}</h3>
                <div className="flex items-center gap-4 text-xs font-bold opacity-60">
                   <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-400" /> {job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1 underline decoration-indigo-500/50">{job.application_count || 0} Applicants</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right Side: Applicant & Insight Management */}
        <div className="xl:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Insights HUD */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8">
                     <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-indigo-100" onClick={handleAIShortlist}>
                       <Sparkles size={14} /> AI Shortlist
                     </button>
                   </div>
                   
                   <h2 className="text-3xl font-black text-slate-900 mb-6">{selectedJob.title}</h2>
                   
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sourced</p>
                       <p className="text-2xl font-black text-slate-900">{applicants.length}</p>
                     </div>
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. AI Score</p>
                       <p className="text-2xl font-black text-indigo-600">78%</p>
                     </div>
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirements</p>
                       <p className="text-xs font-bold text-slate-500">{selectedJob.requirements}</p>
                     </div>
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                       <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-lg uppercase">Active</span>
                     </div>
                   </div>
                </div>

                {/* Applicants List */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <Users size={24} className="text-indigo-600" />
                      Applicant Pipeline
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {applicants.length > 0 ? (
                      applicants.map((app) => (
                        <motion.div
                          key={app.id}
                          layout
                          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col md:flex-row items-start md:items-center gap-8 group"
                        >
                          <div className="flex flex-1 items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border-4 border-slate-50 shadow-2xl shadow-indigo-100">
                              {app.student_name ? app.student_name[0] : 'U'}
                            </div>
                            <div>
                               <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{app.student_name}</h4>
                               <div className="flex gap-4 text-xs font-bold text-slate-500">
                                  <span className="flex items-center gap-1.5"><Mail size={12} className="text-indigo-400" /> {app.student_email || 'N/A'}</span>
                                  <span className="flex items-center gap-1.5"><Check size={12} className="text-green-500" /> CGPA: {app.student_cgpa || '8.5'}</span>
                               </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-10 w-full md:w-auto">
                             <div className="text-center">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">AI Harmony</div>
                                <div className={cn(
                                  "text-2xl font-black",
                                  app.ai_score >= 80 ? "text-green-500" : app.ai_score >= 50 ? "text-indigo-500" : "text-amber-500"
                                )}>
                                  {app.ai_score || 0}%
                                </div>
                             </div>
                             
                             <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
                             
                             <div className="flex items-center gap-3">
                                {app.status === 'applied' ? (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                                      className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100 hover:bg-green-600 hover:text-white transition-all shadow-lg shadow-green-100"
                                    >
                                      <Check size={20} />
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                      className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-100"
                                    >
                                      <X size={20} />
                                    </button>
                                  </>
                                ) : app.status === 'shortlisted' ? (
                                  <button 
                                    onClick={() => handleScheduleInterview(app.id)}
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                  >
                                    <Video size={16} /> Schedule Session
                                  </button>
                                ) : (
                                  <span className="px-6 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {app.status}
                                  </span>
                                )}
                             </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <Users size={64} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-xl font-black text-slate-400">No applicants yet</h3>
                        <p className="text-sm text-slate-400 mt-1">Talent will appear here once applications start rolling in.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 min-h-[600px]">
                <LayoutDashboard size={80} className="opacity-10 mb-8" />
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Post & Manage Talent</h3>
                <p className="text-slate-500 mt-2 font-medium max-w-sm text-center">Select a posting from the repository to view deep insights and manage your hiring pipeline.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Posting Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPostModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              layoutId="modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="relative mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">New <span className="text-gradient">Opportunity</span></h2>
                  <p className="text-slate-500 font-medium">Define your next great hire.</p>
                </div>
                <button 
                  onClick={() => setShowPostModal(false)}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePostJob} className="relative grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <InputGroup label="Job Title" name="title" value={newJob.title} onChange={(e: any) => setNewJob({...newJob, title: e.target.value})} icon={Briefcase} placeholder="e.g. Lead Product Architect" />
                </div>
                <div className="col-span-2">
                  <TextAreaGroup label="Detailed Description" name="description" value={newJob.description} onChange={(e: any) => setNewJob({...newJob, description: e.target.value})} icon={FileText} placeholder="Describe the mission and daily impact..." rows={4} />
                </div>
                <InputGroup label="Expertise Required" name="requirements" value={newJob.requirements} onChange={(e: any) => setNewJob({...newJob, requirements: e.target.value})} icon={Sparkles} placeholder="React, Node.js, AI..." />
                <InputGroup label="Budget / Salary" name="salary" value={newJob.salary} onChange={(e: any) => setNewJob({...newJob, salary: e.target.value})} icon={Target} placeholder="e.g. ₹18L - ₹24L PA" />
                <InputGroup label="Preferred HQ" name="location" value={newJob.location} onChange={(e: any) => setNewJob({...newJob, location: e.target.value})} icon={MapPin} placeholder="Global / Bengaluru..." />
                <InputGroup label="Min. CGPA" name="min_cgpa" type="number" value={newJob.min_cgpa} onChange={(e: any) => setNewJob({...newJob, min_cgpa: parseFloat(e.target.value)})} icon={ShieldCheck} placeholder="e.g. 7.5" />
                
                <div className="col-span-2 pt-6">
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                    Launch Posting <Send size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, trend }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600"
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", colors[color])}>
        <Icon size={28} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-900 mb-2">{value}</p>
      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
        <Sparkles size={12} className="text-indigo-400" /> {trend}
      </div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, icon: Icon, type = "text", placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
        />
      </div>
    </div>
  );
}

function TextAreaGroup({ label, name, value, onChange, icon: Icon, rows = 3, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 resize-none"
        />
      </div>
    </div>
  );
}
