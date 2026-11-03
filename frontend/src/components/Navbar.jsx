import React, { useState, useEffect } from 'react';
import { Shield, Clock, Bell, User, RefreshCw, AlertTriangle, RotateCcw } from 'lucide-react';

export default function Navbar({ user, stats, onRefresh, onResetDemo, autoRefresh, setAutoRefresh }) {
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString().replace('GMT', 'UTC'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between z-10">
      {/* Left: Operational Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-wider uppercase">HONEYGUARD ACTIVE DEFENSE</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>ZERO-TOLERANCE DECEPTION ENGINE</span>
        </div>
      </div>

      {/* Right: Actions, Live Clock, Profile */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime}</span>
        </div>

        {/* Auto Refresh Toggle */}
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          title={`Auto-refresh is ${autoRefresh ? 'ON (5s)' : 'OFF'}`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
            autoRefresh
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline">{autoRefresh ? 'LIVE (5s)' : 'PAUSED'}</span>
        </button>

        {/* Quick Manual Refresh */}
        <button
          onClick={onRefresh}
          title="Refresh Data Now"
          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={onResetDemo}
          title="Reset demonstration data to clean state"
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/30 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>

        {/* Admin User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold">
            {user?.username ? user.username[0].toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-slate-200 font-mono leading-none">{user?.username || 'admin'}</p>
            <p className="text-[10px] text-cyan-400 font-mono leading-none mt-1">{user?.role || 'SOC_ADMIN'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
