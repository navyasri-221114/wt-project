import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentSearch from './pages/StudentSearch';
import ExploreCompanies from './pages/ExploreCompanies';
import StudentProfileView from './pages/StudentProfileView';
import ProfilePage from './pages/ProfilePage';
import InterviewRoom from './pages/InterviewRoom';
import DocsPage from './pages/DocsPage';

import JobProfiles from './pages/jobprofiles';
import InterviewsPage from './pages/interviewpage';

import ResumeBuilder from './pages/resumebuilder';
import HelpPage from './pages/HelpPage';

/* COMPANY MODULE PAGES */
import CompanyProfile from './pages/company/CompanyProfile';
import CompanyJobs from './pages/company/CompanyJobs';
import CompanyApplicants from './pages/company/CompanyApplicants';
import CompanyBranches from './pages/company/CompanyBranches';

import Layout from './components/Layout';

export default function App() {

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (

    <Routes>

      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage setUser={setUser} />} />
      <Route path="/admin/login" element={<AdminLoginPage setUser={setUser} />} />

      <Route element={<Layout user={user} setUser={setUser} />}>

        <Route
          path="/dashboard"
          element={
            user?.role === 'student'
              ? <StudentDashboard />
              : user?.role === 'company'
                ? <CompanyDashboard />
                : user?.role === 'admin'
                  ? <AdminDashboard />
                  : <Navigate to="/auth" />
          }
        />

        <Route path="/profile" element={<ProfilePage user={user} />} />

        <Route path="/search" element={<StudentSearch user={user} />} />

        <Route path="/students/:id" element={<StudentProfileView />} />

        <Route path="/companies" element={<ExploreCompanies />} />

        {/* STUDENT FEATURES */}
        <Route element={user?.role === 'student' ? <Outlet /> : <Navigate to="/dashboard" />}>
          <Route path="/jobs" element={<JobProfiles />} />
          <Route path="/interviews" element={<InterviewsPage />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
        </Route>

        <Route path="/help" element={<HelpPage />} />
        <Route path="/docs" element={<DocsPage />} />

        {/* COMPANY MODULE ROUTES */}
        <Route path="/company/*" element={
            user?.role === 'company' || user?.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" />
        }>
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="jobs" element={<CompanyJobs />} />
          <Route path="applicants" element={<CompanyApplicants />} />
          <Route path="branches" element={<CompanyBranches />} />
        </Route>

      </Route>

      {/* INTERVIEW ROOM */}

      <Route path="/interview/:roomId" element={<InterviewRoom />} />

    </Routes>
  );
}