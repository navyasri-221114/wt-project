import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Edit3 } from 'lucide-react';
import { api } from '../../services/api';

export default function CompanyProfile() {
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    api.profile.get().then((res) => setProfile(res)).catch(console.error);
  }, []);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Company <span className="text-gradient">Profile</span></h1>
          <p className="text-slate-500 font-medium mt-1">Manage how talent sees your organization.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
        <div className="h-48 bg-gradient-to-r from-indigo-600 to-violet-600 relative overflow-hidden">
           <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        
        <div className="px-10 pb-10 relative">
          <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-2xl absolute -top-16 border-4 border-white flex items-center justify-center">
            {profile?.avatar_url ? (
               <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
            ) : (
               <div className="w-full h-full bg-indigo-50 flex items-center justify-center rounded-2xl">
                 <Building2 size={48} className="text-indigo-400" />
               </div>
            )}
          </div>
          
          <div className="pt-20">
             <h2 className="text-3xl font-black text-slate-900">{profile?.name || 'Your Company Name'}</h2>
             
             <div className="flex items-center gap-6 mt-4 opacity-70">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-600">
                   <MapPin size={16} /> {profile?.profile?.location || 'Headquarters'}
                </div>
                <div className="flex items-center gap-2 font-bold text-sm text-slate-600">
                   <Globe size={16} /> {profile?.profile?.website || 'Website Link'}
                </div>
             </div>
             
             <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">About the Company</h3>
                <p className="font-medium text-slate-600 leading-relaxed max-w-3xl">
                   {profile?.profile?.description || 'Add a compelling description about your company, culture, and mission to attract top talent. Go to the Settings/Profile page to update your information.'}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
