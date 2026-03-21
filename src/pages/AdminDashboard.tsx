import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, TrendingUp, Download, CheckCircle2, Video, Key, Plus, Trash2, ShieldCheck, X, FileText, Table2, Loader2, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { exportAnalyticsPDF, exportAnalyticsCSV } from '../services/exportUtils';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [showCompModal, setShowCompModal] = useState(false);
  const [newComp, setNewComp] = useState({
    name: '', organizer: '', date: '', prize: '', category: 'Coding', difficulty: 'Medium', tags: ''
  });

  const [yearlyStats, setYearlyStats] = useState<any[]>([]);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchKeys();
    fetchCompetitions();
    fetchYearlyAnalytics();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.admin.getStats();
      setStats(res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKeys = async (isPolling = false) => {
    try {
      const res = await api.admin.getKeys();
      setKeys(res);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      await api.admin.generateKey();
      fetchKeys();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateKeyStatus = async (id: number, status: string) => {
    try {
      await api.admin.updateKeyStatus(id.toString(), status);
      fetchKeys();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const res = await api.competitions.getAll();
      setCompetitions(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.competitions.create({
        ...newComp,
        tags: newComp.tags.split(',').map(t => t.trim())
      });
      setShowCompModal(false);
      setNewComp({ name: '', organizer: '', date: '', prize: '', category: 'Coding', difficulty: 'Medium', tags: '' });
      fetchCompetitions();
    } catch (err) {
      alert("Failed to create competition");
    }
  };

  const handleDeleteCompetition = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.competitions.delete(id);
      fetchCompetitions();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const fetchYearlyAnalytics = async () => {
    try {
      const res = await api.admin.getPlacementAnalytics();
      setYearlyStats(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const res = await api.admin.getStudentAnalytics();
      exportAnalyticsPDF(res.students, {
        totalStudents: stats?.totalStudents ?? res.total,
        placementRate: stats?.placementRate ?? 0,
      });
    } catch (err) {
      alert('Failed to generate analytics PDF. Please try again.');
      console.error(err);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      const res = await api.admin.getStudentAnalytics();
      exportAnalyticsCSV(res.students);
    } catch (err) {
      alert('Failed to export CSV. Please try again.');
      console.error(err);
    } finally {
      setExportingCSV(false);
    }
  };

  const currentYearData = yearlyStats[selectedYearIndex] || null;

  if (loading || !stats) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
        <p className="text-slate-500 font-bold animate-pulse">Loading Dashboard...</p>
      </div>
    </div>
  );

  const chartData = [
    { name: 'Students', value: stats.totalStudents },
    { name: 'Companies', value: stats.totalCompanies },
    { name: 'Jobs', value: stats.totalJobs },
    { name: 'Apps', value: stats.totalApplications },
    { name: 'Interviews', value: stats.totalInterviews },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Companies', value: stats.totalCompanies, icon: Building2, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Interviews', value: stats.totalInterviews, icon: Video, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Placement Rate', value: `${stats.placementRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl", item.bg, item.color)}>
                <item.icon size={24} />
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
            </div>
            <p className="text-sm text-slate-500 mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* NEW YEARLY ANALYTICS SECTION */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Yearly Placement <span className="text-indigo-600">Analytics</span></h3>
            <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-widest text-[10px]">Track historical hiring trends and company participation</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {yearlyStats.length > 0 ? yearlyStats.map((item, i) => (
              <button
                key={item.year}
                onClick={() => setSelectedYearIndex(i)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
                  selectedYearIndex === i 
                    ? "bg-white text-indigo-600 shadow-md scale-105" 
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {item.year}
              </button>
            )) : (
              <div className="px-6 py-2.5 text-xs font-bold text-slate-400">No Historical Data</div>
            )}
          </div>
        </div>

        {currentYearData ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl shadow-indigo-100">
                  <p className="text-indigo-100 font-bold uppercase tracking-widest text-[10px] mb-2 text-center md:text-left">Students Placed</p>
                  <p className="text-5xl font-black text-center md:text-left">{currentYearData.totalStudents}</p>
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-bold">
                    <span>Performance</span>
                    <span className="bg-white/20 px-2 py-1 rounded-lg">Target Met ✅</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2 text-center md:text-left">Hiring Partners</p>
                  <p className="text-5xl font-black text-slate-900 text-center md:text-left">{currentYearData.totalCompanies}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Year-on-Year</span>
                    <span className="text-green-600">+4% Visit Rate</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-50/50 border border-slate-100 rounded-3xl p-8">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <BarChart3 size={16} className="text-indigo-600" />
                  Company Hiring Distribution ({currentYearData.year})
                </h4>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentYearData.companyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar dataKey="count" name="Students Placed" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Hiring Partner</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Students Selected</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Salary Package</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentYearData.companyBreakdown.map((comp: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black group-hover:scale-110 transition-transform">
                            {comp.name[0]}
                          </div>
                          <span className="font-bold text-slate-900">{comp.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          <span className="font-black text-slate-700">{comp.count} Students</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                          {comp.package}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-[100px]">
                          <div 
                            className="bg-indigo-500 h-full rounded-full" 
                            style={{ width: `${Math.min((comp.count / currentYearData.totalStudents) * 500, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <PieChartIcon size={40} className="text-slate-300" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">No Records Found</h4>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Historical data will appear here once students are selected and assigned a placement year.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900">Platform Overview</h3>
            <select className="text-sm bg-slate-50 border-none rounded-lg px-3 py-1.5 outline-none">
              <option>Last 30 days</option>
              <option>Last 6 months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { user: 'Google', action: 'posted a new job: Software Engineer', time: '2h ago' },
              { user: 'Rahul S.', action: 'applied for Frontend Developer role', time: '4h ago' },
              { user: 'Microsoft', action: 'shortlisted 12 candidates', time: '6h ago' },
              { user: 'Admin', action: 'verified 5 new student profiles', time: '1d ago' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                  {activity.user[0]}
                </div>
                <div>
                  <p className="text-sm text-slate-900">
                    <span className="font-bold">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors">
            View All Activity
          </button>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Generate Placement Reports</h3>
          <p className="text-slate-400">Download detailed analytics and student data for the current academic year.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exportingPDF
              ? <><Loader2 size={18} className="animate-spin" /> Generating PDF...</>
              : <><FileText size={18} /> Export PDF</>}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exportingCSV}
            className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exportingCSV
              ? <><Loader2 size={18} className="animate-spin" /> Exporting CSV...</>
              : <><Table2 size={18} /> Export CSV</>}
          </button>
        </div>
      </div>

      {/* Activation Keys Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Company Activation Keys</h3>
            <p className="text-sm text-slate-500 mt-1">Generate and manage keys for company registration</p>
          </div>
          <button
            onClick={handleGenerateKey}
            disabled={generating}
            className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={20} />
            {generating ? 'Generating...' : 'Generate New Key'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 font-bold text-slate-900 text-sm">Activation Key</th>
                <th className="pb-4 font-bold text-slate-900 text-sm">Status</th>
                <th className="pb-4 font-bold text-slate-900 text-sm">Assigned To</th>
                <th className="pb-4 font-bold text-slate-900 text-sm">Created At</th>
                <th className="pb-4 font-bold text-slate-900 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {keys.map((key) => (
                <tr key={key.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Key size={16} className="text-sky-600" />
                      <code className="text-sm font-mono font-bold text-slate-700">{key.key}</code>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      key.status === 'active' ? "bg-green-100 text-green-700" :
                      key.status === 'used' ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {key.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-500">
                    {key.assigned_to || '—'}
                  </td>
                  <td className="py-4 text-sm text-slate-500">
                    {new Date(key.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {key.status === 'active' ? (
                        <button
                          onClick={() => handleUpdateKeyStatus(key.id, 'disabled')}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Disable Key"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : key.status === 'disabled' ? (
                        <button
                          onClick={() => handleUpdateKeyStatus(key.id, 'active')}
                          className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                          title="Enable Key"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No activation keys generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitions Management */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Student Competitions</h3>
            <p className="text-sm text-slate-500 mt-1">Add hackathons and coding challenges for students</p>
          </div>
          <button
            onClick={() => setShowCompModal(true)}
            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
          >
            <Plus size={20} />
            Post New Arena
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 font-bold text-slate-900 text-sm">Competition</th>
                <th className="pb-4 font-bold text-slate-900 text-sm">Organizer</th>
                <th className="pb-4 font-bold text-slate-900 text-sm">Date</th>
                <th className="pb-4 font-bold text-slate-900 text-sm">Category</th>
                <th className="pb-4 font-bold text-slate-900 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {competitions.map((comp) => (
                <tr key={comp._id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-bold text-slate-700">{comp.name}</td>
                  <td className="py-4 text-sm text-slate-500">{comp.organizer}</td>
                  <td className="py-4 text-sm text-slate-500">{comp.date}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600">
                      {comp.category}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handleDeleteCompetition(comp._id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {competitions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No competitions posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding competition */}
      {showCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-xl p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Add <span className="text-sky-600">Competition</span></h2>
              <button onClick={() => setShowCompModal(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Competition Name</label>
                  <input required value={newComp.name} onChange={e => setNewComp({...newComp, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-sky-500" placeholder="e.g. SIH 2026" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Organizer</label>
                  <input required value={newComp.organizer} onChange={e => setNewComp({...newComp, organizer: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-sky-500" placeholder="e.g. Google" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Date</label>
                  <input required value={newComp.date} onChange={e => setNewComp({...newComp, date: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-sky-500" placeholder="e.g. Aug 15" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Category</label>
                  <select value={newComp.category} onChange={e => setNewComp({...newComp, category: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-sky-500">
                    <option value="Coding">Coding</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Difficulty</label>
                  <select value={newComp.difficulty} onChange={e => setNewComp({...newComp, difficulty: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-sky-500">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Prize</label>
                  <input required value={newComp.prize} onChange={e => setNewComp({...newComp, prize: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-sky-500" placeholder="e.g. ₹50,000" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Tags (comma separated)</label>
                  <input value={newComp.tags} onChange={e => setNewComp({...newComp, tags: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-sky-500" placeholder="Algorithms, Cloud" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowCompModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-sky-600 text-white font-black rounded-xl hover:bg-sky-700 transition-all shadow-xl shadow-sky-100">Post Competition</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
