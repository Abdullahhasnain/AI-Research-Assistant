import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon, ArrowRight, Stethoscope, UserPlus } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

// Mock database (mutable for demo purposes)
const MOCK_USERS: Record<string, User & { password: string }> = {
  'doctor': { username: 'doctor', password: 'password', name: 'Dr. Emily Smith', role: 'Doctor' },
  'nurse': { username: 'nurse', password: 'password', name: 'Nurse Joy', role: 'Nurse' },
  'admin': { username: 'admin', password: 'password', name: 'System Admin', role: 'Admin' },
  'staff': { username: 'staff', password: 'password', name: 'John Doe', role: 'Staff' },
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('Doctor');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(false);
    setPassword('');
    // Keep username if switching for convenience? No, clear mostly.
    // Actually better to keep username if they just signed up.
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const user = MOCK_USERS[username.toLowerCase()];
      if (user && user.password === password) {
        // Direct login success
        onLogin({
          username: user.username,
          name: user.name,
          role: user.role
        });
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 800);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (MOCK_USERS[username.toLowerCase()]) {
        setError('Username already taken');
        setLoading(false);
        return;
      }

      // Create user
      MOCK_USERS[username.toLowerCase()] = {
        username: username,
        password: password,
        name: fullName,
        role: role
      };

      setLoading(false);
      setSuccessMsg('Account created! Please log in.');
      setMode('login');
      // Clear password but keep username for easy login
      setPassword(''); 
    }, 1000);
  };

  const toggleMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    resetForm();
    if (newMode === 'signup') {
        setFullName('');
        setRole('Doctor');
        setUsername('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="bg-teal-600 p-8 text-center relative">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">MedAssist Pro</h1>
          <p className="text-teal-100 text-sm">Secure Clinical Dashboard</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === 'login' ? 'Enter your credentials to access.' : 'Join the medical team.'}
            </p>
          </div>

          <form onSubmit={mode === 'login' ? handleCredentialsSubmit : handleSignUpSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role</label>
                    <div className="relative">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="w-full pl-3 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all appearance-none text-slate-700"
                        >
                            <option value="Doctor">Doctor</option>
                            <option value="Nurse">Nurse</option>
                            <option value="Admin">Admin</option>
                            <option value="Staff">Staff</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (mode === 'login' ? 'Verifying...' : 'Creating Account...') : (mode === 'login' ? 'Login' : 'Sign Up')}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Or</span>
              </div>
            </div>

            <button 
              onClick={() => toggleMode(mode === 'login' ? 'signup' : 'login')}
              className="text-teal-600 hover:text-teal-800 text-sm font-semibold transition-colors flex items-center justify-center w-full"
            >
              {mode === 'login' ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create New Account
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to Login
                </>
              )}
            </button>
          </div>
          
          {mode === 'login' && (
            <div className="text-center mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">Demo Access: doctor / password</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
