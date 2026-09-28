import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Mail, Activity, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
            <Activity className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          InfraTrack
        </h2>
        <p className="mt-2 text-center text-sm text-cyan-400 font-semibold tracking-wide uppercase">
          State Infrastructure Asset Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-500/20 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Secure Login</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Accounts Section */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
              Demo Accounts (Hackathon)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Super Admin */}
              <div className="flex flex-col p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-colors">
                <span className="font-bold text-cyan-400 text-sm">Super Admin</span>
                <span className="text-xs text-slate-400 mb-2">Full Gujarat Access</span>
                <button
                  type="button"
                  onClick={() => useDemoAccount('super.admin@infratrack.demo', 'Demo@123')}
                  className="mt-auto py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors text-center"
                >
                  Use Account
                </button>
              </div>

              {/* District Officer */}
              <div className="flex flex-col p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors">
                <span className="font-bold text-blue-400 text-sm">District Officer</span>
                <span className="text-xs text-slate-400 mb-2">Ahmedabad</span>
                <button
                  type="button"
                  onClick={() => useDemoAccount('ahmedabad.officer@infratrack.demo', 'Demo@123')}
                  className="mt-auto py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors text-center"
                >
                  Use Account
                </button>
              </div>

              {/* Maintenance Officer */}
              <div className="flex flex-col p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-orange-500/50 transition-colors">
                <span className="font-bold text-orange-400 text-sm">Maintenance Officer</span>
                <span className="text-xs text-slate-400 mb-2">Maintenance Operations</span>
                <button
                  type="button"
                  onClick={() => useDemoAccount('maintenance@infratrack.demo', 'Demo@123')}
                  className="mt-auto py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors text-center"
                >
                  Use Account
                </button>
              </div>

              {/* Finance Officer */}
              <div className="flex flex-col p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-colors">
                <span className="font-bold text-emerald-400 text-sm">Finance Officer</span>
                <span className="text-xs text-slate-400 mb-2">Gujarat Financial Data</span>
                <button
                  type="button"
                  onClick={() => useDemoAccount('finance@infratrack.demo', 'Demo@123')}
                  className="mt-auto py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors text-center"
                >
                  Use Account
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
