import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Key,
  ShieldAlert,
  Database,
  Cpu,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Save,
  Server
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsPage({ user, onPasswordChanged, onResetDemoData }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const [systemInfo, setSystemInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    async function loadInfo() {
      try {
        const res = await api.getSettings();
        if (res.success) {
          setSystemInfo(res);
        }
      } catch (err) {
        console.error('Failed to load system info:', err);
      } finally {
        setLoadingInfo(false);
      }
    }
    loadInfo();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setPwdLoading(true);
    setPwdMsg({ type: '', text: '' });
    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.success) {
        setPwdMsg({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdMsg({ type: 'error', text: res.message || 'Failed to change password' });
      }
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message || 'Current password incorrect' });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to reset demonstration data? This resets the DB to the initial 10 tokens, 15 events, and 8 alerts.")) {
      return;
    }

    setResetting(true);
    try {
      await onResetDemoData();
      alert("Demonstration data successfully reset.");
      window.location.reload();
    } catch (err) {
      alert(err.message || "Failed to reset data");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <span>System Settings & Operational Diagnostics</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Administrative security policies, detection sensitivity parameters, and system persistence status
        </p>
      </div>

      {/* Grid: Admin Profile & Change Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Admin Profile Details */}
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pb-3 border-b border-slate-800">
            <User className="w-4 h-4" />
            <span>SOC ADMINISTRATOR IDENTITY</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Username</span>
              <span className="text-slate-200 font-bold">{user?.username || 'admin'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Email</span>
              <span className="text-slate-200 font-bold">{user?.email || 'admin@honeyguard.sec'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Security Role</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                {user?.role || 'SOC_ADMINISTRATOR'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Authentication Mechanism</span>
              <span className="text-slate-300">Stateless Signed Bearer JWT / PBKDF2 Password Hashes</span>
            </div>
          </div>
        </div>

        {/* Change Administrative Password */}
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pb-3 border-b border-slate-800 mb-4">
            <Key className="w-4 h-4" />
            <span>UPDATE ADMIN PASSWORD</span>
          </div>

          {pwdMsg.text && (
            <div className={`p-2.5 rounded-lg mb-3 text-xs font-mono flex items-center gap-2 ${
              pwdMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'bg-red-950/80 text-red-300 border border-red-500/40'
            }`}>
              {pwdMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">New Password (Min 8 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold transition-all disabled:opacity-50"
            >
              {pwdLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>

      </div>

      {/* System Status & Database Diagnostics */}
      {systemInfo && (
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pb-3 border-b border-slate-800">
            <Server className="w-4 h-4" />
            <span>PLATFORM HEALTH & PERSISTENCE DIAGNOSTICS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Engine Status</span>
              <span className="text-emerald-400 font-bold">ONLINE // ARMED</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Database Engine</span>
              <span className="text-slate-200 font-bold">{systemInfo.app_info?.database_type}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Database Size</span>
              <span className="text-cyan-300 font-bold">{systemInfo.app_info?.database_size_kb} KB</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Active Heuristic Rules</span>
              <span className="text-amber-400 font-bold">{systemInfo.detection_config?.deterministic_rules_count} Rules</span>
            </div>
          </div>
        </div>
      )}

      {/* Dangerous Operations: Demonstration Reset */}
      <div className="p-6 rounded-xl bg-red-950/20 border border-red-900/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-red-400">
          <RotateCcw className="w-4 h-4" />
          <span className="font-bold uppercase">Reset Demonstration Environment</span>
        </div>
        <p className="text-xs font-mono text-slate-300">
          Wipes all temporary interactive changes and restores the baseline demonstration dataset (10 sample honeytokens, 15 security events, 8 alerts, 1 administrator). Useful for recurring college presentations.
        </p>

        <button
          onClick={handleResetData}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors shadow-lg shadow-red-950/50 disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting Demo Data...' : 'Reset Demonstration Data'}</span>
        </button>
      </div>

    </div>
  );
}
