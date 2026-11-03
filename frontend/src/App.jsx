import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HoneytokensPage from './pages/HoneytokensPage';
import DeceptionPage from './pages/DeceptionPage';
import SecurityLabPage from './pages/SecurityLabPage';
import AlertsPage from './pages/AlertsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('honeyguard_user');
    const token = localStorage.getItem('honeyguard_token');
    return saved && token ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [honeytokens, setHoneytokens] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeToastAlert, setActiveToastAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load telemetry data from backend
  const loadData = useCallback(async (isInitial = false) => {
    if (!localStorage.getItem('honeyguard_token')) return;

    try {
      const [dashRes, tokensRes, alertsRes] = await Promise.all([
        api.getDashboardStats().catch(() => ({})),
        api.getHoneytokens().catch(() => ({ data: [] })),
        api.getAlerts().catch(() => ({ data: [] }))
      ]);

      if (dashRes.success) {
        setDashboardData(dashRes.data);
      }
      if (tokensRes.data) {
        setHoneytokens(tokensRes.data);
      }
      if (alertsRes.data) {
        setAlerts(alertsRes.data);
      }
    } catch (err) {
      console.error('Data sync error:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      loadData(true);
    } else {
      setLoading(false);
    }
  }, [user, loadData]);

  // Polling effect every 5 seconds
  useEffect(() => {
    if (!user || !autoRefresh) return;
    const interval = setInterval(() => {
      loadData(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [user, autoRefresh, loadData]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('honeyguard_token');
    localStorage.removeItem('honeyguard_user');
    setUser(null);
    setCurrentPage('dashboard');
  };

  // Called when a honeytoken is touched
  const handleThreatDetected = (newAlert) => {
    if (newAlert) {
      setActiveToastAlert(newAlert);
    }
    loadData(false);
  };

  // Called to update alert status
  const handleUpdateAlertStatus = async (alertId, newStatus, notes = '') => {
    await api.reviewAlert(alertId, newStatus, notes);
    loadData(false);
  };

  // Called to update honeytoken
  const handleUpdateToken = async (id, data) => {
    const res = await api.updateHoneytoken(id, data);
    loadData(false);
    return res;
  };

  // Called to delete honeytoken
  const handleDeleteToken = async (id) => {
    const res = await api.deleteHoneytoken(id);
    loadData(false);
    return res;
  };

  // Reset demo data handler
  const handleResetDemoData = async () => {
    await api.resetDemoData();
    await loadData(false);
  };

  // If not logged in, render the login page
  if (!user) {
    return <LoginPage onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <DashboardLayout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      user={user}
      stats={dashboardData?.stats}
      onLogout={handleLogout}
      onRefresh={() => loadData(false)}
      onResetDemo={handleResetDemoData}
      autoRefresh={autoRefresh}
      setAutoRefresh={setAutoRefresh}
      activeToastAlert={activeToastAlert}
      onDismissToast={() => setActiveToastAlert(null)}
      onInvestigateAlert={(alert) => {
        setCurrentPage('alerts');
      }}
    >
      {currentPage === 'dashboard' && (
        <DashboardPage
          data={dashboardData}
          onNavigate={(page) => setCurrentPage(page)}
          onInvestigateEvent={(event) => setCurrentPage('alerts')}
        />
      )}

      {currentPage === 'honeytokens' && (
        <HoneytokensPage
          tokens={honeytokens}
          onRefresh={() => loadData(false)}
          onCreateToken={() => loadData(false)}
          onUpdateToken={handleUpdateToken}
          onDeleteToken={handleDeleteToken}
        />
      )}

      {currentPage === 'deception' && (
        <DeceptionPage
          onThreatDetected={handleThreatDetected}
        />
      )}

      {currentPage === 'security-lab' && (
        <SecurityLabPage
          onAttackSimulated={handleThreatDetected}
          onInvestigateAlert={(alert) => setCurrentPage('alerts')}
        />
      )}

      {currentPage === 'alerts' && (
        <AlertsPage
          alerts={alerts}
          onRefresh={() => loadData(false)}
          onUpdateAlertStatus={handleUpdateAlertStatus}
        />
      )}

      {currentPage === 'logs' && (
        <ActivityLogsPage />
      )}

      {currentPage === 'analytics' && (
        <AnalyticsPage
          analyticsData={dashboardData}
          onRefresh={() => loadData(false)}
        />
      )}

      {currentPage === 'settings' && (
        <SettingsPage
          user={user}
          onPasswordChanged={() => {}}
          onResetDemoData={handleResetDemoData}
        />
      )}
    </DashboardLayout>
  );
}
