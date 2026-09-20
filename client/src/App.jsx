import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import SubscriptionBanner from './components/SubscriptionBanner';
import PaywallModal from './components/PaywallModal';
import ShopSetupModal from './components/ShopSetupModal';

import PublicHome from './pages/PublicHome';
import PublicTrack from './pages/PublicTrack';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminTickets from './pages/AdminTickets';
import AdminInventory from './pages/AdminInventory';
import AdminBilling from './pages/AdminBilling';
import AdminSubscription from './pages/AdminSubscription';
import ErrorBoundary from './components/ErrorBoundary';

function getInitialPage() {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  const target = hash || path;

  if (target.includes('login') || target.includes('admin-login') || target === 'admin') {
    return 'admin-login';
  }
  if (target.includes('track')) return 'track';
  if (target.includes('dashboard')) return 'admin-dashboard';
  if (target.includes('ticket')) return 'admin-tickets';
  if (target.includes('inventory')) return 'admin-inventory';
  if (target.includes('bill') || target.includes('invoice')) return 'admin-billing';
  if (target.includes('subscri')) return 'admin-subscription';
  return 'home';
}

function MainApp() {
  const { isAuthenticated, admin } = useAuth();
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [pageParams, setPageParams] = useState({});
  const [showShopSetup, setShowShopSetup] = useState(false);
  const [isServerWakingUp, setIsServerWakingUp] = useState(false);

  // Listen for cloud server cold-start indicator
  useEffect(() => {
    const handleWakingUp = (e) => {
      setIsServerWakingUp(!!e.detail?.wakingUp);
    };
    window.addEventListener('techfix_server_waking_up', handleWakingUp);
    return () => window.removeEventListener('techfix_server_waking_up', handleWakingUp);
  }, []);

  // Auto prompt shop setup when admin opens the website right after login if not yet configured
  useEffect(() => {
    if (isAuthenticated && admin && admin.isConfigured === false) {
      setShowShopSetup(true);
    }
  }, [isAuthenticated, admin?.isConfigured]);

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser URL hash change & back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const detected = getInitialPage();
      setCurrentPage(detected);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const isAdminSection = currentPage.startsWith('admin-') && currentPage !== 'admin-login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Cloud Server Warming Up Notice (For Free Cloud Tier Cold-Starts) */}
      {isServerWakingUp && (
        <div className="bg-amber-500 text-slate-950 text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-sm z-30 animate-pulse">
          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          <span>Connecting to cloud server... Free hosting server is waking up (~30s on first request). Please wait.</span>
        </div>
      )}

      {/* Admin Subscription Banner if inside protected admin workspace */}
      {isAdminSection && isAuthenticated && (
        <SubscriptionBanner onNavigate={handleNavigate} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex w-full">
        {/* Admin Sidebar (Desktop >= 1024px) */}
        {isAdminSection && isAuthenticated && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onOpenShopProfile={() => setShowShopSetup(true)}
          />
        )}

        <main className={`flex-1 p-3 sm:p-6 lg:p-8 ${isAdminSection && isAuthenticated ? 'max-w-7xl mx-auto w-full pb-28 lg:pb-8' : 'w-full'}`}>
          <ErrorBoundary key={currentPage} onReset={() => handleNavigate(isAuthenticated ? 'admin-dashboard' : 'home')}>
            {/* Public Pages */}
            {currentPage === 'home' && <PublicHome onNavigate={handleNavigate} />}
            {currentPage === 'track' && (
              <PublicTrack query={pageParams.query || ''} onNavigate={handleNavigate} />
            )}

            {/* Admin Login Page */}
            {currentPage === 'admin-login' && (
              <AdminLogin onNavigate={handleNavigate} />
            )}

            {/* Protected Admin Pages (Renders login if unauthenticated) */}
            {isAdminSection && !isAuthenticated && (
              <AdminLogin onNavigate={handleNavigate} />
            )}

            {/* Protected Admin Pages (When Authenticated) */}
            {isAdminSection && isAuthenticated && (
              <>
                {currentPage === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
                {currentPage === 'admin-tickets' && <AdminTickets initialTab={pageParams.tab} onNavigate={handleNavigate} />}
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
          </ErrorBoundary>
        </main>
      </div>

      {/* Admin Mobile Bottom Navigation Bar (Phones & Tablets < 1024px) */}
      {isAdminSection && isAuthenticated && (
        <MobileBottomNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenShopProfile={() => setShowShopSetup(true)}
        />
      )}

      {/* Paywall Modal */}
      <PaywallModal />

      {/* Shop Profile & Setup Modal (Global Admin Access) */}
      <ShopSetupModal
        isOpen={showShopSetup}
        onClose={() => setShowShopSetup(false)}
        isFirstTime={admin && admin.isConfigured === false}
      />

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">TechFix Pro Care Hub</span>
            <span>• Multi-Brand Laptop, Desktop & Mobile Repair Station</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#home" onClick={(e) => { e.preventDefault(); handleNavigate('home'); }} className="hover:underline">
              Services
            </a>
            <a href="#track" onClick={(e) => { e.preventDefault(); handleNavigate('track'); }} className="hover:underline">
              Live Tracker
            </a>
            <a
              href={isAuthenticated ? '#admin-dashboard' : '#admin-login'}
              onClick={(e) => { e.preventDefault(); handleNavigate(isAuthenticated ? 'admin-dashboard' : 'admin-login'); }}
              className="hover:underline font-semibold text-blue-600 dark:text-blue-400"
            >
              {isAuthenticated ? 'Admin Suite' : 'Admin Login'}
            </a>
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
