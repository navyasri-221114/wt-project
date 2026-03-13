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
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout({ user, setUser }: { user: any, setUser: any }) {

  const navigate = useNavigate();
  const location = useLocation();

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
      { label: 'Company Dashboard', icon: LayoutDashboard, path: '/company/dashboard' },
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
    <div className={cn("min-h-screen bg-slate-50", isAdmin ? "pt-16" : "flex")}>

      {/* ADMIN TOP NAVBAR */}

      {isAdmin && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-8 flex items-center justify-between">

          <div className="flex items-center gap-8">

            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
            >
              CampusPortal
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === item.path
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

          </div>

          <div className="flex items-center gap-4">

            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Home size={14} />
              Back to Home
            </Link>

            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">

              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                {user?.name?.[0]}
              </div>

              <span className="text-xs font-medium text-slate-700">
                {user?.name}
              </span>

            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>

          </div>

        </header>
      )}

      {/* SIDEBAR */}

      {!isAdmin && (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">

          <div className="p-6">

            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
            >
              CampusPortal
            </Link>

          </div>

          <nav className="flex-1 px-4 space-y-1">

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                  location.pathname === item.path
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}

          </nav>

          <div className="p-4 border-t border-slate-200">

            <Link
              to="/"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors mb-2"
            >
              <ArrowLeft size={20} />
              Home Page
            </Link>

            <div className="flex items-center gap-3 px-4 py-3 mb-2">

              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-indigo-200">

                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.[0]
                )}

              </div>

              <div className="flex-1 min-w-0">

                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.name}
                </p>

                <p className="text-xs text-slate-500 truncate capitalize">
                  {user?.role}
                </p>

              </div>

            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>

          </div>

        </aside>
      )}

      {/* MAIN CONTENT */}

      <main className="flex-1 overflow-y-auto">

        {!isAdmin && (
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">

            <h1 className="text-lg font-semibold text-slate-900 capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>

            <div className="flex items-center gap-4">

              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Home size={14} />
                Back to Home
              </Link>

              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell size={20} />
              </button>

            </div>

          </header>
        )}

        <div className="p-8">
          <Outlet />
        </div>

      </main>

    </div>
  );
}