import React from 'react';

export function SeverityBadge({ severity }) {
  const sev = (severity || 'INFO').toUpperCase();
  
  const styles = {
    CRITICAL: 'bg-red-950/80 text-red-400 border-red-500/50 shadow-sm shadow-red-900/50',
    HIGH: 'bg-orange-950/80 text-orange-400 border-orange-500/50 shadow-sm shadow-orange-900/50',
    MEDIUM: 'bg-amber-950/80 text-amber-400 border-amber-500/50 shadow-sm shadow-amber-900/50',
    LOW: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50 shadow-sm shadow-cyan-900/50',
    INFO: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const dots = {
    CRITICAL: 'bg-red-400 animate-ping',
    HIGH: 'bg-orange-400',
    MEDIUM: 'bg-amber-400',
    LOW: 'bg-cyan-400',
    INFO: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${styles[sev] || styles.INFO}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[sev] || dots.INFO}`} />
      {sev}
    </span>
  );
}

export function AlertStatusBadge({ status }) {
  const stat = (status || 'ACTIVE').toUpperCase();

  const styles = {
    ACTIVE: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    REVIEWED: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
    RESOLVED: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${styles[stat] || styles.ACTIVE}`}>
      {stat}
    </span>
  );
}

export function TokenCategoryBadge({ category }) {
  const cat = (category || 'UNKNOWN').toUpperCase();

  const labels = {
    EMPLOYEE_CREDENTIAL: { label: 'Employee Cred', color: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40' },
    API_KEY: { label: 'Decoy API Key', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' },
    DATABASE_CREDENTIAL: { label: 'Database Cred', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' },
    DECOY_DOCUMENT: { label: 'Confidential Doc', color: 'bg-purple-950/80 text-purple-300 border-purple-500/40' },
    SENSITIVE_FILE: { label: 'Sensitive File', color: 'bg-amber-950/80 text-amber-300 border-amber-500/40' }
  };

  const item = labels[cat] || { label: cat, color: 'bg-slate-800 text-slate-300 border-slate-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium border ${item.color}`}>
      {item.label}
    </span>
  );
}
