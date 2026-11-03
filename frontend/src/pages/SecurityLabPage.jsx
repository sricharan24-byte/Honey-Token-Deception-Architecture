import React, { useState } from 'react';
import {
  FlaskConical,
  Zap,
  ShieldAlert,
  Flame,
  Terminal,
  Database,
  Key,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/StatusBadge';

export default function SecurityLabPage({ onAttackSimulated, onInvestigateAlert }) {
  const [loadingType, setLoadingType] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const attacks = [
    {
      id: 'simulate_fake_credential',
      title: '1. Simulate Fake Credential Access',
      category: 'EMPLOYEE_CREDENTIAL',
      icon: Users,
      severity: 'HIGH',
      rule: 'RULE-101-CREDENTIAL-DECOY',
      description: 'Simulates a malicious insider discovering and attempting to authenticate using a fake employee identity planted in internal HR directories.',
      actor: '10.10.4.105 (Insider Workstation)'
    },
    {
      id: 'simulate_decoy_api_key',
      title: '2. Simulate Decoy API Key Usage',
      category: 'API_KEY',
      icon: Key,
      severity: 'HIGH',
      rule: 'RULE-102-API-KEY-EXFILTRATION',
      description: 'Simulates a developer or external adversary invoking internal cloud microservices using a leaked canary API key found in source code.',
      actor: '192.168.10.22 (Dev Machine)'
    },
    {
      id: 'simulate_fake_database',
      title: '3. Simulate Fake Database Access',
      category: 'DATABASE_CREDENTIAL',
      icon: Database,
      severity: 'HIGH',
      rule: 'RULE-103-DATABASE-CREDENTIAL-TAMPERING',
      description: 'Simulates an insider executing reconnaissance SQL queries against a planted decoy database connection string.',
      actor: '10.10.4.19 (Database Explorer)'
    },
    {
      id: 'simulate_confidential_file',
      title: '4. Simulate Confidential File Access',
      category: 'DECOY_DOCUMENT',
      icon: FileText,
      severity: 'HIGH',
      rule: 'RULE-104-CONFIDENTIAL-DOC-LEAK',
      description: 'Simulates an employee exfiltrating a high-value restricted M&A financial assessment document from corporate SharePoint.',
      actor: '10.10.1.80 (Laptop Client)'
    },
    {
      id: 'simulate_multiple_suspicious',
      title: '5. Simulate Multiple Suspicious Attempts',
      category: 'MULTI_VECTOR_BURST',
      icon: Flame,
      severity: 'CRITICAL',
      rule: 'RULE-201-BURST-CORRELATION',
      description: 'Simulates a coordinated rapid credential-stuffing spray across 3 decoy vectors from a single host, immediately triggering CRITICAL threat escalation.',
      actor: '10.10.9.99 (Rapid Spray Host)'
    }
  ];

  const handleRunAttack = async (attack) => {
    setLoadingType(attack.id);
    setLastResult(null);

    try {
      const res = await api.simulateLabAttack(attack.id);
      setLastResult({
        ...res,
        attackMeta: attack
      });

      if (onAttackSimulated) {
        onAttackSimulated(res.result?.alert || res.result?.event);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
      alert(err.message || 'Simulation failed');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-400" />
            <span>Security Lab Demonstration Console</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Execute 1-click simulated insider threat vectors to showcase real-time deception detection for faculty and evaluators.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Local Sandbox &bull; 100% Safe Execution</span>
        </div>
      </div>

      {/* Main Layout: 5 Attack Buttons on Left, Simulation Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 5 Attack Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {attacks.map((atk, index) => {
            const Icon = atk.icon;
            const isLoading = loadingType === atk.id;
            const isCritical = atk.severity === 'CRITICAL';

            return (
              <div
                key={atk.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border-red-500/40 hover:border-red-500/70'
                    : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg border mt-0.5 ${
                      isCritical
                        ? 'bg-red-950 text-red-400 border-red-500/50'
                        : 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-100 font-mono">{atk.title}</h3>
                        <SeverityBadge severity={atk.severity} />
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                        {atk.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>Expected Rule: <span className="text-amber-400">{atk.rule}</span></span>
                        <span>Source: <span className="text-rose-400">{atk.actor}</span></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunAttack(atk)}
                    disabled={isLoading}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all shadow-md disabled:opacity-50 ${
                      isCritical
                        ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-950/60'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-950/40'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? 'Executing...' : 'Run Attack'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Real-Time Attack Response Inspector (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>ATTACK SIMULATION LIVE INSPECTOR</span>
              </div>
              {lastResult && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold">
                  DETECTED
                </span>
              )}
            </div>

            {!lastResult ? (
              <div className="p-12 text-center rounded-lg bg-black/60 border border-dashed border-slate-800 text-xs font-mono text-slate-400">
                <FlaskConical className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p>Select any of the 5 simulation buttons to launch a live test attack and review the detection pipeline response here.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Result Title Banner */}
                <div className="p-3.5 rounded-lg bg-black border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Simulation Target:</span>
                    <SeverityBadge severity={lastResult.final_severity || lastResult.result?.severity} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-mono">{lastResult.simulation_name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">{lastResult.message}</p>
                </div>

                {/* Pipeline Step-by-Step Breakdown */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">1. Decoy Touched:</span>
                    <span className="text-cyan-300 font-semibold">{lastResult.result?.event?.token_name || 'Decoy Asset'}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">2. Detection Rule Fired:</span>
                    <span className="text-amber-400 font-bold">{lastResult.rule_fired || lastResult.result?.rule}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">3. Anomaly Score:</span>
                    <span className="text-red-400 font-bold">{lastResult.result?.anomaly_score || 90}%</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">4. Generated Alert UUID:</span>
                    <span className="text-emerald-400 font-semibold">{lastResult.result?.alert?.alert_uuid}</span>
                  </div>
                </div>

                {/* Raw Intercepted Payload */}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Intercepted Payload:</span>
                  <div className="p-2.5 rounded bg-black border border-slate-800 text-[11px] font-mono text-emerald-400 break-all select-all">
                    <code>{lastResult.result?.event?.payload_preview}</code>
                  </div>
                </div>

              </div>
            )}
          </div>

          {lastResult && (
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Audit trail updated in DB</span>
              <button
                onClick={() => onInvestigateAlert && onInvestigateAlert(lastResult.result?.alert)}
                className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <span>Investigate in Alerts Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
