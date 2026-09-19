import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { isAuthenticated, admin, updateAdmin } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallReason, setPaywallReason] = useState('');

  const [ownerPaymentConfig, setOwnerPaymentConfig] = useState({
    upiId: 'guptaabhijeet396@okhdfcbank',
    payeeName: 'Abhijeet Gupta'
  });

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/status');
      if (res.data.success) {
        setSubscription(res.data.subscription);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPlansAndConfig = useCallback(async () => {
    try {
      const res = await api.get('/subscriptions/payment-config');
      if (res.data.success) {
        if (res.data.plans) setPlans(res.data.plans);
        setOwnerPaymentConfig({
          upiId: res.data.upiId || 'guptaabhijeet396@okhdfcbank',
          payeeName: res.data.payeeName || 'Abhijeet Gupta'
        });
      }
    } catch (err) {
      // Fallback to /plans if payment-config not available
      try {
        const plansRes = await api.get('/subscriptions/plans');
        if (plansRes.data.success) setPlans(plansRes.data.plans);
      } catch (e) {
        console.error('Failed to fetch plans:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchPlansAndConfig();
  }, [fetchPlansAndConfig]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription();
    }
  }, [isAuthenticated, fetchSubscription]);

  // Listen for 402 Subscription Required event from api.js
  useEffect(() => {
    const handleSubRequired = (event) => {
      setPaywallReason(event.detail?.message || 'Subscription required or expired');
      setShowPaywallModal(true);
    };

    window.addEventListener('techfix_subscription_required', handleSubRequired);
    return () => window.removeEventListener('techfix_subscription_required', handleSubRequired);
  }, []);

  const upgradePlan = async (planId, paymentReference = '', billingCycle = 'monthly') => {
    try {
      const res = await api.post('/subscriptions/upgrade', {
        planId,
        paymentReference,
        utr: paymentReference,
        billingCycle
      });
      if (res.data.success) {
        setSubscription(res.data.subscription);
        if (res.data.admin && updateAdmin) {
          updateAdmin(res.data.admin);
        }
        return {
          success: true,
          message: res.data.message,
          transactionId: res.data.transactionId,
          subscription: res.data.subscription
        };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Upgrade failed' };
    }
  };

  const simulateToggle = async (status) => {
    try {
      const res = await api.post('/subscriptions/simulate-toggle', { status });
      if (res.data.success) {
        await fetchSubscription();
        return { success: true };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false };
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      plans,
      loading,
      showPaywallModal,
      paywallReason,
      openPaywall: (reason = '') => {
        setPaywallReason(reason);
        setShowPaywallModal(true);
      },
      closePaywall: () => setShowPaywallModal(false),
      refreshSubscription: fetchSubscription,
      ownerPaymentConfig,
      upgradePlan,
      simulateToggle
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
