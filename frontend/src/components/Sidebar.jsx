import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  KeyRound,
  Network,
  FlaskConical,
  BellRing,
  ScrollText,
  BarChart3,
  Settings,
  Radio,
  ChevronRight,
  LogOut
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, stats, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
    { id: 'honeytokens', label: 'Honeytokens', icon: KeyRound, count: stats?.active_tokens },
    { id: 'deception', label: 'Deception Lab', icon: Network },
    { id: 'security-lab', label: 'Security Lab', icon: FlaskConical, highlight: true },
    { id: 'alerts', label: 'Threat Alerts', icon: BellRing, badge: stats?.active_alerts, badgeColor: 'bg-red-500' },
    { id: 'logs', label: 'Activity Logs', icon: ScrollText },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-lg shadow-cyan-950/50">
            <ShieldAlert className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold tracking-wider text-base text-white">HONEYGUARD</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">SOC</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Deception Architecture</p>
          </div>
        </div>

        {/* Defense State Banner */}
        <div className="mx-3 mt-4 mb-2 p-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-medium text-emerald-400">DEFENSE ACTIVE</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">v2.4</span>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-900/30'
                    : item.highlight
                    ? 'text-amber-300 hover:bg-amber-950/30 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-mono font-bold rounded-full bg-red-600 text-white shadow-sm shadow-red-900">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-400">
                      {item.count}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                      Demo
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 mb-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono">Decoy Coverage</span>
            <span className="font-mono text-cyan-400 font-semibold">100%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-full"></div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors border border-transparent hover:border-red-900/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit SOC Console</span>
        </button>
      </div>
    </aside>
  );
}
