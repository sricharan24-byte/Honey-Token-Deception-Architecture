import React, { useState } from 'react';
import { X, ShieldAlert, Terminal, AlertTriangle, CheckCircle, Clock, MapPin, Eye, FileText } from 'lucide-react';
import { SeverityBadge, AlertStatusBadge } from './StatusBadge';

export default function AlertDetailModal({ alert, onClose, onUpdateStatus }) {
  if (!alert) return null;

  const [notes, setNotes] = useState(alert.mitigation_notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setSubmitting(true);
    try {
      await onUpdateStatus(alert.id, newStatus, notes);
    } finally {
      setSubmitting(false);
    }
  };

  const event = alert.event_details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{alert.alert_uuid}</span>
                <SeverityBadge severity={alert.severity} />
                <AlertStatusBadge status={alert.status} />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mt-0.5">{alert.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Summary Banner */}
          <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 text-sm text-slate-300">
            <p className="font-mono text-xs text-slate-400 uppercase tracking-wider mb-1">Threat Description & Analysis</p>
            <p>{alert.description}</p>
          </div>

          {/* Incident Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Honeytoken Name:</span>
                <span className="text-cyan-300 font-medium">{alert.token_name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Category:</span>
                <span className="text-slate-200">{alert.token_type}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Source IP Address:</span>
                <span className="text-rose-400 font-bold">{alert.source_ip}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Detection Timestamp:</span>
                <span className="text-slate-300">{new Date(alert.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Rule Code:</span>
                <span className="text-amber-400 font-semibold">{event.detection_rule || 'RULE-DECEPTION-MATCH'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Anomaly Score:</span>
                <span className="text-red-400 font-bold">{event.anomaly_score || 85.0}/100</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Event Type:</span>
                <span className="text-slate-200">{event.event_type || 'DECOY_INTERACTION'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Simulated Asset:</span>
                <span className="text-emerald-400">True (Lab Isolation)</span>
              </div>
            </div>
          </div>

          {/* Intercepted Payload Preview */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-slate-300">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>INTERCEPTED PAYLOAD / QUERY TELEMETRY</span>
            </div>
            <div className="p-3 rounded-lg bg-black border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
              <code>{event.payload_preview || 'No raw payload captured.'}</code>
            </div>
            {event.user_agent && (
              <p className="mt-1 text-[11px] font-mono text-slate-400">
                User Agent: <span className="text-slate-300">{event.user_agent}</span>
              </p>
            )}
          </div>

          {/* Analyst Mitigation & Investigation Notes */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-2">
              SOC Analyst Mitigation Notes & Triage Actions:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record forensic observations, user isolation steps, or false-positive exclusion checks..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            {alert.reviewed_by && (
              <p className="mt-1.5 text-[11px] font-mono text-slate-400">
                Last reviewed by <span className="text-cyan-400">{alert.reviewed_by}</span> on {new Date(alert.reviewed_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-5 border-t border-slate-800 bg-slate-900/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {alert.status !== 'REVIEWED' && (
              <button
                disabled={submitting}
                onClick={() => handleStatusChange('REVIEWED')}
                className="px-4 py-2 rounded-lg text-xs font-mono font-medium text-blue-300 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-500/40 transition-colors disabled:opacity-50"
              >
                Mark Reviewed
              </button>
            )}

            {alert.status !== 'RESOLVED' && (
              <button
                disabled={submitting}
                onClick={() => handleStatusChange('RESOLVED')}
                className="px-4 py-2 rounded-lg text-xs font-mono font-medium text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 transition-colors disabled:opacity-50"
              >
                Mark Resolved
              </button>
            )}

            {alert.status !== 'ACTIVE' && (
              <button
                disabled={submitting}
                onClick={() => handleStatusChange('ACTIVE')}
                className="px-4 py-2 rounded-lg text-xs font-mono font-medium text-rose-300 bg-rose-950/80 hover:bg-rose-900/80 border border-rose-500/40 transition-colors disabled:opacity-50"
              >
                Re-Open Alert
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
