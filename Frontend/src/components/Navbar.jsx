import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-4 z-[100] m-4 flex items-center justify-between px-6 py-3 bg-sensai-card/85 backdrop-blur-xl border border-white/5 shadow-glass">
      {/* Sleek, Modern Branding */}
      <Link to="/" className="flex items-center gap-3 no-underline group">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
          <Zap size={18} className="text-white fill-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-lg font-bold tracking-tight text-white transition-colors group-hover:text-sensai-primary">
            SENSEI
          </span>
          <span className="font-body text-[9px] text-slate-400 font-semibold tracking-wider uppercase">AI Business Advisor</span>
        </div>
      </Link>

      {/* Center Navigation */}
      <div className="flex items-center gap-8">
        {user ? (
          <>
            <div className="hidden items-center gap-6 md:flex font-heading">
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium no-underline transition-all duration-300 relative py-1 px-1
                  ${isActive('/dashboard') ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Dashboard
                {isActive('/dashboard') && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full shadow-[0_1px_8px_rgba(139,92,246,0.5)]"></span>
                )}
              </Link>
              {user?.role === 'founder' && (
                <Link 
                  to="/feasibility" 
                  className={`text-sm font-medium no-underline transition-all duration-300 relative py-1 px-1
                    ${isActive('/feasibility') ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                  AI Advisory
                  {isActive('/feasibility') && (
                    <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full shadow-[0_1px_8px_rgba(139,92,246,0.5)]"></span>
                  )}
                </Link>
              )}
              {['founder', 'mentor'].includes(user?.role) && (
                <Link 
                  to="/mentorship" 
                  className={`text-sm font-medium no-underline transition-all duration-300 relative py-1 px-1
                    ${isActive('/mentorship') ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                >
                  Experts
                  {isActive('/mentorship') && (
                    <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full shadow-[0_1px_8px_rgba(139,92,246,0.5)]"></span>
                  )}
                </Link>
              )}
              <Link 
                to="/messages" 
                className={`text-sm font-medium no-underline transition-all duration-300 relative py-1 px-1
                  ${isActive('/messages') ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Messages
                {isActive('/messages') && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full shadow-[0_1px_8px_rgba(139,92,246,0.5)]"></span>
                )}
              </Link>
              <Link 
                to="/forum" 
                className={`text-sm font-medium no-underline transition-all duration-300 relative py-1 px-1
                  ${isActive('/forum') ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Forum
                {isActive('/forum') && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full shadow-[0_1px_8px_rgba(139,92,246,0.5)]"></span>
                )}
              </Link>
            </div>
            
            {/* Soft role/status pill */}
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-full font-body text-[10px] text-slate-400 font-semibold tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] uppercase tracking-wider text-slate-300">
                {user.role === 'founder' ? 'Founder Workspace' : user.role === 'investor' ? 'Investor Portal' : 'Expert Portal'}
              </span>
            </div>

            <div className="flex items-center gap-4 pl-2">
               <div className="hidden items-center gap-2 lg:flex bg-white/[0.03] px-3.5 py-1.5 rounded-xl border border-white/5">
                 <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white uppercase">
                   {user.name.charAt(0)}
                 </div>
                 <span className="font-heading text-xs font-semibold text-slate-200 tracking-wide">
                   {user.name}
                 </span>
               </div>
               <button 
                 onClick={handleLogout} 
                 className="flex items-center gap-1.5 font-heading text-xs font-semibold text-slate-400 transition-all hover:text-rose-400 bg-transparent border-none cursor-pointer"
               >
                 <LogOut size={14} /> Logout
               </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-6 font-heading">
            <Link to="/login" className="text-sm font-medium text-slate-400 no-underline transition-colors hover:text-white">Sign In</Link>
            <Link to="/register" className="btn-primary py-2.5 px-5 text-xs font-semibold tracking-normal rounded-xl">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
