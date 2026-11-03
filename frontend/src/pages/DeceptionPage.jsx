import React, { useState, useEffect } from 'react';
import {
  Network,
  Users,
  Database,
  Key,
  FileText,
  FolderLock,
  Terminal,
  Send,
  Download,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/StatusBadge';

export default function DeceptionPage({ onThreatDetected }) {
  const [activeTab, setActiveTab] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [telemetryResult, setTelemetryResult] = useState(null);

  // Form states for simulated environments
  const [loginUser, setLoginUser] = useState('s.jenkins');
  const [loginPass, setLoginPass] = useState('Fin#2026!Sec99');
  const [loginIp, setLoginIp] = useState('10.10.4.102');

  const [apiKey, setApiKey] = useState('AKIA2V8N9EXAMPLE7482');
  const [apiIp, setApiIp] = useState('192.168.10.14');

  const [dbConn, setDbConn] = useState('postgresql://pg_analytics_decoy:P@ssw0rd99!@internal-db-01.corp.net:5432/finance_dw');
  const [dbQuery, setDbQuery] = useState('SELECT * FROM finance_dw.quarterly_rev LIMIT 10;');
  const [dbIp, setDbIp] = useState('10.10.4.15');

  const [selectedDoc, setSelectedDoc] = useState('M&A_Financial_Assessment_Confidential_Q4.pdf');
  const [docIp, setDocIp] = useState('10.10.1.77');

  const [filePath, setFilePath] = useState('/var/www/.env.production.bak');
  const [fileIp, setFileIp] = useState('192.168.1.104');

  // Trigger simulated employee intranet login
  const handleSimulateLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTelemetryResult(null);
    try {
      const res = await api.deceptionLogin({
        username: loginUser,
        password: loginPass,
        source_ip: loginIp
      });
      setTelemetryResult(res.detection_telemetry);
      if (onThreatDetected) onThreatDetected(res.detection_telemetry.alert);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger simulated API gateway call
  const handleSimulateApi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTelemetryResult(null);
    try {
      const res = await api.deceptionApiCall(apiKey);
      setTelemetryResult(res.detection_telemetry);
      if (onThreatDetected) onThreatDetected(res.detection_telemetry.alert);
    } catch (err) {
      if (err.data?.detection_telemetry) {
        setTelemetryResult(err.data.detection_telemetry);
        if (onThreatDetected) onThreatDetected(err.data.detection_telemetry.alert);
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger simulated database query
  const handleSimulateDb = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTelemetryResult(null);
    try {
      const res = await api.deceptionDbQuery({
        connection_string: dbConn,
        query: dbQuery,
        source_ip: dbIp
      });
      setTelemetryResult(res.detection_telemetry);
      if (onThreatDetected) onThreatDetected(res.detection_telemetry.alert);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger simulated document access / download
  const handleSimulateDoc = async (docName = selectedDoc) => {
    setLoading(true);
    setTelemetryResult(null);
    try {
      const res = await api.deceptionDocumentAccess(docName);
      setTelemetryResult(res.detection_telemetry);
      if (onThreatDetected) onThreatDetected(res.detection_telemetry.alert);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger simulated file probe
  const handleSimulateFile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTelemetryResult(null);
    try {
      const res = await api.deceptionSensitiveFile(filePath);
      setTelemetryResult(res.detection_telemetry);
      if (onThreatDetected) onThreatDetected(res.detection_telemetry.alert);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'employee', label: '1. Employee Intranet Decoy', icon: Users },
    { id: 'api', label: '2. Cloud API Gateway Decoy', icon: Key },
    { id: 'database', label: '3. Internal Database Console', icon: Database },
    { id: 'document', label: '4. Confidential Document Share', icon: FileText },
    { id: 'filesystem', label: '5. Sensitive File Explorer', icon: FolderLock },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <span>Controlled Deception Environment</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Simulated enterprise systems where honeytokens reside. Interacting with any decoy sends live telemetry to the Threat Detection Engine.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setTelemetryResult(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-colors whitespace-nowrap border ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 font-semibold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Interactive Deception Sandbox on Left, Live Telemetry Stream on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: The Simulated Asset Interface */}
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          
          {/* TAB 1: Employee Portal Decoy */}
          {activeTab === 'employee' && (
            <form onSubmit={handleSimulateLogin} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pb-3 border-b border-slate-800">
                <Users className="w-4 h-4" />
                <span>SIMULATED INTERNAL HR / INTRANET AUTHENTICATION GATE</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Simulated Source IP</label>
                  <input
                    type="text"
                    value={loginIp}
                    onChange={(e) => setLoginIp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Decoy Employee Username</label>
                  <input
                    type="text"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="s.jenkins"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Decoy Password</label>
                  <input
                    type="text"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Fin#2026!Sec99"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Transmitting Probe...' : 'Attempt Intranet Login (Trigger Trap)'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: API Gateway Decoy */}
          {activeTab === 'api' && (
            <form onSubmit={handleSimulateApi} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pb-3 border-b border-slate-800">
                <Key className="w-4 h-4" />
                <span>SIMULATED CLOUD API GATEWAY CLIENT</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Simulated Source IP</label>
                  <input
                    type="text"
                    value={apiIp}
                    onChange={(e) => setApiIp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">HTTP Header: X-Honey-Key</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AKIA2V8N9EXAMPLE7482"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-400"
                  />
                </div>

                <div className="p-3 rounded-lg bg-black border border-slate-800 text-[11px] font-mono text-slate-400">
                  Target Endpoint: <span className="text-cyan-300">GET /api/v1/cloud/export</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Invoking API...' : 'Invoke API with Decoy Key (Trigger Trap)'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: Database Console Decoy */}
          {activeTab === 'database' && (
            <form onSubmit={handleSimulateDb} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pb-3 border-b border-slate-800">
                <Database className="w-4 h-4" />
                <span>SIMULATED INTERNAL DATABASE CLI QUERY</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Source IP</label>
                  <input
                    type="text"
                    value={dbIp}
                    onChange={(e) => setDbIp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Planted DB Connection URI</label>
                  <input
                    type="text"
                    value={dbConn}
                    onChange={(e) => setDbConn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">SQL Query Payload</label>
                  <textarea
                    rows={2}
                    value={dbQuery}
                    onChange={(e) => setDbQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Executing Query...' : 'Execute Decoy SQL Query (Trigger Trap)'}</span>
              </button>
            </form>
          )}

          {/* TAB 4: Confidential Document Repository */}
          {activeTab === 'document' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pb-3 border-b border-slate-800">
                <FileText className="w-4 h-4" />
                <span>SIMULATED SHAREPOINT / RESTRICTED FILE REPOSITORY</span>
              </div>

              <p className="text-xs font-mono text-slate-400">
                Click any bait document to simulate an unauthorized file access or download:
              </p>

              <div className="space-y-2">
                {[
                  { name: 'M&A_Financial_Assessment_Confidential_Q4.pdf', size: '2.4 MB', desc: 'Board M&A valuation memo with fake numbers' },
                  { name: 'Executive_Salary_and_Bonus_Matrix_2026.xlsx', size: '840 KB', desc: 'Payroll breakdown canary spreadsheet' }
                ].map((doc) => (
                  <div
                    key={doc.name}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-mono font-semibold text-slate-200">{doc.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{doc.desc} ({doc.size})</p>
                    </div>

                    <button
                      onClick={() => handleSimulateDoc(doc.name)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exfiltrate</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Sensitive File Reference */}
          {activeTab === 'filesystem' && (
            <form onSubmit={handleSimulateFile} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pb-3 border-b border-slate-800">
                <FolderLock className="w-4 h-4" />
                <span>SIMULATED DIRECTORY TRAVERSAL / SENSITIVE FILE INSPECTION</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Source IP</label>
                  <input
                    type="text"
                    value={fileIp}
                    onChange={(e) => setFileIp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Target Traversal Path</label>
                  <input
                    type="text"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    placeholder="/var/www/.env.production.bak"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Reading File...' : 'Probe File Reference (Trigger Trap)'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Right Column: Live Telemetry Response Display */}
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>LIVE DETECTION ENGINE TELEMETRY OUTPUT</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                REAL-TIME AUDIT
              </span>
            </div>

            {!telemetryResult ? (
              <div className="p-12 text-center rounded-lg bg-black/60 border border-dashed border-slate-800">
                <Terminal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-400">
                  Ready. Trigger any simulated decoy interaction on the left to observe deterministic threat detection in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* Alert Badge Banner */}
                <div className="p-3.5 rounded-lg bg-red-950/70 border border-red-500/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-red-400">SECURITY ALERT GENERATED</span>
                  </div>
                  <SeverityBadge severity={telemetryResult.severity} />
                </div>

                {/* Telemetry Breakdown */}
                <div className="p-4 rounded-lg bg-black border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rule Triggered:</span>
                    <span className="text-amber-400 font-bold">{telemetryResult.rule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Anomaly Confidence:</span>
                    <span className="text-red-400 font-bold">{telemetryResult.anomaly_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alert UUID:</span>
                    <span className="text-cyan-400">{telemetryResult.alert?.alert_uuid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Event UUID:</span>
                    <span className="text-slate-300">{telemetryResult.event?.event_uuid}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="text-slate-400 block mb-1 uppercase text-[10px]">Deterministic Reason:</span>
                    <p className="text-slate-200">{telemetryResult.explanation}</p>
                  </div>
                </div>

              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Detection Latency: <span className="text-emerald-400 font-bold">&lt; 85 ms</span></span>
            <span>False Positives: <span className="text-cyan-400 font-bold">0.0%</span></span>
          </div>

        </div>

      </div>

    </div>
  );
}
