import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Briefcase, ExternalLink, ChevronRight, Users, Star, ShieldCheck, Mail, Phone, X, Send, Search } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function ExploreCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [applyingJob, setApplyingJob] = useState<any>(null);
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
      const [companiesRes, jobsRes, appsRes] = await Promise.all([
        api.companies.getAll(),
        api.jobs.getAll(),
        api.applications.getMy().catch(() => [])
      ]);
      setCompanies(companiesRes);
      setJobs(jobsRes);
      setApplications(appsRes);
      if (companiesRes.length > 0 && !isPolling && !selectedCompany) setSelectedCompany(companiesRes[0]);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const companyJobs = jobs.filter(j => {
    const compId = j.company_id?._id || j.company_id?.id || j.company_id;
    const selectedId = selectedCompany?.id || selectedCompany?._id;
    return compId && selectedId && compId.toString() === selectedId.toString();
  });

  const getAppStatus = (jobId: string) => {
    return applications.find(app => (app.job_id?._id || app.job_id?.id || app.job_id) === jobId || app.job_id === jobId);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    
    setSubmitting(true);
    try {
      await api.applications.apply(applyingJob.id, formData);
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Ecosystem...</p>
    </div>
  );

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Partner <span className="text-gradient">Companies</span></h1>
        <p className="text-slate-500 mt-2 font-medium max-w-2xl">
          Connect with industry leaders and explore career paths in top organizations.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Company List - Left Side */}
        <div className="xl:col-span-4 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4 sticky top-0 bg-slate-50/50 backdrop-blur-sm z-10 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Directory ({filteredCompanies.length})</h2>
            </div>
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 text-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {filteredCompanies.map((company) => (
              <motion.button
                layout
                key={company.id}
                onClick={() => setSelectedCompany(company)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full p-5 rounded-3xl border text-left transition-all flex items-center gap-4 group",
                  selectedCompany?.id === company.id
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200"
                    : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:shadow-lg shadow-slate-200/50"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden border-2",
                  selectedCompany?.id === company.id ? "bg-white/20 border-white/20 text-white" : "bg-indigo-50 border-white text-indigo-600"
                )}>
                  {company.avatar_url ? (
                    <img src={company.avatar_url} alt={company.name} className="w-full h-full object-cover" />
                  ) : company.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black truncate">{company.name}</h3>
                    {company.verified && <ShieldCheck size={14} className={cn(selectedCompany?.id === company.id ? "text-white" : "text-indigo-500")} />}
                  </div>
                  <p className={cn("text-xs font-bold mt-1 truncate uppercase tracking-tight opacity-70", selectedCompany?.id === company.id ? "text-white" : "text-slate-400")}>
                    {company.location || 'Global Headquarters'}
                  </p>
                </div>
                <ChevronRight size={20} className={cn("shrink-0 transition-transform group-hover:translate-x-1", selectedCompany?.id === company.id ? "text-white" : "text-slate-300")} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Company Details & Jobs - Right Side */}
        <div className="xl:col-span-8">
          <AnimatePresence mode="wait">
            {selectedCompany ? (
              <motion.div
                key={selectedCompany.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="space-y-8"
              >
                {/* Profile Header */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60"></div>
                  
                  <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
                    <div className="w-28 h-28 rounded-3xl bg-white flex items-center justify-center text-indigo-600 text-4xl font-black overflow-hidden border-4 border-slate-50 shadow-2xl">
                      {selectedCompany.avatar_url ? (
                        <img src={selectedCompany.avatar_url} alt={selectedCompany.name} className="w-full h-full object-cover" />
                      ) : selectedCompany.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedCompany.name}</h2>
                        <span className="px-4 py-1.5 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                          <ShieldCheck size={12} /> Verified Partner
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 mt-4 text-sm font-bold">
                        <span className="flex items-center gap-2 text-slate-500"><MapPin size={16} className="text-indigo-500" /> {selectedCompany.location || 'N/A'}</span>
                        <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
                          <Globe size={16} /> Visit Website <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Company size</p>
                      <p className="text-xl font-black text-slate-900">10,000+ Employees</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Roles</p>
                      <p className="text-xl font-black text-slate-900">{companyJobs.length} Openings</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Year Founded</p>
                      <p className="text-xl font-black text-slate-900">1998</p>
                    </div>
                  </div>

                  <div className="prose prose-slate max-w-none">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">Vision & Mission</h4>
                    <p className="text-slate-600 leading-relaxed font-medium text-lg">
                      {selectedCompany.description || 'No description provided by the company.'}
                    </p>
                  </div>
                </div>

                {/* Openings Grid */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <Briefcase size={24} className="text-indigo-600" />
                      Active Opportunities
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companyJobs.length > 0 ? (
                      companyJobs.map((job) => {
                        const jobId = job._id || job.id;
                        const app = getAppStatus(jobId);
                        return (
                          <motion.div 
                            key={jobId} 
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{job.title}</h4>
                              <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-tight">
                                {job.salary}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 mb-8">
                              <p className="text-xs font-bold text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                <MapPin size={14} className="text-indigo-400" /> {job.location}
                              </p>
                              <p className="text-xs font-bold text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                <Users size={14} className="text-indigo-400" /> {job.vacancies} Positions
                              </p>
                            </div>
                            {app ? (
                              <div className={cn(
                                "w-full py-4 text-center rounded-2xl text-xs font-black uppercase tracking-widest border",
                                app.status === 'shortlisted' ? "bg-green-50 text-green-700 border-green-100" :
                                app.status === 'rejected' ? "bg-red-50 text-red-700 border-red-100" :
                                "bg-indigo-50 text-indigo-700 border-indigo-100"
                              )}>
                                {app.status}
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setApplyingJob(job);
                                  setShowApplyModal(true);
                                }}
                                className="w-full py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group/btn"
                              >
                                Apply for Role
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                            )}
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="col-span-full bg-slate-50/50 p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
                        <Briefcase size={48} className="mx-auto mb-4 text-slate-300 opacity-50" />
                        <h4 className="text-xl font-bold text-slate-400">No active job openings</h4>
                        <p className="text-slate-400 mt-1">Check back later for new opportunities from this company.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 min-h-[500px]">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Building2 size={48} className="opacity-20 translate-y-2 translate-x-1" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Select a Company</h3>
                <p className="text-slate-500 mt-2 font-medium">Choose from our list of partners to explore deeper insights</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApplyModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden no-scrollbar"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="relative mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Job <span className="text-gradient">Application</span></h2>
                  <p className="text-slate-500 font-medium">{applyingJob?.title} at {selectedCompany?.name}</p>
                </div>
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="relative space-y-6 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Professional Introduction</label>
                  <textarea
                    required
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Briefly introduce yourself and your professional background..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>
                
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Relevant Experience & Skills</label>
                  <textarea
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    placeholder="List your key skills and relevant experience for this specific role..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Why do you want to join {selectedCompany?.name}?</label>
                  <textarea
                    required
                    value={formData.why_us}
                    onChange={(e) => setFormData({...formData, why_us: e.target.value})}
                    placeholder="Explain your motivation for applying to this company..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 h-32 resize-none"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Portfolio & Project Links</label>
                  <input
                    type="text"
                    value={formData.links}
                    onChange={(e) => setFormData({...formData, links: e.target.value})}
                    placeholder="GitHub, Portfolio, LinkedIn, etc."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? "Submitting Application..." : "Submit Application"} <Send size={20} className={submitting ? "animate-pulse" : ""} />
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
