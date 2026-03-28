import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Edit3, Save, X, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export default function CompanyProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.profile.get();
      setProfile(res);
      setFormData({
        name: res.name,
        description: res.profile?.description || '',
        website: res.profile?.website || '',
        location: res.profile?.location || '',
        custom_form: res.profile?.custom_form || []
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.profile.update(formData);
      setIsEditing(false);
      fetchProfile();
      alert("Company profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Company <span className="text-gradient">Profile</span></h1>
          <p className="text-slate-500 font-medium mt-1">Manage how talent sees your organization.</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-slate-800 transition-colors"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-black text-sm hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
        <div className="h-48 bg-gradient-to-r from-sky-600 to-violet-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="px-10 pb-10 relative">
          <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-2xl absolute -top-16 border-4 border-white flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full bg-sky-50 flex items-center justify-center rounded-2xl">
                <Building2 size={48} className="text-sky-400" />
              </div>
            )}
          </div>

          <div className="pt-20">
            {isEditing ? (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Headquarters</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Website link</label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">About the Company</label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-medium whitespace-pre-wrap resize-y"
                    placeholder="Add a compelling description about your company, culture, and mission to attract top talent..."
                  />
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Custom Application Form</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          custom_form: [
                            ...(formData.custom_form || []),
                            { id: Date.now().toString(), label: 'Expected CTC', type: 'number', required: true },
                            { id: (Date.now()+1).toString(), label: 'GitHub Link', type: 'url', required: true },
                            { id: (Date.now()+2).toString(), label: 'Portfolio', type: 'url', required: false },
                            { id: (Date.now()+3).toString(), label: 'Willing to Relocate?', type: 'boolean', required: true },
                            { id: (Date.now()+4).toString(), label: 'Resume', type: 'text', required: true }
                          ]
                        });
                      }}
                      className="px-4 py-2 bg-sky-100 text-sky-600 rounded-xl text-sm font-bold hover:bg-sky-200"
                    >
                      Add Top Company Fields
                    </button>
                  </div>
                  
                  {formData.custom_form?.map((field: any, index: number) => (
                     <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-center mb-3">
                       <input 
                          type="text" 
                          value={field.label} 
                          onChange={e => {
                             const newForm = [...formData.custom_form];
                             newForm[index].label = e.target.value;
                             setFormData({...formData, custom_form: newForm});
                          }}
                          className="flex-1 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                       />
                       <select
                          value={field.type}
                          onChange={e => {
                             const newForm = [...formData.custom_form];
                             newForm[index].type = e.target.value;
                             setFormData({...formData, custom_form: newForm});
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                       >
                         <option value="text">Text</option>
                         <option value="number">Number</option>
                         <option value="url">URL</option>
                         <option value="boolean">Yes/No</option>
                       </select>
                       <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                         <input 
                           type="checkbox" 
                           checked={field.required}
                           onChange={e => {
                             const newForm = [...formData.custom_form];
                             newForm[index].required = e.target.checked;
                             setFormData({...formData, custom_form: newForm});
                           }}
                           className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                         />
                         Required
                       </label>
                       <button
                         type="button"
                         onClick={() => {
                             const newForm = [...formData.custom_form];
                             newForm.splice(index, 1);
                             setFormData({...formData, custom_form: newForm});
                         }}
                         className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                       >
                         <Trash2 size={18} />
                       </button>
                     </div>
                  ))}
                  
                  <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          custom_form: [
                            ...(formData.custom_form || []),
                            { id: Date.now().toString(), label: 'New Field', type: 'text', required: false }
                          ]
                        });
                      }}
                      className="mt-3 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl font-bold hover:border-sky-300 hover:text-sky-500 transition-colors w-full justify-center"
                  >
                    <Plus size={18} /> Add Custom Field
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                  <p className="font-medium text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">
                    {profile?.profile?.description || 'Add a compelling description about your company, culture, and mission to attract top talent. Click Edit Profile to update your information.'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
