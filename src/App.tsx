import { Routes, Route, Navigate } from 'react-router-dom';
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
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage setUser={setUser} />} />
      <Route path="/admin/login" element={<AdminLoginPage setUser={setUser} />} />
      
      <Route element={<Layout user={user} setUser={setUser} />}>
        <Route 
          path="/dashboard" 
          element={
            user?.role === 'student' ? <StudentDashboard /> :
            user?.role === 'company' ? <CompanyDashboard /> :
            user?.role === 'admin' ? <AdminDashboard /> :
            <Navigate to="/auth" />
          } 
        />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/search" element={<StudentSearch user={user} />} />
        <Route path="/students/:id" element={<StudentProfileView />} />
        <Route path="/companies" element={<ExploreCompanies />} />
      </Route>
      <Route path="/interview/:roomId" element={<InterviewRoom />} />
    </Routes>
  );
}
