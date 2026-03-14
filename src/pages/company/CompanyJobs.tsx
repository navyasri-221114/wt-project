import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, MapPin, IndianRupee, Clock, Search, Filter, MoreHorizontal, Edit3, Trash2, Globe, Send, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function CompanyJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
          className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={18} /> Add New Listing
        </button>
      </div>

      {/* Interface Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by title, location or keywords..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all">
          <Filter size={18} /> Filters
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
           <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing Catalog...</p>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6"
        >
          {jobs.map((job) => (
            <motion.div 
              key={job.id} 
              variants={item}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col lg:flex-row items-start lg:items-center gap-10 group"
            >
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110 shadow-lg shadow-indigo-100/20">
                <Briefcase size={32} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate leading-tight">{job.title}</h3>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[9px] font-black rounded-lg uppercase tracking-wider">Live</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-400" /> {job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1.5"><IndianRupee size={14} className="text-indigo-400" /> {job.salary}</span>
                  <span className="flex items-center gap-1.5"><Globe size={14} className="text-indigo-400" /> Full Time</span>
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
                    <button className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                       <Trash2 size={18} />
                    </button>
                    <button className="ml-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                       Analysis
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

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
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 relative">New <span className="text-gradient">Posting</span></h2>
                <p className="text-slate-500 font-medium mb-10 relative">Define the perfect candidate for your mission.</p>
                
                <form onSubmit={handlePost} className="relative space-y-6">
                   <InputGroup label="Expertise Title" name="title" value={newJob.title} onChange={(e: any) => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Strategic Frontend Lead" icon={Briefcase} />
                   <div className="grid grid-cols-2 gap-6">
                      <InputGroup label="Compensation" name="salary" value={newJob.salary} onChange={(e: any) => setNewJob({...newJob, salary: e.target.value})} placeholder="e.g. ₹20L - ₹28L" icon={IndianRupee} />
                      <InputGroup label="HQ / Node" name="location" value={newJob.location} onChange={(e: any) => setNewJob({...newJob, location: e.target.value})} placeholder="Global / Bengaluru" icon={MapPin} />
                   </div>
                   <InputGroup label="Tech Stack" name="requirements" value={newJob.requirements} onChange={(e: any) => setNewJob({...newJob, requirements: e.target.value})} placeholder="React, Three.js, AI" icon={Sparkles} />
                   
                   <button 
                     type="submit"
                     className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                   >
                     Deploy Position <Send size={20} />
                   </button>
                </form>
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
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
        <input 
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
        />
      </div>
    </div>
  );
}
