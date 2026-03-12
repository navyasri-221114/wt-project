import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Briefcase, ExternalLink, ChevronRight, Users } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export default function ExploreCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companiesRes, jobsRes] = await Promise.all([
        api.companies.getAll(),
        api.jobs.getAll()
      ]);
      setCompanies(companiesRes);
      setJobs(jobsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const companyJobs = jobs.filter(j => j.company_id === selectedCompany?.id);

  if (loading) return <div className="text-center py-12">Loading companies...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Company List */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Registered Companies</h2>
        <div className="space-y-3">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className={cn(
                "w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4",
                selectedCompany?.id === company.id
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden",
                selectedCompany?.id === company.id ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
              )}>
                {company.avatar_url ? (
                  <img src={company.avatar_url} alt={company.name} className="w-full h-full object-cover" />
                ) : company.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{company.name}</h3>
                <p className={cn("text-xs mt-0.5 truncate", selectedCompany?.id === company.id ? "text-indigo-100" : "text-slate-400")}>
                  {company.location || 'Global'}
                </p>
              </div>
              <ChevronRight size={18} className={cn("shrink-0", selectedCompany?.id === company.id ? "text-white" : "text-slate-300")} />
            </button>
          ))}
        </div>
      </div>

      {/* Company Details & Jobs */}
      <div className="lg:col-span-2">
        {selectedCompany ? (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-bold overflow-hidden border border-slate-100">
                    {selectedCompany.avatar_url ? (
                      <img src={selectedCompany.avatar_url} alt={selectedCompany.name} className="w-full h-full object-cover" />
                    ) : selectedCompany.name[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedCompany.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {selectedCompany.location || 'N/A'}</span>
                      <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                        <Globe size={14} /> Website
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">About Company</h4>
                <p className="text-slate-600 leading-relaxed">
                  {selectedCompany.description || 'No description provided by the company.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase size={20} className="text-indigo-600" />
                Active Openings at {selectedCompany.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyJobs.length > 0 ? (
                  companyJobs.map((job) => (
                    <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                        <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg uppercase">
                          {job.salary}
                        </span>
                      </div>
                      <div className="space-y-2 mb-6">
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin size={12} /> {job.location}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Users size={12} /> {job.vacancies} Vacancies
                        </p>
                      </div>
                      <button className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all">
                        Apply Now
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-slate-50 p-8 rounded-2xl text-center text-slate-500 border border-dashed border-slate-200">
                    No active job openings at the moment.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 p-12">
            <Building2 size={64} className="mb-4 opacity-10" />
            <p className="text-lg font-medium">Select a company to view details and job openings</p>
          </div>
        )}
      </div>
    </div>
  );
}
