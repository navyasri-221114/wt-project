import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Globe, Building2 } from 'lucide-react';

export default function CompanyBranches() {
  const [branches, setBranches] = useState([
    { id: 1, name: 'Global Headquarters', location: 'San Francisco, CA', workers: 120 },
    { id: 2, name: 'APAC Tech Hub', location: 'Bengaluru, India', workers: 450 },
  ]);
  const [newBranch, setNewBranch] = useState({ name: '', location: '', workers: 0 });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.location) return;
    setBranches([...branches, { ...newBranch, id: Date.now() }]);
    setNewBranch({ name: '', location: '', workers: 0 });
  };

  const handleDelete = (id: number) => {
    setBranches(branches.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Branch <span className="text-gradient">Locations</span></h1>
          <p className="text-slate-500 font-medium mt-1">Manage global teams and interconnected campus branches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <h3 className="text-xl font-black text-slate-900 mb-6 relative">Add New Node</h3>
             <form onSubmit={handleAdd} className="relative space-y-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Name</label>
                  <input type="text" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} placeholder="e.g. EMEA Hub" className="w-full bg-slate-50 py-3 px-4 rounded-xl border border-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-bold text-sm text-slate-700 mt-1" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <input type="text" value={newBranch.location} onChange={e => setNewBranch({...newBranch, location: e.target.value})} placeholder="e.g. London, UK" className="w-full bg-slate-50 py-3 px-4 rounded-xl border border-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-bold text-sm text-slate-700 mt-1" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Est. Headcount</label>
                  <input type="number" value={newBranch.workers || ''} onChange={e => setNewBranch({...newBranch, workers: parseInt(e.target.value) || 0})} placeholder="e.g. 50" className="w-full bg-slate-50 py-3 px-4 rounded-xl border border-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-bold text-sm text-slate-700 mt-1" />
               </div>
               <button type="submit" className="w-full py-4 mt-2 bg-sky-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all flex items-center justify-center gap-2">
                 <Plus size={16} /> Deploy Node
               </button>
             </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {branches.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
              <Globe size={48} className="text-slate-200 mb-4" />
              <h3 className="text-xl font-black text-slate-400">No active branches</h3>
              <p className="text-sm text-slate-400 mt-1">Deploy your first geographical node to manage local talent.</p>
            </div>
          ) : (
            branches.map(branch => (
               <div key={branch.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-100 transition-all flex items-center gap-6 group">
                 <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors shrink-0">
                    <Building2 size={24} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900 leading-tight">{branch.name}</h4>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-sky-400" /> {branch.location}</span>
                      <span className="flex items-center gap-1"><Globe size={12} className="text-violet-400" /> {branch.workers} capacity</span>
                    </div>
                 </div>
                 <button onClick={() => handleDelete(branch.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={20} />
                 </button>
               </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
