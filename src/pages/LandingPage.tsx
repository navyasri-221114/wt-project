import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Briefcase, Users, ShieldCheck, TrendingUp, ArrowRight, CheckCircle2, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../services/api';

function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number, suffix?: string, prefix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const animation = animate(count, value, { duration: 2, ease: "easeOut" });
    const unsubscribe = rounded.on("change", (latest) => setDisplayValue(latest));
    return () => {
      animation.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <>{prefix}{displayValue}{suffix}</>;
}

export default function LandingPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.admin.getPublicStats().then(setStats).catch(console.error);
  }, []);

  const statItems = [
    { label: 'Students Registered', value: stats?.totalStudents || 0, suffix: '+' },
    { label: 'Partner Companies', value: stats?.totalCompanies || 0, suffix: '+' },
    { label: 'Jobs & Opportunities', value: stats?.totalJobs || 0, suffix: '+' },
    { label: 'Placement Rate', value: stats?.placementRate || 0, suffix: '%' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Campus Placement Portal" className="h-10 w-auto object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">Features</a>
              <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">Success Stories</a>
              <Link to="/admin/login" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">Admin</Link>
              <Link to="/auth" className="text-sm font-medium text-slate-900 hover:text-sky-600 transition-colors">Login</Link>
              <Link to="/auth?signup=true" className="px-5 py-2.5 bg-sky-600 text-white text-sm font-medium rounded-full hover:bg-sky-700 transition-all shadow-lg shadow-sky-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 bg-sky-50 text-sky-600 text-xs font-semibold rounded-full uppercase tracking-wider relative overflow-hidden inline-flex animate-pulse">
              <Activity size={14} className="mr-2" /> Live Placement Analytics
            </span>
            <h1 className="mt-8 text-5xl md:text-7xl font-bold text-slate-900 tracking-tight">
              Bridge the gap between <br />
              <span className="bg-gradient-to-r from-sky-600 to-violet-600 bg-clip-text text-transparent">Talent and Opportunity</span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A digital hub where students showcase skills and recruiters discover future talent from campuses.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?signup=true" className="w-full sm:w-auto px-8 py-4 bg-sky-600 text-white font-semibold rounded-2xl hover:bg-sky-700 transition-all shadow-xl shadow-sky-200 flex items-center justify-center gap-2">
                Start Your Journey <ArrowRight size={20} />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 transform hover:scale-[1.01] transition-transform duration-500 min-h-[340px] flex items-center justify-center relative">
              {/* Grid background */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              
              {/* Dashboard mock UI */}
              <div className="relative w-full max-w-3xl grid grid-cols-3 gap-4">
                {/* Stat cards */}
                {[
                  { label: 'Placements', value: '94%', color: 'from-sky-500 to-blue-600' },
                  { label: 'Companies', value: '850+', color: 'from-violet-500 to-purple-600' },
                  { label: 'Students', value: '12K+', color: 'from-emerald-500 to-teal-600' }
                ].map((s, i) => (
                  <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
                    <p className="text-xs font-bold opacity-70 uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-black mt-1">{s.value}</p>
                  </div>
                ))}

                {/* Main content area */}
                <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-white font-bold text-sm">Active Job Listings</p>
                  </div>
                  {['Senior Frontend Dev @ Google', 'ML Engineer @ Microsoft', 'SDE-2 @ Amazon'].map((job, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0">
                      <p className="text-white/80 text-xs font-semibold">{job}</p>
                      <span className="px-2 py-0.5 bg-sky-500/30 text-sky-300 text-[10px] font-bold rounded-full">OPEN</span>
                    </div>
                  ))}
                </div>

                {/* Side card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 flex flex-col gap-4">
                  <p className="text-white/60 text-xs font-black uppercase tracking-wider">Top Skills</p>
                  {['React', 'Python', 'System Design', 'ML/AI'].map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-white/80 text-xs font-bold">{skill}</span>
                        <span className="text-sky-400 text-xs font-black">{[92, 87, 78, 71][i]}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${[92, 87, 78, 71][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <motion.div 
              initial={{ scale: 0, x: 20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ type: "spring", delay: 1, bounce: 0.5 }}
              className="absolute -bottom-6 -right-6 w-64 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden lg:block"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Live Placement Rate</p>
                  <p className="text-lg font-bold text-slate-900">
                    {stats ? <AnimatedCounter value={stats.placementRate || 0} suffix="%" /> : "Loading..."}
                  </p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: stats ? `${stats.placementRate}%` : "0%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-green-500" 
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400 via-slate-900 to-slate-900"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statItems.map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <p className="text-4xl md:text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                  {stats ? <AnimatedCounter value={stat.value} suffix={stat.suffix} /> : "..."}
                </p>
                <p className="text-sm font-medium text-sky-400 mt-3 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to succeed</h2>
            <p className="mt-4 text-slate-600">Streamlined features for every stakeholder in the ecosystem.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'For Students',
                icon: Users,
                features: ['Digital Portfolio Builder', 'One-click Applications', 'Interview Tracking', 'Skill Assessment'],
                color: 'bg-blue-50 text-blue-600'
              },
              {
                title: 'For Recruiters',
                icon: Briefcase,
                features: ['Qualified Candidate Filtering', 'Structured Interviewing', 'Bulk Communication', 'Analytics Dashboard'],
                color: 'bg-sky-50 text-sky-600'
              },
              {
                title: 'For Admin/TPO',
                icon: ShieldCheck,
                features: ['Performance Analytics', 'Company Management', 'Report Generation', 'Process Oversight'],
                color: 'bg-violet-50 text-violet-600'
              }
            ].map((role, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-xl transition-all group">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", role.color)}>
                  <role.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{role.title}</h3>
                <ul className="space-y-3">
                  {role.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-slate-600 text-sm">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.jpg" alt="Campus Placement Portal" className="h-14 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="text-slate-400 max-w-sm">
              Empowering the next generation of professionals through technology-driven campus placements.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li>support@campusportal.edu</li>
              <li>+91 123 456 7890</li>
              <li>Placement Cell, University Campus</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          © 2024 Campus Placement Management Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
