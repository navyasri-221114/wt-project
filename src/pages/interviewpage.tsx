import { useState, useEffect } from "react";
import { Video, Clock, Building2, Calendar, CheckCircle2, AlertCircle, ArrowRight, User, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { cn } from "../lib/utils";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
    const interval = setInterval(() => {
      fetchInterviews(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchInterviews = async (isPolling = false) => {
    try {
      const res = await api.interviews.getMy();
      setInterviews(res);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(i => 
    filter === "all" ? true : i.status === filter
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Loading Schedule...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Interview <span className="text-gradient">Scheduler</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-md">
            Manage your upcoming sessions and track your progress through various recruitment stages.
          </p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit">
          {["all", "scheduled", "completed"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize",
                filter === f ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
          <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Total Booked</p>
          <p className="text-4xl font-black">{interviews.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Upcoming</p>
          <p className="text-4xl font-black text-slate-900">
            {interviews.filter(i => i.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Completed</p>
          <p className="text-4xl font-black text-green-600">
            {interviews.filter(i => i.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Success Rate</p>
          <p className="text-4xl font-black text-violet-600">
            {interviews.length > 0 ? Math.round((interviews.filter(i => i.status === 'completed').length / interviews.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredInterviews.length > 0 ? (
            filteredInterviews.map((interview) => (
              <motion.div
                layout
                key={interview.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
                  {/* Left Section: Role & Company */}
                  <div className="flex items-start gap-4 lg:gap-6 w-full lg:flex-1 min-w-0">
                    <div className={cn(
                      "w-14 h-14 lg:w-16 lg:h-16 shrink-0 rounded-2xl lg:rounded-3xl flex items-center justify-center border transition-colors",
                      interview.status === 'scheduled' ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
                      interview.status === 'completed' ? "bg-green-50 border-green-100 text-green-600" :
                      "bg-slate-50 border-slate-100 text-slate-400"
                    )}>
                      {interview.status === 'scheduled' ? <Video size={24} /> : 
                       interview.status === 'completed' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-xl lg:text-2xl font-black text-slate-900 leading-tight truncate">
                          {interview.title || "Interview Session"}
                        </h3>
                        {interview.status === 'scheduled' && (
                          <span className="inline-flex shrink-0 items-center gap-1.5 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            Live Now
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm">
                        <Building2 size={14} className="shrink-0" /> <span className="truncate">{interview.company_name || interview.application_id?.job_id?.company_id?.name || "Company"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle Section: Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full lg:w-auto border-y lg:border-none border-slate-50 py-6 lg:py-0">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Schedule</p>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
                          <Calendar size={14} className="text-indigo-400 shrink-0" /> 
                          <span className="truncate">{new Date(interview.scheduled_at).toLocaleDateString()}</span>
                        </p>
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                          <Clock size={14} className="text-indigo-400 shrink-0" /> 
                          <span className="truncate">{new Date(interview.scheduled_at).toLocaleTimeString([], {timeStyle: 'short'})}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Session</p>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
                          <User size={14} className="text-indigo-400 shrink-0" /> <span className="truncate">Recruiting Team</span>
                        </p>
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                          <MapPin size={14} className="text-indigo-400 shrink-0" /> <span className="truncate">Virtual</span>
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-center md:justify-end lg:pl-4">
                      {interview.status === 'scheduled' ? (
                        <Link to={`/interview/${interview.room_id}`} className="w-full md:w-auto px-6 lg:px-8 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group/btn shrink-0">
                          Join <span className="hidden sm:inline">Meeting</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      ) : (
                        <span className={cn(
                          "px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border text-center w-full md:w-auto",
                          interview.status === 'completed' ? "bg-green-50 border-green-100 text-green-600" : "bg-slate-50 border-slate-100 text-slate-400"
                        )}>
                          {interview.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Video size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">No interviews found</h3>
              <p className="text-slate-500 mt-2 font-medium">You don't have any sessions matching the selected filter.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}