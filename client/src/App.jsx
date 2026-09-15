import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SubscriptionBanner from './components/SubscriptionBanner';
import PaywallModal from './components/PaywallModal';

import PublicHome from './pages/PublicHome';
import PublicTrack from './pages/PublicTrack';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminTickets from './pages/AdminTickets';
import AdminInventory from './pages/AdminInventory';
import AdminBilling from './pages/AdminBilling';
import AdminSubscription from './pages/AdminSubscription';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminPage = currentPage.startsWith('admin-');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Admin Subscription Banner if in admin section */}
      {isAdminPage && isAuthenticated && (
        <SubscriptionBanner onNavigate={handleNavigate} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Admin Sidebar if in admin section */}
        {isAdminPage && isAuthenticated && (
          <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
        )}

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${isAdminPage && isAuthenticated ? 'max-w-7xl mx-auto' : 'w-full'}`}>
          {/* Public Pages */}
          {currentPage === 'home' && <PublicHome onNavigate={handleNavigate} />}
          {currentPage === 'track' && (
            <PublicTrack query={pageParams.query || ''} onNavigate={handleNavigate} />
          )}
          {currentPage === 'admin-login' && <AdminLogin onNavigate={handleNavigate} />}

          {/* Admin Pages (Requires Auth) */}
          {isAdminPage && !isAuthenticated && (
            <AdminLogin onNavigate={handleNavigate} />
          )}

          {isAdminPage && isAuthenticated && (
            <>
              {currentPage === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
              {currentPage === 'admin-tickets' && <AdminTickets onNavigate={handleNavigate} />}
              {currentPage === 'admin-inventory' && (
                <AdminInventory onNavigate={handleNavigate} />
              )}
              {currentPage === 'admin-billing' && (
                <AdminBilling initialTicketId={pageParams.ticketId} onNavigate={handleNavigate} />
              )}
              {currentPage === 'admin-subscription' && (
                <AdminSubscription onNavigate={handleNavigate} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Paywall Modal */}
      <PaywallModal />

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">TechFix Pro Care Hub</span>
            <span>• Multi-Brand Laptop, Desktop & Mobile Repair Station</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNavigate('home')} className="hover:underline">Services</button>
            <button onClick={() => handleNavigate('track')} className="hover:underline">Live Tracker</button>
            <button onClick={() => handleNavigate(isAuthenticated ? 'admin-dashboard' : 'admin-login')} className="hover:underline">
              {isAuthenticated ? 'Admin Suite' : 'Admin Login'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <MainApp />
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
