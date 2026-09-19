import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionPaymentModal from './SubscriptionPaymentModal';

export default function PaywallModal() {
  const { showPaywallModal, closePaywall, paywallReason } = useSubscription();

  return (
    <SubscriptionPaymentModal
      isOpen={showPaywallModal}
      onClose={closePaywall}
      initialPlanId="3_MONTHS"
      reason={paywallReason}
    />
  );
}

