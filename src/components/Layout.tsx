import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  LogOut,
  Briefcase,
  Users,
  PieChart,
  Bell,
  Search,
  Building2,
  ArrowLeft,
  Home,
  MapPin,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function Layout({ user, setUser }: { user: any, setUser: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  /* STUDENT NAVIGATION */
  if (user?.role === 'student') {
    navItems.push(
      { label: 'Companies', icon: Building2, path: '/companies' },
      { label: 'Job Profiles', icon: Briefcase, path: '/jobs' },
      { label: 'Interviews', icon: Users, path: '/interviews' },
      { label: 'Competitions', icon: PieChart, path: '/competitions' },
      { label: 'Resume Builder', icon: User, path: '/resume-builder' },
      { label: 'Help', icon: Bell, path: '/help' }
    );
  }

  /* COMPANY NAVIGATION */
  if (user?.role === 'company') {
    navItems.push(
      { label: 'Dashboard', icon: LayoutDashboard, path: '/company/dashboard' },
      { label: 'Company Profile', icon: Building2, path: '/company/profile' },
      { label: 'Post Jobs', icon: Briefcase, path: '/company/jobs' },
      { label: 'Applicants', icon: Users, path: '/company/applicants' },
      { label: 'Branch Locations', icon: MapPin, path: '/company/branches' },
      { label: 'Search Students', icon: Search, path: '/search' }
    );
  }

  /* ADMIN NAVIGATION */
  if (user?.role === 'admin') {
    navItems.push(
      { label: 'Search Students', icon: Search, path: '/search' }
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className={cn("min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans", isAdmin && "pt-16 md:flex-col")}>
      
      {/* MOBILE HEADER */}
      {!isAdmin && (
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
           <Link to="/" className="text-xl font-black tracking-tight text-gradient">
             CAMPUS<span className="text-slate-900">PRO</span>
           </Link>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
             <Menu size={24} />
           </button>
        </div>
      )}

      {/* ADMIN TOP NAVBAR */}
      {isAdmin && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-50 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black tracking-tight text-gradient">
              CAMPUS<span className="text-slate-900">PRO</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-xl transition-all",
                    location.pathname === item.path
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all">
              <Home size={14} />
              Home
            </Link>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>
      )}

      {/* SIDEBAR (Desktop & Hidden Mobile Overlay) */}
      {!isAdmin && (
        <>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
              />
            )}
          </AnimatePresence>

          <aside className={cn(
            "fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200/60 flex flex-col h-screen z-[70] transition-transform duration-500 md:sticky md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="p-8 flex items-center justify-between">
              <Link to="/" className="text-3xl font-black tracking-tighter text-gradient flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-xl shadow-indigo-200">C</div>
                CAMPUS<span className="text-slate-900">PRO</span>
              </Link>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2 custom-scrollbar">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300",
                      isActive
                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                        : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                    )}
                  >
                    <item.icon size={20} className={cn("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden border-2 border-white">
                    {user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : user?.name?.[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 truncate uppercase tracking-tight">{user?.name}</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                    {user?.role}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all duration-300 group"
              >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen flex flex-col relative overflow-hidden">
        {/* Background blobs */}
        <div className="fixed top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-violet-100/30 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        {!isAdmin && (
          <header className="hidden md:flex h-20 bg-white/40 backdrop-blur-md border-b border-white/40 items-center justify-between px-10 sticky top-0 z-30">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ChevronRight size={20} className="text-indigo-600" />
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5 ml-7">
                Welcome back, {user?.name?.split(' ')[0]}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden md:flex items-center bg-white/80 rounded-2xl border border-slate-200/50 px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="Search anything..." className="ml-3 bg-transparent text-sm font-medium outline-none w-48" />
              </div>
              
              <button className="relative p-2.5 bg-white rounded-xl border border-slate-200/50 hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </header>
        )}

        <div className="p-6 md:p-12 relative z-10 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}