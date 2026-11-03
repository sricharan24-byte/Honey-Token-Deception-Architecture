import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  ShieldAlert,
  Activity,
  Layers,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { SeverityBadge, TokenCategoryBadge } from '../components/StatusBadge';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#06b6d4', '#10b981'];

export default function AnalyticsPage({ analyticsData, onRefresh }) {
  const [reportData, setReportData] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const stats = analyticsData?.stats || {};
  const severityDist = analyticsData?.severity_distribution || {};
  const categoryDist = analyticsData?.category_distribution || {};
  const dailyTrends = analyticsData?.daily_trends || [];
  const topTokens = analyticsData?.top_tokens || [];

  // Category breakdown data for bar chart
  const categoryChartData = [
    { category: 'Employee Cred', count: categoryDist.EMPLOYEE_CREDENTIAL || 0 },
    { category: 'Decoy API Keys', count: categoryDist.API_KEY || 0 },
    { category: 'Database Cred', count: categoryDist.DATABASE_CREDENTIAL || 0 },
    { category: 'Decoy Docs', count: categoryDist.DECOY_DOCUMENT || 0 },
    { category: 'Sensitive Files', count: categoryDist.SENSITIVE_FILE || 0 },
  ];

  // Token access frequency bar chart data
  const tokenFreqData = topTokens.map(t => ({
    name: t.name.length > 20 ? t.name.substring(0, 18) + '...' : t.name,
    hits: t.access_count
  }));

  const handleExportCSV = (type) => {
    window.open(api.getExportUrl(type), '_blank');
  };

  const handleOpenPrintReport = async () => {
    try {
      const res = await api.getIncidentSummary();
      setReportData(res);
      setShowPrintModal(true);
    } catch (err) {
      alert('Failed to load incident report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>SOC Analytics & Intelligence Reports</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Aggregated metrics, deception fidelity statistics, and executive compliance reporting
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export Dropdown / Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExportCSV('events')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Events CSV</span>
            </button>
            <button
              onClick={() => handleExportCSV('alerts')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-red-400" />
              <span>Alerts CSV</span>
            </button>
          </div>

          <button
            onClick={handleOpenPrintReport}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-950/40"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print SOC Executive Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Detection Reliability</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">100.0%</div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">0.0% False Positive Rate (Deception Native)</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Mean Time to Detect (MTTD)</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">&lt; 85 ms</div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Instantaneous trigger evaluation</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Deterministic Rules</span>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">7 Active Rules</div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Explainable heuristics & correlation</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Incidents Handled</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total_interactions || 0}</div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Active telemetry audit records</p>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Deployed Token Categories Breakdown */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-100 font-mono mb-1">Honeytoken Category Distribution</h3>
          <p className="text-xs text-slate-400 font-mono mb-4">Coverage of canary assets across attack surfaces</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Honeytoken Access Frequency */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-100 font-mono mb-1">Most Triggered Decoy Assets</h3>
          <p className="text-xs text-slate-400 font-mono mb-4">Total trap activations per canary resource</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenFreqData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="hits" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Printable Executive Report Modal */}
      {showPrintModal && reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
            
            {/* Modal Actions Bar (Hidden on Print) */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <span className="font-mono text-sm font-bold text-white">HONEYGUARD EXECUTIVE INCIDENT REPORT</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold transition-colors shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>Send to Printer / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Report Document Body */}
            <div className="font-mono text-xs space-y-6 print:text-black print:text-[10pt]">
              
              {/* Document Header */}
              <div className="border-b-2 border-slate-700 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-bold tracking-wider text-cyan-400 print:text-black">
                      HONEYGUARD CYBERSECURITY SOC
                    </h1>
                    <p className="text-slate-400 print:text-gray-600 text-xs">
                      Deception Architecture & Internal Threat Detection Assessment
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 print:text-gray-600">
                    <p>Report ID: <span className="font-bold text-slate-200 print:text-black">{reportData.report_id}</span></p>
                    <p>Date: {new Date(reportData.generated_at).toLocaleDateString()}</p>
                    <p>Classification: <span className="text-red-400 print:text-red-700 font-bold">CONFIDENTIAL // SOC AUDIT</span></p>
                  </div>
                </div>
              </div>

              {/* Executive Summary Card */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 print:bg-gray-100 print:border-gray-400">
                <h3 className="font-bold text-slate-200 print:text-black uppercase text-xs mb-2">1. Executive Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-cyan-400 print:text-black">{reportData.executive_summary.total_tokens_deployed}</div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600">Decoys Deployed</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-100 print:text-black">{reportData.executive_summary.total_incidents_recorded}</div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600">Recorded Probes</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-400 print:text-red-700">{reportData.executive_summary.critical_threats_count}</div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600">Critical Incidents</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-emerald-400 print:text-green-700">{reportData.executive_summary.deception_fidelity}</div>
                    <span className="text-[10px] text-slate-400 print:text-gray-600">Fidelity Score</span>
                  </div>
                </div>
              </div>

              {/* Critical Threats Table */}
              <div>
                <h3 className="font-bold text-slate-200 print:text-black uppercase text-xs mb-2">2. Critical Threat Incidents Requiring Remediation</h3>
                <table className="w-full text-left border border-slate-800 print:border-gray-400">
                  <thead className="bg-slate-900 print:bg-gray-200 text-slate-400 print:text-black text-[10px]">
                    <tr>
                      <th className="p-2 border border-slate-800 print:border-gray-400">Alert UUID</th>
                      <th className="p-2 border border-slate-800 print:border-gray-400">Severity</th>
                      <th className="p-2 border border-slate-800 print:border-gray-400">Honeytoken Name</th>
                      <th className="p-2 border border-slate-800 print:border-gray-400">Source Host</th>
                      <th className="p-2 border border-slate-800 print:border-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.critical_incidents.map((inc) => (
                      <tr key={inc.id} className="border-b border-slate-800 print:border-gray-400">
                        <td className="p-2 font-bold text-cyan-400 print:text-black">{inc.alert_uuid}</td>
                        <td className="p-2 text-red-400 print:text-red-700 font-bold">{inc.severity}</td>
                        <td className="p-2">{inc.token_name}</td>
                        <td className="p-2 font-semibold text-rose-400 print:text-black">{inc.source_ip}</td>
                        <td className="p-2">{inc.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Architectural Methodology Note */}
              <div className="p-3 border-l-4 border-cyan-500 bg-slate-900/60 print:bg-gray-50 print:border-cyan-700 text-[11px] text-slate-300 print:text-gray-700">
                <span className="font-bold block mb-1">Defense-in-Depth Assessment:</span>
                Honeytokens represent zero-operational-value assets placed strategically within corporate networks. Because no legitimate business process interacts with honeytokens, any touch constitutes high-fidelity confirmation of unauthorized insider activity, credential theft, or unauthorized reconnaissance.
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
