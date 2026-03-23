import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Check, X, Video, Award, Sparkles, ChevronDown, Download, UserCheck, UserX, MoreHorizontal } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function CompanyApplicants() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [schedulingApp, setSchedulingApp] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const fetchedJobs = await api.jobs.getMy();
      const allApps = await Promise.all(fetchedJobs.map((j: any) => api.applications.getByJob(j._id || j.id)));
      
      const jobsWithApps = fetchedJobs.map((job: any, index: number) => ({
        ...job,
        id: job._id || job.id,
        applicants: allApps[index] || []
      }));
      
      setJobs(jobsWithApps);
      if (jobsWithApps.length > 0) {
        setExpandedJobId(jobsWithApps[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      await api.applications.updateStatus(appId, status);
      fetchApplicants();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const handleScheduleInterview = async (appId: string) => {
    if (!scheduleDate) {
      alert("Please select a valid date and time.");
      return;
    }
    try {
      await api.interviews.schedule({ application_id: appId, scheduled_at: scheduleDate });
      setSchedulingApp(null);
      setScheduleDate('');
      fetchApplicants();
      alert("Interview successfully scheduled!");
    } catch (err: any) {
      alert(err.message || "Failed to schedule interview");
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Talent <span className="text-gradient">Registry</span></h1>
          <p className="text-slate-500 font-medium mt-1">Review candidates categorized by your open positions.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-sky-600 transition-all shadow-sm">
             <Download size={18} /> Export Data
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
         <div className="flex-1 min-w-[300px] relative group">
           <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-600 transition-colors" />
           <input 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search candidate name..." 
             className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all font-bold text-slate-700"
           />
         </div>
         
         <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-50">
            {['all', 'applied', 'shortlisted', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-white text-sky-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {f}
              </button>
            ))}
         </div>
      </div>

      {/* Jobs & Applicants List */}
      {loading ? (
        <div className="py-20 text-center">
           <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin mx-auto mb-4" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Talent Data...</p>
        </div>
      ) : (
        <div className="space-y-6">
           {jobs.length > 0 ? (
             jobs.map((job) => {
               const filteredApplicants = job.applicants.filter((app: any) => {
                 const matchesFilter = filter === 'all' || app.status === filter;
                 const matchesSearch = (app.student_name || "").toLowerCase().includes(searchQuery.toLowerCase());
                 return matchesFilter && matchesSearch;
               });
               
               const isExpanded = expandedJobId === job.id;

               return (
                 <div key={job.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all">
                   {/* Job Header */}
                   <div 
                     onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                     className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                   >
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border-4 border-slate-50 shadow-sm">
                           {job.title[0]}
                        </div>
                        <div>
                           <h2 className="text-xl font-black text-slate-900 leading-tight">{job.title}</h2>
                           <p className="text-sm font-bold text-slate-400 mt-1">{filteredApplicants.length} Candidates</p>
                        </div>
                     </div>
                     <ChevronDown size={24} className={cn("text-slate-400 transition-transform mt-4 md:mt-0", isExpanded && "rotate-180")} />
                   </div>

                   {/* Applicants List */}
                   <AnimatePresence>
                     {isExpanded && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="border-t border-slate-100 bg-slate-50/50"
                       >
                         {filteredApplicants.length > 0 ? (
                           <div className="p-8 space-y-4">
                             {filteredApplicants.map((app: any, idx: number) => {
                               const appId = app.id || app._id;
                               const studentId = app.student_id?._id || app.student_id?.id || app.student_id;
                               return (
                                 <motion.div 
                                   initial={{ opacity: 0, x: -20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ delay: idx * 0.05 }}
                                   key={appId} 
                                   className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-6"
                                 >
                                   <div className="flex flex-1 items-center gap-4 text-sm font-bold text-slate-500">
                                      <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-bold border-2 border-slate-50 shadow-sm">
                                         {app.student_name ? app.student_name[0] : 'U'}
                                      </div>
                                      <div>
                                         <Link to={`/students/${studentId}`} className="text-lg font-black text-slate-900 hover:text-sky-600 transition-colors">
                                            {app.student_name}
                                         </Link>
                                         <div className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1.5"><Mail size={12} /> {app.student_email || 'n/a'}</span>
                                            <span className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-tighter border-l pl-4 border-slate-100">{app.cgpa || app.student_cgpa || '8.8'} CGPA</span>
                                         </div>
                                      </div>
                                   </div>

                                   <div className="flex items-center gap-6">
                                     {app.status === 'applied' ? (
                                       <div className="flex items-center gap-2">
                                         <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appId, 'shortlisted'); }} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                           <UserCheck size={18} />
                                         </button>
                                         <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appId, 'rejected'); }} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                           <UserX size={18} />
                                         </button>
                                       </div>
                                     ) : app.status === 'shortlisted' ? (
                                       schedulingApp === appId ? (
                                         <div className="flex items-center gap-2 bg-sky-50/50 p-2 rounded-xl border border-sky-100">
                                           <input 
                                             type="datetime-local" 
                                             value={scheduleDate}
                                             onChange={(e) => setScheduleDate(e.target.value)}
                                             className="px-2 py-1.5 text-xs border border-sky-200 bg-white rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                                           />
                                           <button onClick={() => handleScheduleInterview(appId)} className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-sm">
                                             Confirm
                                           </button>
                                           <button onClick={() => { setSchedulingApp(null); setScheduleDate(''); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                             <X size={14} />
                                           </button>
                                         </div>
                                       ) : (
                                         <button onClick={() => setSchedulingApp(appId)} className="px-5 py-2.5 bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                                           <Video size={14} /> Arrange
                                         </button>
                                       )
                                     ) : app.status === 'interview_scheduled' ? (
                                        <Link to={`/interview/${app.room_id}`} className="px-5 py-2.5 bg-sky-600 text-white hover:bg-sky-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-md hover:scale-105 active:scale-95">
                                          <Video size={14} /> Interview
                                        </Link>
                                     ) : (
                                       <div className={cn(
                                         "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                         app.status === 'rejected' ? "bg-red-50 text-red-700 border-red-100" :
                                         app.status === 'interviewed' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                         "bg-slate-50 text-slate-600 border-slate-200"
                                       )}>
                                          {app.status}
                                       </div>
                                     )}
                                   </div>
                                 </motion.div>
                               );
                             })}
                           </div>
                         ) : (
                           <div className="p-12 text-center">
                             <h3 className="text-lg font-black text-slate-400">No applicants match criteria</h3>
                           </div>
                         )}
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               );
             })
           ) : (
             <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <Users size={64} className="mx-auto text-slate-100 mb-6" />
                <h3 className="text-xl font-black text-slate-400">No active jobs found</h3>
                <p className="text-sm text-slate-400 mt-1">Post a job to start receiving applicants.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
