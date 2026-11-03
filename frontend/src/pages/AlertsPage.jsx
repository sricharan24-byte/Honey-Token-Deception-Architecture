import React, { useState } from 'react';
import {
  BellRing,
  Search,
  Filter,
  CheckCircle,
  Eye,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { SeverityBadge, AlertStatusBadge } from '../components/StatusBadge';
import AlertDetailModal from '../components/AlertDetailModal';

const SEVERITY_TABS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUS_TABS = ['ALL', 'ACTIVE', 'REVIEWED', 'RESOLVED'];

export default function AlertsPage({ alerts, onRefresh, onUpdateAlertStatus }) {
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAlertDetail, setActiveAlertDetail] = useState(null);

  // Filter alerts
  const filteredAlerts = alerts.filter(a => {
    const matchesSev = selectedSeverity === 'ALL' || a.severity === selectedSeverity;
    const matchesStat = selectedStatus === 'ALL' || a.status === selectedStatus;
    const matchesSearch = !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.alert_uuid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.token_name && a.token_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.source_ip && a.source_ip.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSev && matchesStat && matchesSearch;
  });

  const handleQuickReview = async (alert, e) => {
    e.stopPropagation();
    try {
      await onUpdateAlertStatus(alert.id, 'REVIEWED');
    } catch (err) {
      alert(err.message || 'Failed to review alert');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-red-400" />
            <span>Threat Alert Triage Management</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time incident stream triggered by unauthorized interactions with honeypot assets
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time polling active (5s)</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Severity Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-mono text-slate-400 mr-1">Severity:</span>
            {SEVERITY_TABS.map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                  selectedSeverity === sev
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 font-semibold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by UUID, token, or IP..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Status Sub-filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <span className="text-slate-400">Status:</span>
          {STATUS_TABS.map((stat) => (
            <button
              key={stat}
              onClick={() => setSelectedStatus(stat)}
              className={`px-2.5 py-0.5 rounded text-xs transition-colors ${
                selectedStatus === stat
                  ? 'bg-slate-800 text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {stat}
            </button>
          ))}
          <span className="ml-auto text-slate-400">{filteredAlerts.length} matching alerts</span>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Alert UUID</th>
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Triggered Decoy</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No threat alerts matched the current filters.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => setActiveAlertDetail(alert)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-semibold">
                      {alert.alert_uuid}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-100 truncate max-w-[220px]">
                      {alert.title}
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[160px]">
                      {alert.token_name}
                    </td>
                    <td className="py-3 px-4 text-rose-400 font-bold">
                      {alert.source_ip}
                    </td>
                    <td className="py-3 px-4">
                      <AlertStatusBadge status={alert.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {alert.status === 'ACTIVE' && (
                          <button
                            onClick={(e) => handleQuickReview(alert, e)}
                            title="Quick Review"
                            className="p-1 rounded text-blue-400 hover:bg-blue-950/60 border border-blue-500/30 text-[11px] px-2"
                          >
                            Review
                          </button>
                        )}
                        <button
                          onClick={() => setActiveAlertDetail(alert)}
                          className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Investigation Modal */}
      {activeAlertDetail && (
        <AlertDetailModal
          alert={activeAlertDetail}
          onClose={() => setActiveAlertDetail(null)}
          onUpdateStatus={async (id, status, notes) => {
            await onUpdateAlertStatus(id, status, notes);
            setActiveAlertDetail(prev => prev ? { ...prev, status, mitigation_notes: notes } : null);
          }}
        />
      )}

    </div>
  );
}
