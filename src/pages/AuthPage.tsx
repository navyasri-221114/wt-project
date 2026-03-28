import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Briefcase, Mail, Lock, User, Building2, ShieldCheck, ArrowRight, ArrowLeft, Key } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export default function AuthPage({ setUser }: { setUser: any }) {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('signup') === 'true');
  const [role, setRole] = useState<'student' | 'company' | 'admin'>('student');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', activationKey: '' });
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email;
      const name = decoded.name;

      if (!email) {
        setError("Authorization blocked: No email provided.");
        return;
      }

      setLoading(true);

      const res = await api.auth.signup({ name: name, email, password: 'google-secure-token', role: 'student' })
        .catch(async () => {
           // If signup fails because email exists, try login
           return await api.auth.login({ email, password: 'google-secure-token' });
        });
      
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError("Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignup && (role === 'student' || role === 'company') && !showOtp) {
       setLoading(true);
       try {
         await api.auth.sendOtp({ email: formData.email });
         setShowOtp(true);
       } catch (err: any) {
         setError(err.message || 'Failed to send OTP.');
       } finally {
         setLoading(false);
       }
       return;
    }
    
    if (showOtp && otp.length < 6) {
       setError('Please enter the 6 digit OTP code.');
       return;
    }

    setLoading(true);

    try {
      const res = isSignup 
        ? await api.auth.signup({ ...formData, role, otp })
        : await api.auth.login({ email: formData.email, password: formData.password });
      
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-8 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.jpg" alt="Campus Placement Portal" className="h-24 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isSignup ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 mt-2">
            {isSignup ? 'Join our placement ecosystem' : 'Sign in to your dashboard'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          {isSignup && (
            <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
              {[
                { id: 'student', label: 'Student', icon: User },
                { id: 'company', label: 'Company', icon: Building2 }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setRole(item.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
                    role === item.id ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isSignup && role === 'company' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Activation Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.activationKey}
                    onChange={(e) => setFormData({ ...formData, activationKey: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                    placeholder="COMP-XXXX-XXXX"
                  />
                </div>
              </div>
            )}

            {isSignup && showOtp && (
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                <label className="block text-sm font-bold text-sky-800 mb-1">Email Verification OTP</label>
                <p className="text-xs text-sky-600 mb-3">Enter the 6-digit code sent to <b>{formData.email}</b></p>
                <input
                  type="text" required value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-center font-bold tracking-[0.5em]"
                  placeholder="------"
                  maxLength={6}
                />
              </div>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg overflow-hidden break-words">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isSignup && !showOtp) ? 'Send Verification Code' : isSignup ? 'Create Account' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>

            {role === 'student' && (
              <div className="mt-4">
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or connect securely</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google sign in failed unexpectedly.')}
                    theme="outline"
                    width="100%"
                    shape="pill"
                  />
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-slate-500 hover:text-sky-600 transition-colors"
              type="button"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
