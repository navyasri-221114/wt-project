import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, User, MapPin, GraduationCap, Code, FileText, ExternalLink, Shield, ShieldOff, Star } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export default function StudentSearch({ user }: { user: any }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    branch: '',
    college: '',
    year: '',
    skills: '',
    min_cgpa: ''
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.profile.searchStudents(filters);
      setStudents(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Search Student Talent</h2>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <input
            type="text"
            placeholder="Branch..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
          />
          <input
            type="text"
            placeholder="College..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.college}
            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Min CGPA..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.min_cgpa}
            onChange={(e) => setFilters({ ...filters, min_cgpa: e.target.value })}
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-500">Searching...</div>
        ) : students.length > 0 ? (
          students.map((student) => (
            <div key={student.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative">
                {student.is_public === 0 && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <Shield size={12} />
                    Private Profile
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 relative">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg -mt-10 mb-4 overflow-hidden border border-slate-100">
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                      {student.name[0]}
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {student.name}
                </h3>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                  <GraduationCap size={14} />
                  {student.branch || 'N/A'} • {student.year || 'N/A'} Year
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    {student.college || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Code size={14} className="text-slate-400" />
                    <span className="truncate">{student.skills || 'No skills listed'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Star size={14} className="text-amber-400" />
                    <span className="font-bold">{student.cgpa || 'N/A'} CGPA</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <User size={14} />
                    View Profile
                  </button>
                  <button className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500">No students found matching your criteria.</div>
        )}
      </div>
    </div>
  );
}
