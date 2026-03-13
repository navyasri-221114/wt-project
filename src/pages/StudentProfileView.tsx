import { useState, useEffect } from 'react';
import { Briefcase, MapPin, IndianRupee, Clock, CheckCircle2, AlertCircle, Video, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatCurrency, cn } from '../lib/utils';

export default function StudentDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      await api.applications.apply(jobId);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApplying(null);
    }
  };

  const getAppStatus = (jobId: string) => {
    return applications.find(app => app.job_id === jobId);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Upcoming Interviews</p>
          <p className="text-3xl font-bold text-indigo-600">
            {interviews.filter(i => i.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Shortlisted</p>
          <p className="text-3xl font-bold text-green-600">
            {applications.filter(a => a.status === 'shortlisted').length}
          </p>
        </div>
      </div>

      {interviews.length > 0 && (
        <div className="bg-indigo-600 rounded-3xl p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Video size={20} />
            </div>
            <h2 className="text-xl font-bold">Upcoming Interviews</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.filter(i => i.status === 'scheduled').map((interview) => (
              <div key={interview.id} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{interview.title}</h3>
                  <p className="text-sm text-indigo-100">{interview.company_name}</p>
                  <p className="text-xs text-indigo-200 mt-2 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(interview.scheduled_at).toLocaleString()}
                  </p>
                </div>
                <Link
                  to={`/interview/${interview.room_id}`}
                  className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/20"
                >
                  Join Room
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Listings */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Recommended Jobs</h2>
          {jobs.map((job) => {
            const app = getAppStatus(job.id);
            return (
              <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <p className="text-indigo-600 font-medium">{job.company_name}</p>
                  </div>
                  {app ? (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                      app.status === 'shortlisted' ? "bg-green-100 text-green-700" :
                      app.status === 'rejected' ? "bg-red-100 text-red-700" :
                      "bg-indigo-100 text-indigo-700"
                    )}>
                      {app.status}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                      className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {applying === job.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin size={16} />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <IndianRupee size={16} />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <AlertCircle size={16} />
                    Min CGPA: {job.min_cgpa}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Users size={16} />
                    {job.vacancies} Vacancies
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-sm text-slate-600 line-clamp-2">{job.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Application Status */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No applications yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{app.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{app.company_name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          app.status === 'shortlisted' ? "bg-green-500" :
                          app.status === 'rejected' ? "bg-red-500" :
                          "bg-indigo-500"
                        )} />
                        <span className="text-xs font-medium text-slate-700 capitalize">{app.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
