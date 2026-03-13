import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Briefcase, Users, ShieldCheck, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-slate-900">CampusPortal</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Success Stories</a>
              <Link to="/admin/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Admin</Link>
              <Link to="/auth" className="text-sm font-medium text-slate-900 hover:text-indigo-600 transition-colors">Login</Link>
              <Link to="/auth?signup=true" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
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
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full uppercase tracking-wider">
              The Future of Campus Recruitment
            </span>
            <h1 className="mt-8 text-5xl md:text-7xl font-bold text-slate-900 tracking-tight">
              Bridge the gap between <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Talent and Opportunity</span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A digital hub where students showcase skills and recruiters discover future talent from campuses.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?signup=true" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
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
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 p-4">
              <img 
                src="https://picsum.photos/seed/dashboard/1200/800" 
                alt="Platform Preview" 
                className="rounded-2xl w-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-64 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden lg:block">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Placement Rate</p>
                  <p className="text-lg font-bold text-slate-900">94.2%</p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[94%]"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Students Placed', value: '5,000+' },
              { label: 'Partner Companies', value: '250+' },
              { label: 'Highest Package', value: '₹45 LPA' },
              { label: 'Avg. Package', value: '₹8.5 LPA' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
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
                features: ['AI Resume Analysis', 'One-click Applications', 'Interview Tracking', 'Skill Gap Insights'],
                color: 'bg-blue-50 text-blue-600'
              },
              {
                title: 'For Recruiters',
                icon: Briefcase,
                features: ['Smart Candidate Ranking', 'Automated Shortlisting', 'Bulk Communication', 'Analytics Dashboard'],
                color: 'bg-indigo-50 text-indigo-600'
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
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold">CampusPortal</span>
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
