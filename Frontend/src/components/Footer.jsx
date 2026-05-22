import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Linkedin, Mail, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-auto border-t border-glass bg-sensai-bg/60 backdrop-blur-3xl pt-16 pb-8 overflow-hidden z-10">
      {/* Light glow inside the footer */}
      <div className="absolute top-0 right-[15%] w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-[10%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[80px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/10">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold tracking-tight text-white">
                  SENSEI
                </span>
                <span className="font-body text-[10px] text-slate-400 font-semibold tracking-wider uppercase">AI Business Advisor</span>
              </div>
            </div>
            <p className="text-sensai-muted text-sm max-w-sm leading-relaxed font-body">
              Empowering next-generation founders, experts, and investors with advanced AI business analytics, structured mentorship, and community-driven knowledge sharing.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300"
              >
                <Github size={16} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300"
              >
                <Twitter size={16} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300"
              >
                <Linkedin size={16} />
              </a>
              <a 
                href="mailto:contact@sensei.ai" 
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Ecosystem Column */}
          <div className="lg:col-span-2 flex flex-col space-y-4 col-start-1 md:col-start-auto">
            <h4 className="font-heading text-sm font-bold text-white tracking-wide uppercase">
              Ecosystem
            </h4>
            <ul className="flex flex-col space-y-2 text-sm font-body text-sensai-muted">
              <li>
                <Link to="/dashboard" className="hover:text-white hover:translate-x-0.5 transition-all duration-200 block no-underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/feasibility" className="hover:text-white hover:translate-x-0.5 transition-all duration-200 block no-underline">
                  AI Advisory
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="hover:text-white hover:translate-x-0.5 transition-all duration-200 block no-underline">
                  Experts Network
                </Link>
              </li>
              <li>
                <Link to="/forum" className="hover:text-white hover:translate-x-0.5 transition-all duration-200 block no-underline">
                  Community Forum
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <h4 className="font-heading text-sm font-bold text-white tracking-wide uppercase">
              Resources
            </h4>
            <ul className="flex flex-col space-y-2 text-sm font-body text-sensai-muted font-medium">
              <li>
                <a href="#methodology" className="hover:text-white hover:translate-x-0.5 transition-all duration-200 block no-underline">
                  Business Methodology
                </a>
              </li>
              <li>
                <a href="#api" className="hover:text-white hover:translate-x-0.5 transition-all duration-200 block no-underline">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#status" className="hover:text-white hover:translate-x-0.5 transition-all duration-200 block flex items-center gap-2 no-underline">
                  <span>System Status</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </a>
              </li>
              <li>
                <a href="#metrics" className="hover:text-white hover:translate-x-0.5 transition-all duration-200 block no-underline">
                  Network Statistics
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 flex flex-col space-y-4 font-body">
            <h4 className="font-heading text-sm font-bold text-white tracking-wide uppercase">
              Stay Updated
            </h4>
            <p className="text-sensai-muted text-xs leading-relaxed">
              Subscribe to get curated insights on startup viability, fundraising tactics, and expert sessions.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative flex flex-col space-y-2">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all duration-300"
                />
                <button 
                  type="submit" 
                  className="absolute right-1 top-1 bottom-1 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-md text-white text-xs hover:brightness-110 flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>

        </div>

        <div className="border-t border-glass pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start space-y-1">
            <span className="text-xs text-sensai-muted font-body">
              &copy; {new Date().getFullYear()} SENSEI. All rights reserved.
            </span>
            <span className="text-[10px] text-slate-500 font-body flex items-center gap-1">
              Made with <Heart size={10} className="text-rose-500 fill-rose-500 animate-pulse" /> for visionary founders and global advisors
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-sensai-muted font-body">
            <a href="#privacy" className="hover:text-white transition-colors no-underline">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors no-underline">Terms of Service</a>
            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded">
              <ShieldCheck size={10} /> Fully Secured
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
