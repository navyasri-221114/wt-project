import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Check, X, Video, Award, Sparkles, ChevronDown, Download, UserCheck, UserX, MoreHorizontal } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function CompanyApplicants() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [schedulingApp, setSchedulingApp] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      // Typically we'd fetch all jobs then all apps, or a dedicated "get all my applicants" endpoint
      const jobs = await api.jobs.getMy();
      const allApps = await Promise.all(jobs.map((j: any) => api.applications.getByJob(j._id || j.id)));
      
      // We also need to attach the job title to these apps so the UI can display it
      const flattenedApps = allApps.flat().map((app: any) => {
        const job = jobs.find((j: any) => (j._id || j.id) === app.job_id);
        return { ...app, title: app.title || job?.title };
      });
      
      setApplicants(flattenedApps);
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

  const filteredApplicants = applicants.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Talent <span className="text-gradient">Registry</span></h1>
          <p className="text-slate-500 font-medium mt-1">Review and synchronize with your global applicant pool.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
             <Download size={18} /> Export Data
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
         <div className="flex-1 min-w-[300px] relative group">
           <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
           <input 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search by candidate name or position..." 
             className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
           />
         </div>
         
         <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-50">
            {['all', 'applied', 'shortlisted', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {f}
              </button>
            ))}
         </div>
      </div>

      {/* Applicants Grid */}
      {loading ? (
        <div className="py-20 text-center">
           <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Talent Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           {filteredApplicants.length > 0 ? (
             filteredApplicants.map((app, idx) => {
               const appId = app.id || app._id;
               return (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.05 }}
                 key={appId} 
                 className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col md:flex-row items-start md:items-center gap-8 group"
               >
                 <div className="flex flex-1 items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border-4 border-slate-50 shadow-2xl shadow-indigo-100 group-hover:rotate-3 transition-transform">
                       {app.student_name ? app.student_name[0] : 'U'}
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{app.student_name}</h3>
                       <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md"><Award size={12} /> {app.title}</span>
                          <span className="flex items-center gap-1.5"><Mail size={12} /> {app.student_email || 'n/a'}</span>
                          <span className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-tighter border-l pl-4 border-slate-100">{app.cgpa || app.student_cgpa || '8.8'} CGPA</span>
                       </div>
                    </div>
                 </div>

                  <div className="flex items-center gap-10 w-full md:w-auto">
                     <div className="flex items-center gap-3">
                       {app.status === 'applied' ? (
                         <>
                           <button 
                             onClick={() => handleUpdateStatus(appId, 'shortlisted')}
                             className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100 hover:bg-green-600 hover:text-white transition-all shadow-lg shadow-green-100 group/btn"
                           >
                             <UserCheck size={20} className="group-hover/btn:scale-110 transition-transform" />
                           </button>
                           <button
                             onClick={() => handleUpdateStatus(appId, 'rejected')} 
                             className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-100 group/btn"
                           >
                             <UserX size={20} className="group-hover/btn:scale-110 transition-transform" />
                           </button>
                         </>
                       ) : app.status === 'shortlisted' ? (
                         schedulingApp === appId ? (
                           <div className="flex items-center gap-2 bg-indigo-50/50 p-2 rounded-2xl border border-indigo-100">
                             <input 
                               type="datetime-local" 
                               value={scheduleDate}
                               onChange={(e) => setScheduleDate(e.target.value)}
                               className="px-3 py-2 text-xs border border-indigo-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                             />
                             <button 
                               onClick={() => handleScheduleInterview(appId)}
                               className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                             >
                               Confirm
                             </button>
                             <button 
                               onClick={() => { setSchedulingApp(null); setScheduleDate(''); }}
                               className="p-2 border border-slate-200 text-slate-400 bg-white rounded-xl hover:bg-slate-50 hover:text-red-500 transition-colors"
                             >
                               <X size={14} />
                             </button>
                           </div>
                         ) : (
                           <button 
                             onClick={() => setSchedulingApp(appId)}
                             className="px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                           >
                             <Video size={14} /> Arrange Interview
                           </button>
                         )
                       ) : app.status === 'interview_scheduled' ? (
                          <Link 
                            to={`/interview/${app.room_id}`}
                            className="px-6 py-3 bg-indigo-600 text-white border border-indigo-100 hover:bg-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                          >
                            <Video size={14} /> Conduct Interview
                          </Link>
                        ) : (
                         <div className={cn(
                           "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                           app.status === 'rejected' ? "bg-red-50 text-red-700 border-red-100" :
                           app.status === 'interviewed' ? "bg-blue-50 text-blue-700 border-blue-100" :
                           "bg-slate-50 text-slate-600 border-slate-200"
                         )}>
                            {app.status}
                         </div>
                       )}
                       <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
                          <MoreHorizontal size={20} />
                       </button>
                    </div>
                 </div>
               </motion.div>
             )})
           ) : (
             <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <Users size={64} className="mx-auto text-slate-100 mb-6" />
                <h3 className="text-xl font-black text-slate-400">No matching talent found</h3>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
