import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LiveAlertToast from '../components/LiveAlertToast';

export default function DashboardLayout({
  children,
  currentPage,
  setCurrentPage,
  user,
  stats,
  onLogout,
  onRefresh,
  onResetDemo,
  autoRefresh,
  setAutoRefresh,
  activeToastAlert,
  onDismissToast,
  onInvestigateAlert
}) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        stats={stats}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar */}
        <Navbar
          user={user}
          stats={stats}
          onRefresh={onRefresh}
          onResetDemo={onResetDemo}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 cyber-grid">
          {children}
        </main>
      </div>

      {/* Real-Time Alert Toast Notification */}
      {activeToastAlert && (
        <LiveAlertToast
          alert={activeToastAlert}
          onDismiss={onDismissToast}
          onInvestigate={(alert) => {
            onInvestigateAlert(alert);
            onDismissToast();
          }}
        />
      )}

    </div>
  );
}
