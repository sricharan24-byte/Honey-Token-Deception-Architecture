import React, { useState, useEffect } from 'react';
import { X, Copy, Check, History, Key, MapPin, Eye, Trash2, Power } from 'lucide-react';
import { TokenCategoryBadge, SeverityBadge } from './StatusBadge';
import { api } from '../services/api';

export default function TokenDetailModal({ token, onClose, onUpdated, onDeleted }) {
  if (!token) return null;

  const [copiedKey, setCopiedKey] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getTokenHistory(token.id);
        if (res.success) {
          setHistory(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load token interaction history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, [token.id]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const toggleActive = async () => {
    setUpdating(true);
    try {
      const res = await api.updateHoneytoken(token.id, { is_active: !token.is_active });
      if (res.success) {
        onUpdated(res.honeytoken);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete honeytoken "${token.name}"?`)) return;
    try {
      const res = await api.deleteHoneytoken(token.id);
      if (res.success) {
        onDeleted(token.id);
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete token');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{token.token_id}</span>
                <TokenCategoryBadge category={token.category} />
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  token.is_active ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {token.is_active ? 'ARMED' : 'DISABLED'}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-100 mt-0.5">{token.name}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Decoy Value Box */}
          <div className="p-3.5 rounded-lg bg-black border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Decoy Asset Value</span>
              <button
                onClick={() => copyToClipboard(token.decoy_value, 'val')}
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'val' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'val' ? 'Copied' : 'Copy Value'}</span>
              </button>
            </div>
            <p className="font-mono text-xs text-emerald-400 break-all select-all">{token.decoy_value}</p>

            {token.decoy_secret && (
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Decoy Secret/Key:</span>
                <span className="text-slate-300 break-all select-all">{token.decoy_secret}</span>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="text-slate-400">Planted Location Context:</div>
              <div className="text-slate-200">{token.location_context}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="text-slate-400">Total Trapped Interactions:</div>
              <div className="text-rose-400 font-bold text-sm">{token.access_count} times triggered</div>
            </div>
          </div>

          {/* Description */}
          {token.description && (
            <div className="text-xs text-slate-300 bg-slate-900/30 p-3 rounded-lg border border-slate-800">
              <span className="font-mono text-slate-400 block mb-1 uppercase text-[10px]">Strategic Deception Purpose</span>
              <p>{token.description}</p>
            </div>
          )}

          {/* Interaction History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <History className="w-4 h-4 text-cyan-400" />
                <span>INTERACTION AUDIT TRAIL</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{history.length} events logged</span>
            </div>

            {loadingHistory ? (
              <p className="text-xs font-mono text-slate-400 py-4 text-center">Loading interaction trail...</p>
            ) : history.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 text-center text-xs font-mono text-slate-400">
                No unauthorized access recorded on this decoy yet. The trap is armed and waiting.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map((evt) => (
                  <div key={evt.id} className="p-2.5 rounded bg-slate-900/70 border border-slate-800 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={evt.severity} />
                        <span className="text-slate-300">{evt.event_type}</span>
                        <span className="text-rose-400">from {evt.source_ip}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">{evt.payload_preview}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-5 border-t border-slate-800 bg-slate-900/40">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-red-400 hover:bg-red-950/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Retire Token</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleActive}
              disabled={updating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                token.is_active
                  ? 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-950/80'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/80'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{token.is_active ? 'Disarm Token' : 'Arm Token'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
