import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Shield, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  { id: 'EMPLOYEE_CREDENTIAL', label: 'Fake Employee Credentials' },
  { id: 'API_KEY', label: 'Decoy API Key' },
  { id: 'DATABASE_CREDENTIAL', label: 'Fake Database Credentials' },
  { id: 'DECOY_DOCUMENT', label: 'Decoy Document' },
  { id: 'SENSITIVE_FILE', label: 'Fake Sensitive File Reference' },
];

export default function TokenCreateModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    category: 'EMPLOYEE_CREDENTIAL',
    name: '',
    decoy_username: '',
    decoy_value: '',
    decoy_secret: '',
    location_context: '',
    description: '',
    tags: 'internal,decoy',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Handle auto-generator preview
  const handleAutoGenerate = async (cat = formData.category) => {
    setGenerating(true);
    setError('');
    try {
      const res = await api.generateDecoyPreview(cat);
      if (res.success && res.data) {
        setFormData(prev => ({
          ...prev,
          category: cat,
          name: res.data.name,
          decoy_username: res.data.decoy_username || '',
          decoy_value: res.data.decoy_value,
          decoy_secret: res.data.decoy_secret || '',
          location_context: res.data.location_context,
          description: res.data.description,
          tags: res.data.tags || 'internal,decoy'
        }));
      }
    } catch (err) {
      console.error('Failed to generate decoy preview:', err);
      setError('Failed to generate dummy values from generator.');
    } finally {
      setGenerating(false);
    }
  };

  // Auto-generate on first open
  useEffect(() => {
    handleAutoGenerate('EMPLOYEE_CREDENTIAL');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.decoy_value) {
      setError('Please provide a name and decoy value');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.createHoneytoken(formData);
      if (res.success) {
        onCreated(res.honeytoken);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to deploy honeytoken');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/30">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Deploy New Honeytoken</h3>
              <p className="text-xs font-mono text-slate-400">Plant a controlled digital canary trap into the enterprise environment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-300">Decoy Category</label>
              <button
                type="button"
                onClick={() => handleAutoGenerate(formData.category)}
                disabled={generating}
                className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1 rounded border border-cyan-500/30 transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                <span>{generating ? 'Generating...' : 'Auto-Generate Values'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, category: cat.id }));
                    handleAutoGenerate(cat.id);
                  }}
                  className={`px-3 py-2 text-xs font-mono rounded-lg border text-left transition-all ${
                    formData.category === cat.id
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-900/30 font-semibold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Token Name */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Honeytoken Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. AWS Production IAM Canary Key"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Decoy Username (Optional) */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Decoy Username / Identity (Optional)</label>
            <input
              type="text"
              value={formData.decoy_username}
              onChange={(e) => setFormData(prev => ({ ...prev, decoy_username: e.target.value }))}
              placeholder="e.g. svc-aws-sync or s.jenkins"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Decoy Value */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Decoy Asset Value (Key, Credential, Connection String, or File Path)
            </label>
            <input
              type="text"
              value={formData.decoy_value}
              onChange={(e) => setFormData(prev => ({ ...prev, decoy_value: e.target.value }))}
              placeholder="e.g. AKIA2V8N9EXAMPLE7482"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Decoy Secret */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Decoy Secret / Password / Canary Signature</label>
            <input
              type="text"
              value={formData.decoy_secret}
              onChange={(e) => setFormData(prev => ({ ...prev, decoy_secret: e.target.value }))}
              placeholder="e.g. wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY26"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Location Context */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Planted Location Context (Where Decoy Lives)</label>
            <input
              type="text"
              value={formData.location_context}
              onChange={(e) => setFormData(prev => ({ ...prev, location_context: e.target.value }))}
              placeholder="e.g. Developer Git repository .env.example & public Slack channel transcript"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Description & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="cloud,git,api-key"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              />
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="token_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="token_active" className="text-xs font-mono text-slate-300 cursor-pointer">
                  Activate Deception Trigger Immediately
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-mono font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-950/50 disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{loading ? 'Deploying...' : 'Deploy Honeytoken'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
