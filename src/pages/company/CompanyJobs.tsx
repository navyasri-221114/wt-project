import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, MapPin, IndianRupee, Clock, Search, Filter, MoreHorizontal, Edit3, Trash2, Globe, Send, Sparkles, X } from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function CompanyJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [analysisJob, setAnalysisJob] = useState<any>(null);
  const [jobToDelete, setJobToDelete] = useState<any>(null);
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    salary: '',
    requirements: '',
    description: '',
    vacancies: 1,
    min_cgpa: 6.0
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.jobs.getMy();
      setJobs(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.jobs.create(newJob);
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      alert("Failed to post job");
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    try {
      await api.jobs.delete(jobToDelete.id);
      setJobToDelete(null);
      fetchJobs();
    } catch (err: any) {
      alert(err.message || "Failed to delete job");
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.location && j.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (j.requirements && j.requirements.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRemote = !onlyRemote || (j.location && j.location.toLowerCase().includes('remote'));
    
    return matchesSearch && matchesRemote;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Job <span className="text-gradient">Catalog</span></h1>
          <p className="text-slate-500 font-medium mt-1">Manage and monitor all your active opportunities.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-8 py-3.5 bg-sky-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95"
        >
          <Plus size={18} /> Add New Listing
        </button>
      </div>

      {/* Interface Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search your postings..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
          />
        </div>
        <button 
          onClick={() => setOnlyRemote(!onlyRemote)}
          className={cn(
            "px-6 py-4 rounded-[1.5rem] shadow-sm flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all border",
            onlyRemote 
              ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100" 
              : "bg-white border-slate-100 text-slate-500 hover:text-indigo-600"
          )}
        >
          <Filter size={18} /> {onlyRemote ? "Remote Only" : "All Locations"}
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
           <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing Catalog...</p>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6"
        >
          {filteredJobs.map((job) => (
            <motion.div 
              key={job.id} 
              variants={item}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-sky-100 transition-all flex flex-col lg:flex-row items-start lg:items-center gap-10 group"
            >
              <div className="w-16 h-16 rounded-3xl bg-sky-50 flex items-center justify-center text-sky-600 transition-transform group-hover:scale-110 shadow-lg shadow-sky-100/20">
                <Briefcase size={32} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-colors truncate leading-tight">{job.title}</h3>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[9px] font-black rounded-lg uppercase tracking-wider">Live</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-sky-400" /> {job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1.5"><IndianRupee size={14} className="text-sky-400" /> {job.salary}</span>
                  <span className="flex items-center gap-1.5"><Globe size={14} className="text-sky-400" /> Full Time</span>
                </div>
              </div>

              <div className="flex items-center gap-10 w-full lg:w-auto">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Applicant Cloud</p>
                    <p className="text-3xl font-black text-slate-900">{job.application_count || 0}</p>
                 </div>
                 <div className="h-10 w-px bg-slate-100 hidden lg:block" />
                 <div className="flex items-center gap-2">
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                       <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => setJobToDelete(job)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    >
                       <Trash2 size={18} />
                    </button>
                    <button 
                       onClick={() => setAnalysisJob(job)}
                       className="ml-2 px-6 py-3 bg-sky-50 text-sky-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-600 hover:text-white transition-all"
                    >
                       Analysis
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Analysis Modal */}
      <AnimatePresence>
        {analysisJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAnalysisJob(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
               
               <div className="relative mb-8 flex items-center justify-between">
                 <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Job <span className="text-gradient">Analysis</span></h2>
                   <p className="text-slate-500 font-medium">{analysisJob.title}</p>
                 </div>
                 <button onClick={() => setAnalysisJob(null)} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                   <X size={24} />
                 </button>
               </div>

               <div className="relative space-y-8 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Compensation</p>
                      <p className="text-xl font-black text-slate-900">{analysisJob.salary}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-xl font-black text-slate-900">{analysisJob.location || 'Remote'}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Applicants</p>
                      <p className="text-xl font-black text-slate-900 font-mono tracking-tighter">{analysisJob.application_count || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vacancies</p>
                      <p className="text-xl font-black text-slate-900 font-mono tracking-tighter">{analysisJob.vacancies}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-2">Tech Stack / Requirements</h4>
                      <p className="text-slate-700 font-bold bg-sky-50/30 p-5 rounded-2xl border border-sky-100/50">{analysisJob.requirements}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-2">Full Description</h4>
                      <p className="text-slate-600 font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap leading-relaxed">{analysisJob.description}</p>
                    </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for New Posting */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 relative">New <span className="text-gradient">Posting</span></h2>
                <p className="text-slate-500 font-medium mb-10 relative">Define the perfect candidate for your mission.</p>
                
                <form onSubmit={handlePost} className="relative space-y-6 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                   <InputGroup label="Expertise Title" name="title" value={newJob.title} onChange={(e: any) => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Strategic Frontend Lead" icon={Briefcase} />
                   <div className="grid grid-cols-2 gap-6">
                      <InputGroup label="Compensation" name="salary" value={newJob.salary} onChange={(e: any) => setNewJob({...newJob, salary: e.target.value})} placeholder="e.g. ₹20L - ₹28L" icon={IndianRupee} />
                      <InputGroup label="HQ / Node" name="location" value={newJob.location} onChange={(e: any) => setNewJob({...newJob, location: e.target.value})} placeholder="Global / Bengaluru" icon={MapPin} />
                   </div>
                   <InputGroup label="Tech Stack" name="requirements" value={newJob.requirements} onChange={(e: any) => setNewJob({...newJob, requirements: e.target.value})} placeholder="React, Three.js, AI" icon={Sparkles} />
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                     <textarea 
                       name="description" 
                       value={newJob.description} 
                       onChange={(e: any) => setNewJob({...newJob, description: e.target.value})} 
                       placeholder="Describe the mission and daily impact..."
                       rows={4}
                       className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all font-bold text-slate-700 resize-none"
                     />
                   </div>
                   
                   <button 
                     type="submit"
                     className="w-full py-5 bg-sky-600 text-white font-black rounded-3xl shadow-2xl shadow-sky-100 hover:bg-sky-700 transition-all flex items-center justify-center gap-3"
                   >
                     Deploy Position <Send size={20} />
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {jobToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setJobToDelete(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Delete Posting?</h3>
              <p className="text-slate-500 font-medium text-sm mb-8">
                Are you sure you want to delete <span className="text-slate-900 font-bold">"{jobToDelete.title}"</span>? This action is irreversible.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setJobToDelete(null)}
                  className="py-4 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, placeholder, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-600 transition-colors" size={18} />
        <input 
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all font-bold text-slate-700"
        />
      </div>
    </div>
  );
}
