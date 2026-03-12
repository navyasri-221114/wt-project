import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, GraduationCap, Code, FileText, MapPin, Star, Briefcase, Award, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export default function StudentProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.students.getProfile(id!);
      setStudent(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading profile...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!student) return <div className="text-center py-12">Student not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Search
      </button>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600" />
        <div className="px-8 pb-8 relative">
          <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-xl -mt-16 mb-6 overflow-hidden border-4 border-white">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-bold">
                {student.name[0]}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{student.name}</h1>
              <p className="text-slate-500 flex items-center gap-2 mt-1">
                <GraduationCap size={18} />
                {student.branch || 'N/A'} • {student.year || 'N/A'} Year
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-bold border border-amber-100">
                  <Star size={14} />
                  {student.cgpa || 'N/A'} CGPA
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                  <MapPin size={14} />
                  {student.college || 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                <Download size={20} />
                Download Resume
              </button>
              <a 
                href={`mailto:${student.email}`}
                className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Skills */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Code size={20} className="text-indigo-600" />
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {student.skills ? student.skills.split(',').map((skill: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium border border-slate-100">
                  {skill.trim()}
                </span>
              )) : <p className="text-slate-400 italic">No skills listed</p>}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600" />
              Projects
            </h3>
            <div className="space-y-6">
              {student.projects ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{student.projects}</p>
                </div>
              ) : <p className="text-slate-400 italic">No projects listed</p>}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Award size={20} className="text-indigo-600" />
              Certifications
            </h3>
            <div className="space-y-6">
              {student.certifications ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{student.certifications}</p>
                </div>
              ) : <p className="text-slate-400 italic">No certifications listed</p>}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Contact Info */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Mail size={16} />
                </div>
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <ExternalLink size={16} />
                </div>
                <span>LinkedIn Profile</span>
              </div>
            </div>
          </div>

          {/* Resume Preview Placeholder */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <FileText size={48} className="text-indigo-400 mb-6" />
            <h3 className="text-xl font-bold mb-2">Resume Preview</h3>
            <p className="text-sm text-slate-400 mb-6">View the full professional resume of {student.name}.</p>
            <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all">
              View Full Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
