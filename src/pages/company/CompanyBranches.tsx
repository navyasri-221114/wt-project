import React from 'react';
import { MapPin } from 'lucide-react';

export default function CompanyBranches() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Branch <span className="text-gradient">Locations</span></h1>
          <p className="text-slate-500 font-medium mt-1">Manage global teams and interconnected campus branches.</p>
        </div>
      </div>

      <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
         <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 mb-6">
            <MapPin size={40} />
         </div>
         <h3 className="text-2xl font-black text-slate-900 mb-2">Distributed Access Coming Soon</h3>
         <p className="text-sm font-bold text-slate-400 max-w-sm leading-relaxed">
            The capability to dispatch nodes to multiple locations, track distinct applicant pipelines per-branch, and isolate regional campus managers will be available in the next feature rollout.
         </p>
         
         <button className="mt-8 px-8 py-3.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
            Notify Development Team
         </button>
      </div>
    </div>
  );
}
