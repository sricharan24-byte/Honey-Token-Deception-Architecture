import React, { useEffect } from 'react';
import { AlertTriangle, ShieldAlert, X, ArrowRight } from 'lucide-react';
import { SeverityBadge } from './StatusBadge';

export default function LiveAlertToast({ alert, onDismiss, onInvestigate }) {
  if (!alert) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
      <div className="p-4 rounded-xl bg-slate-950 border-2 border-red-500/80 shadow-2xl shadow-red-950/80 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-red-400 tracking-wider">HONEYTOKEN TRAP TRIGGERED!</span>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={alert.severity} />
            <span className="text-xs font-mono text-slate-300 font-medium truncate">{alert.token_name}</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">{alert.description || alert.title}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono">
          <span className="text-slate-400">Source: <span className="text-rose-400">{alert.source_ip || '10.10.x.x'}</span></span>
          <button
            onClick={() => onInvestigate(alert)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            <span>Investigate Incident</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
