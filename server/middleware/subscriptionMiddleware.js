export const requireActiveSubscription = (req, res, next) => {
  const admin = req.admin;

  if (!admin) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const sub = admin.subscription || {};
  const isExpired = sub.expiresAt && new Date(sub.expiresAt) < new Date();
  const isStatusInactive = sub.status === 'EXPIRED' || sub.status === 'PAST_DUE';

  if (isExpired || isStatusInactive) {
    return res.status(402).json({
      success: false,
      requiresSubscription: true,
      message: 'Your shop subscription has expired or payment is pending. Please renew your plan to continue using this feature.',
      subscription: {
        plan: sub.plan || 'NONE',
        status: isExpired ? 'EXPIRED' : sub.status,
        expiresAt: sub.expiresAt
      }
    });
  }

  next();
};
