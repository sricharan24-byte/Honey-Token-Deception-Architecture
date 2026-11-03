import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store token & user
      localStorage.setItem('honeyguard_token', data.token);
      localStorage.setItem('honeyguard_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCreds = () => {
    setEmail('admin@honeyguard.sec');
    setPassword('HoneyGuard2026!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 cyber-grid flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Decorative cyber ambient glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Terminal Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-xl shadow-cyan-950/60 p-0.5 mb-4 glow-cyan">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wider flex items-center justify-center gap-2">
            <span>HONEYGUARD</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">SOC</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Deception-First Internal Threat Detection Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-7 shadow-2xl shadow-cyan-950/40">
          
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-slate-300">ADMINISTRATIVE ACCESS GATE</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ARMED
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/80 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-300 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                SOC Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@honeyguard.sec"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-slate-300">Password</label>
                <span className="text-[10px] font-mono text-slate-400">PBKDF2-SHA256 Encrypted</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-mono text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'AUTHENTICATING SOC SESSION...' : 'ENTER SOC CONSOLE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Autofill Pill */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Demonstration Account:</span>
              <button
                type="button"
                onClick={handleFillDemoCreds}
                className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 transition-colors cursor-pointer"
              >
                Auto-fill Demo Credentials
              </button>
            </div>
            <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/60 font-mono text-[11px] text-slate-400 flex justify-between items-center">
              <span>admin@honeyguard.sec</span>
              <span className="text-slate-400">HoneyGuard2026!</span>
            </div>
          </div>

        </div>

        {/* Security Notice Footer */}
        <p className="text-center text-[11px] font-mono text-slate-400 mt-6">
          Controlled Deception Environment &bull; Zero Production Leakage
        </p>

      </div>
    </div>
  );
}
