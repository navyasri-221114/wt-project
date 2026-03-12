import React, { useState, useEffect } from 'react';
import { Plus, Users, Briefcase, ChevronRight, Star, Check, X, Video, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { cn } from '../lib/utils';

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
    const res = await api.jobs.getMy();
    setJobs(res);
    if (res.length > 0 && !selectedJob) {
      handleSelectJob(res[0]);
    }
  };

  const fetchInterviews = async () => {
    const res = await api.interviews.getMy();
    setInterviews(res);
  };

  const handleSelectJob = async (job: any) => {
    setSelectedJob(job);
    const res = await api.applications.getByJob(job.id);
    setApplicants(res);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.jobs.create(newJob);
    setShowPostModal(false);
    fetchJobs();
  };

  const handleUpdateStatus = async (appId: number, status: string) => {
    await api.applications.updateStatus(appId, status);
    if (selectedJob) handleSelectJob(selectedJob);
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
      .sort((a, b) => b.ai_score - a.ai_score)
      .slice(0, parseInt(count));

    if (confirm(`Shortlist top ${topCandidates.length} candidates?`)) {
      try {
        await Promise.all(topCandidates.map(c => api.applications.updateStatus(c.id, 'shortlisted')));
        alert('AI Shortlisting complete!');
        if (selectedJob) handleSelectJob(selectedJob);
      } catch (err) {
        alert('Failed to shortlist candidates');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Interviews Section */}
      {interviews.length > 0 && (
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <Video size={20} />
            </div>
            <h2 className="text-xl font-bold">Upcoming Interviews</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {interviews.filter(i => i.status === 'scheduled').map((interview) => (
              <div key={interview.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white truncate">{interview.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Candidate: {interview.student_name}</p>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(interview.scheduled_at).toLocaleString()}
                  </p>
                </div>
                <Link
                  to={`/interview/${interview.room_id}`}
                  className="w-full py-2 bg-indigo-600 text-white text-center text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Join Room
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar - Job List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Your Jobs</h2>
          <button
            onClick={() => setShowPostModal(true)}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => handleSelectJob(job)}
              className={cn(
                "w-full p-4 rounded-2xl border text-left transition-all",
                selectedJob?.id === job.id
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200"
              )}
            >
              <h3 className="font-bold truncate">{job.title}</h3>
              <p className={cn("text-xs mt-1", selectedJob?.id === job.id ? "text-indigo-100" : "text-slate-400")}>
                {job.location} • {job.salary}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main - Applicants */}
      <div className="lg:col-span-3 space-y-8">
        {selectedJob ? (
          <>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h2>
                  <p className="text-slate-500 mt-1">Applicants for this position</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleAIShortlist}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all text-xs font-bold"
                  >
                    <Star size={14} />
                    AI Shortlist Mode
                  </button>
                  <div className="text-center px-4 py-2 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-lg font-bold text-slate-900">{applicants.length}</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-600">Shortlisted</p>
                    <p className="text-lg font-bold text-green-700">
                      {applicants.filter(a => a.status === 'shortlisted').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-4 px-4">Candidate</th>
                      <th className="pb-4 px-4">CGPA</th>
                      <th className="pb-4 px-4">AI Score</th>
                      <th className="pb-4 px-4">Status</th>
                      <th className="pb-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {applicants.map((app) => (
                      <tr key={app.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-slate-900">{app.student_name}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{app.skills}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-slate-700">{app.cgpa}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  app.ai_score >= 80 ? "bg-green-500" :
                                  app.ai_score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{ width: `${app.ai_score}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-900">{app.ai_score}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            app.status === 'shortlisted' ? "bg-green-100 text-green-700" :
                            app.status === 'rejected' ? "bg-red-100 text-red-700" :
                            "bg-indigo-100 text-indigo-700"
                          )}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {app.status === 'applied' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                  title="Shortlist"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                  title="Reject"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            {app.status === 'shortlisted' && (
                              <button
                                onClick={() => handleScheduleInterview(app.id)}
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                                title="Schedule Interview"
                              >
                                <Video size={16} />
                              </button>
                            )}
                            {app.status === 'interviewed' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'selected')}
                                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                  title="Select Candidate"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                  title="Reject Candidate"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-200">
            <Briefcase size={48} className="mb-4 opacity-20" />
            <p>Select a job to view applicants</p>
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Post New Job</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salary Package</label>
                  <input
                    type="text" required placeholder="e.g. 12 LPA"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min CGPA</label>
                  <input
                    type="number" step="0.1" required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.min_cgpa}
                    onChange={(e) => setNewJob({ ...newJob, min_cgpa: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Number of Vacancies</label>
                  <input
                    type="number" required min="1"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.vacancies}
                    onChange={(e) => setNewJob({ ...newJob, vacancies: parseInt(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3} required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Requirements (Skills)</label>
                  <textarea
                    rows={2} required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                  Post Job Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
