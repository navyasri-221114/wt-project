import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, TrendingUp, Download, CheckCircle2, Video, Key, Plus, Trash2, ShieldCheck, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [showCompModal, setShowCompModal] = useState(false);
  const [newComp, setNewComp] = useState({
    name: '', organizer: '', date: '', prize: '', category: 'Coding', difficulty: 'Medium', tags: ''
  });

  useEffect(() => {
    fetchStats();
    fetchKeys();
    fetchCompetitions();
    const interval = setInterval(() => {
      fetchStats();
      fetchKeys(true);
    }, 5000);
    return () => clearInterval(interval);
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

  if (loading || !stats) return <div>Loading...</div>;

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
          { label: 'Companies', value: stats.totalCompanies, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
          <button className="w-full mt-8 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
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
          <button className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2">
            <Download size={20} />
            Export PDF
          </button>
          <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
            <Download size={20} />
            Export CSV
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
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
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
                      <Key size={16} className="text-indigo-600" />
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
              <h2 className="text-2xl font-black text-slate-900">Add <span className="text-indigo-600">Competition</span></h2>
              <button onClick={() => setShowCompModal(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Competition Name</label>
                  <input required value={newComp.name} onChange={e => setNewComp({...newComp, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. SIH 2026" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Organizer</label>
                  <input required value={newComp.organizer} onChange={e => setNewComp({...newComp, organizer: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Google" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Date</label>
                  <input required value={newComp.date} onChange={e => setNewComp({...newComp, date: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Aug 15" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Category</label>
                  <select value={newComp.category} onChange={e => setNewComp({...newComp, category: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500">
                    <option value="Coding">Coding</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Difficulty</label>
                  <select value={newComp.difficulty} onChange={e => setNewComp({...newComp, difficulty: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Prize</label>
                  <input required value={newComp.prize} onChange={e => setNewComp({...newComp, prize: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. ₹50,000" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Tags (comma separated)</label>
                  <input value={newComp.tags} onChange={e => setNewComp({...newComp, tags: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500" placeholder="Algorithms, Cloud" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowCompModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Post Competition</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
