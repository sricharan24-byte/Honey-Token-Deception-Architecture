import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  Calendar,
  Terminal,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge, TokenCategoryBadge } from '../components/StatusBadge';

export default function ActivityLogsPage() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [category, setCategory] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents({
        category,
        severity,
        search,
        page,
        per_page: perPage
      });
      if (res.success) {
        setEvents(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, severity, page, perPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleExportCSV = () => {
    window.open(api.getExportUrl('events'), '_blank');
  };

  const totalPages = Math.ceil(total / perPage) || 1;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-cyan-400" />
            <span>SOC Security Event Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cryptographically timestamped telemetry log of all recorded decoy interactions
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Categories</option>
              <option value="EMPLOYEE_CREDENTIAL">Employee Cred</option>
              <option value="API_KEY">API Key</option>
              <option value="DATABASE_CREDENTIAL">Database Cred</option>
              <option value="DECOY_DOCUMENT">Decoy Document</option>
              <option value="SENSITIVE_FILE">Sensitive File</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rule, token, IP..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900"
            >
              Filter
            </button>
          </div>

        </form>
      </div>

      {/* Events Table */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Decoy Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Detection Rule</th>
                <th className="py-3 px-4">Payload Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading audit trail...</td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">No events matched the search criteria.</td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{evt.event_uuid}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={evt.severity} />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200 truncate max-w-[160px]" title={evt.token_name}>
                      {evt.token_name}
                    </td>
                    <td className="py-3 px-4">
                      <TokenCategoryBadge category={evt.token_type} />
                    </td>
                    <td className="py-3 px-4 text-rose-400 font-bold">{evt.source_ip}</td>
                    <td className="py-3 px-4 text-amber-400 truncate max-w-[170px]" title={evt.detection_rule}>
                      {evt.detection_rule}
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[200px]" title={evt.payload_preview}>
                      {evt.payload_preview}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Showing {events.length > 0 ? (page - 1) * perPage + 1 : 0} to {Math.min(page * perPage, total)} of {total} events
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 hover:text-white"
            >
              Previous
            </button>
            <span className="text-slate-300 font-bold px-2">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 hover:text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
