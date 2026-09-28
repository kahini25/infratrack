import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, LayoutDashboard, Database, Wrench, PlusCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/assets' && location.pathname.startsWith('/assets') && location.pathname !== '/assets/new') {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-wide">Pravi InfraState</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Gujarat MVP</span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Statewide Infrastructure Asset Management System</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/assets"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/assets')
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Inventory</span>
            </Link>

            <Link
              to="/maintenance"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/maintenance')
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Maintenance</span>
            </Link>

            {user && (user.role === 'SUPER_ADMIN' || user.role === 'DEPARTMENT_ADMIN' || user.role === 'DISTRICT_OFFICER') && (
              <Link
                to="/assets/new"
                className="flex items-center space-x-2 ml-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Add Asset</span>
              </Link>
            )}

            {user && (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-slate-700">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-200">{user.name}</div>
                  <div className="text-[10px] text-cyan-400 uppercase tracking-wider">{user.role.replace('_', ' ')}</div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>

        </div>
      </div>
    </header>
  );
}
