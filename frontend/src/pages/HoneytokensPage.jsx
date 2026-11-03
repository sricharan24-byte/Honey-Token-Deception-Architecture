import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Eye,
  Trash2,
  Power,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { TokenCategoryBadge } from '../components/StatusBadge';
import TokenCreateModal from '../components/TokenCreateModal';
import TokenDetailModal from '../components/TokenDetailModal';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Decoys' },
  { id: 'EMPLOYEE_CREDENTIAL', label: 'Employee Cred' },
  { id: 'API_KEY', label: 'Decoy API Keys' },
  { id: 'DATABASE_CREDENTIAL', label: 'Database Cred' },
  { id: 'DECOY_DOCUMENT', label: 'Decoy Documents' },
  { id: 'SENSITIVE_FILE', label: 'Sensitive Files' },
];

export default function HoneytokensPage({
  tokens,
  onRefresh,
  onCreateToken,
  onUpdateToken,
  onDeleteToken
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filter logic
  const filteredTokens = tokens.filter(t => {
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.token_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.decoy_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location_context.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (token, e) => {
    e.stopPropagation();
    try {
      await onUpdateToken(token.id, { is_active: !token.is_active });
    } catch (err) {
      alert(err.message || 'Failed to update token');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <span>Honeytoken Management Registry</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Deploy, monitor, and configure canary assets across internal IT environments
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy New Honeytoken</span>
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors border ${
                selectedCategory === tab.id
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 font-semibold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decoys, tokens, locations..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Honeytokens Grid View */}
      {filteredTokens.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800">
          <KeyRound className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-mono text-slate-300">No honeytokens matched your criteria</p>
          <p className="text-xs font-mono text-slate-400 mt-1">Try resetting the category filter or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTokens.map((token) => (
            <div
              key={token.id}
              onClick={() => setSelectedToken(token)}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group hover:shadow-xl hover:shadow-cyan-950/20"
            >
              <div>
                {/* Header: ID, Category & Active Status */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
                    {token.token_id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <TokenCategoryBadge category={token.category} />
                    <button
                      onClick={(e) => handleToggleActive(token, e)}
                      title={token.is_active ? 'Armed (Click to disarm)' : 'Disabled (Click to arm)'}
                      className={`p-1 rounded-md border text-[10px] font-mono transition-colors ${
                        token.is_active
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/60'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Token Name */}
                <h3 className="text-sm font-semibold text-slate-100 font-mono mb-2 line-clamp-1">
                  {token.name}
                </h3>

                {/* Decoy Value Preview Box */}
                <div className="p-2.5 rounded-lg bg-black border border-slate-800/80 mb-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 truncate max-w-[200px]" title={token.decoy_value}>
                    {token.decoy_value}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(token.decoy_value, token.id);
                    }}
                    className="text-slate-400 hover:text-cyan-300 ml-2"
                    title="Copy Decoy Value"
                  >
                    {copiedId === token.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Location Context */}
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  <span className="text-slate-400 block text-[10px] uppercase">Placement:</span>
                  <p className="text-slate-300 line-clamp-2">{token.location_context}</p>
                </div>
              </div>

              {/* Bottom Footer: Hits & Detail Link */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${token.access_count > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                  <span>{token.access_count} triggers</span>
                </span>

                <span className="text-cyan-400 group-hover:underline text-[11px] flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Inspect History</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <TokenCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newToken) => {
            if (onCreateToken) onCreateToken(newToken);
            onRefresh();
          }}
        />
      )}

      {/* Detail & History Modal */}
      {selectedToken && (
        <TokenDetailModal
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
          onUpdated={(updated) => {
            setSelectedToken(updated);
            if (onUpdateToken) onUpdateToken(updated.id, updated);
            onRefresh();
          }}
          onDeleted={(id) => {
            setSelectedToken(null);
            if (onDeleteToken) onDeleteToken(id);
            onRefresh();
          }}
        />
      )}

    </div>
  );
}
