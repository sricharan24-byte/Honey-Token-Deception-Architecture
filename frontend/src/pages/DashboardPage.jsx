import React from 'react';
import {
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  Flame,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { SeverityBadge, TokenCategoryBadge } from '../components/StatusBadge';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#06b6d4',
};

export default function DashboardPage({ data, onNavigate, onInvestigateEvent }) {
  const stats = data?.stats || {};
  const severityDist = data?.severity_distribution || {};
  const categoryDist = data?.category_distribution || {};
  const dailyTrends = data?.daily_trends || [];
  const recentEvents = data?.recent_events || [];
  const topTokens = data?.top_tokens || [];

  // Pie chart data
  const pieData = [
    { name: 'CRITICAL', value: severityDist.CRITICAL || 0, color: SEVERITY_COLORS.CRITICAL },
    { name: 'HIGH', value: severityDist.HIGH || 0, color: SEVERITY_COLORS.HIGH },
    { name: 'MEDIUM', value: severityDist.MEDIUM || 0, color: SEVERITY_COLORS.MEDIUM },
    { name: 'LOW', value: severityDist.LOW || 0, color: SEVERITY_COLORS.LOW },
  ].filter(d => d.value > 0);

  // Category bar chart data
  const catData = [
    { name: 'Employee Cred', count: categoryDist.EMPLOYEE_CREDENTIAL || 0 },
    { name: 'API Keys', count: categoryDist.API_KEY || 0 },
    { name: 'Database Cred', count: categoryDist.DATABASE_CREDENTIAL || 0 },
    { name: 'Documents', count: categoryDist.DECOY_DOCUMENT || 0 },
    { name: 'Sensitive Files', count: categoryDist.SENSITIVE_FILE || 0 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert Bar if Critical Incidents exist */}
      {stats.critical_incidents > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glow-red">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-900/60 border border-red-500/50 text-red-400 shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider">
                  HIGH THREAT CORRELATION DETECTED
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-900/80 text-white font-bold">
                  {stats.critical_incidents} CRITICAL
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Rapid unauthorized probing detected against multiple deployed deception vectors.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-950/50"
          >
            <span>Triage Alerts</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Primary SOC Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Honeytokens Deployed */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Honeytokens Deployed</span>
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">{stats.total_tokens || 0}</div>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{stats.active_tokens || 0} Armed & Monitoring</span>
            </div>
          </div>
        </div>

        {/* Card 2: Suspicious Interactions */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Suspicious Interactions</span>
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">{stats.total_interactions || 0}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-slate-400">
              <span>Trap Trigger Rate:</span>
              <span className="text-indigo-400 font-bold">100% Deterministic</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Security Alerts */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Security Alerts</span>
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-300">{stats.active_alerts || 0}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-slate-400">
              <span>Awaiting SOC Review</span>
            </div>
          </div>
        </div>

        {/* Card 4: Critical Incidents */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Critical Incidents</span>
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/30 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-red-400">{stats.critical_incidents || 0}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-slate-400">
              <span>Multi-Vector Escalations</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: 7-Day Activity Trends (Area Chart) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">Suspicious Deception Timeline</h3>
              <p className="text-xs text-slate-400 font-mono">Daily recorded decoy interactions over past 7 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Total Events
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Critical
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="events" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#eventGradient)" />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#criticalGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Threat Severity Distribution (Pie / Donut) */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-mono">Threat Severity Distribution</h3>
            <p className="text-xs text-slate-400 font-mono">Incident breakdown by threat classification</p>
          </div>

          <div className="h-52 w-full my-auto flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs font-mono text-slate-400">No incident data recorded</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs font-mono">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="text-slate-200 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Suspicious Activities & Top Triggered Honeytokens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Suspicious Activity Table (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">Live Threat Telemetry Feed</h3>
              <p className="text-xs text-slate-400 font-mono">Most recent honeytoken access events across enterprise</p>
            </div>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Honeytoken Name</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Source IP</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">No recent events recorded.</td>
                  </tr>
                ) : (
                  recentEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      onClick={() => onInvestigateEvent && onInvestigateEvent(evt)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <SeverityBadge severity={evt.severity} />
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200 truncate max-w-[180px]">
                        {evt.token_name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {evt.event_type}
                      </td>
                      <td className="py-2.5 px-3 text-rose-400 font-semibold">
                        {evt.source_ip}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Triggered Decoys & Deception Metrics (1 Col) */}
        <div className="space-y-4">
          
          {/* Top Triggered List */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100 font-mono mb-3">Top Triggered Decoys</h3>
            <div className="space-y-2.5">
              {topTokens.slice(0, 4).map((token) => (
                <div key={token.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="truncate max-w-[170px]">
                    <p className="text-slate-200 truncate font-medium">{token.name}</p>
                    <p className="text-[10px] text-slate-400">{token.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 font-bold border border-red-500/30">
                      {token.access_count} hits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Security Lab Demonstration Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-tr from-cyan-950/60 to-slate-900 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Security Lab Demo</span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Simulate 5 realistic insider attack vectors to demonstrate real-time trap detection.
              </p>
            </div>

            <button
              onClick={() => onNavigate('security-lab')}
              className="mt-4 w-full py-2.5 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
            >
              <span>Launch Attack Simulator</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
