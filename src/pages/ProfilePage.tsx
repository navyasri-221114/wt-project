import React, { useState, useEffect } from 'react';
import { User, Mail, Building2, GraduationCap, Code, FileText, Link as LinkIcon, Save, Camera, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export default function ProfilePage({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.profile.get();
      setProfile(res);
      setFormData({
        name: res.name,
        avatar_url: res.avatar_url,
        ...res.profile
      });
      setAvatarPreview(res.avatar_url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setFormData({ ...formData, avatar_url: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.profile.update(formData);
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-indigo-600 to-violet-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        
        <div className="px-10 pb-10 relative">
          {/* Avatar Section */}
          <div className="absolute -top-16 left-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] bg-white p-2 shadow-2xl overflow-hidden border-4 border-white">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-[1.5rem]" />
                ) : (
                  <div className="w-full h-full rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-black">
                    {user?.name?.[0]}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                <Camera size={28} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>

          {/* Name & Title Section */}
          <div className="pt-20 mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-100/50">
                {user?.role}
              </span>
              <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                <ShieldCheck size={14} className="text-green-500" />
                Verified Profile
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email" disabled
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    value={user?.email || ''}
                  />
                </div>
              </div>
            </section>

            {user?.role === 'student' && (
              <>
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <GraduationCap size={20} className="text-indigo-600" />
                    Academic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">College Name</label>
                      <input
                        type="text"
                        placeholder="e.g. IIT Bombay"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.college || ''}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Branch/Specialization</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.branch || ''}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                      <input
                        type="text"
                        placeholder="e.g. Engineering"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Year of Study</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.year || ''}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current CGPA</label>
                      <input
                        type="number" step="0.01"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.cgpa || ''}
                        onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Code size={20} className="text-indigo-600" />
                    Skills & Projects
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Skills (Comma separated)</label>
                      <textarea
                        rows={2}
                        placeholder="React, Node.js, Python, SQL..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.skills || ''}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Key Projects</label>
                      <textarea
                        rows={3}
                        placeholder="Describe your major projects..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.projects || ''}
                        onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <LinkIcon size={20} className="text-indigo-600" />
                    Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.linkedin_url || ''}
                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">GitHub URL</label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.github_url || ''}
                        onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      />
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-indigo-600" />
                    Privacy Settings
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">Profile Visibility</p>
                        <p className="text-sm text-slate-500">Public profiles can be searched and viewed by registered companies.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                          formData.is_public ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                        )}
                      >
                        {formData.is_public ? <Eye size={18} /> : <EyeOff size={18} />}
                        {formData.is_public ? 'Public' : 'Private'}
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {user?.role === 'company' && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-indigo-600" />
                  Company Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Description</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Headquarters</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}