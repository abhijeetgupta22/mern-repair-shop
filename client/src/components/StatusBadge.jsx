import React from 'react';
import {
  Inbox,
  Search,
  Clock,
  Wrench,
  CheckCircle2,
  PackageCheck,
  CheckCheck,
  XCircle
} from 'lucide-react';

export const STATUS_CONFIG = {
  RECEIVED: {
    label: 'Received',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: Inbox,
    description: 'Device logged and queued for inspection'
  },
  DIAGNOSING: {
    label: 'Diagnosing',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: Search,
    description: 'Hardware testing and fault analysis in progress'
  },
  WAITING_PARTS: {
    label: 'Waiting for Parts',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Clock,
    description: 'Required replacement spare ordered from distributor'
  },
  IN_REPAIR: {
    label: 'In Repair',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    icon: Wrench,
    description: 'Active repair and component replacement by technician'
  },
  QUALITY_CHECK: {
    label: 'Quality Check',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    icon: CheckCircle2,
    description: 'Multi-point stress testing and sensory verification'
  },
  READY_FOR_DELIVERY: {
    label: 'Ready for Delivery',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 animate-pulse',
    icon: PackageCheck,
    description: 'Repair completed & certified! Ready for customer pickup'
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    icon: CheckCheck,
    description: 'Device handed over to customer'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: XCircle,
    description: 'Repair cancelled or rejected'
  }
};

export default function StatusBadge({ status, size = 'md', showIcon = true }) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.RECEIVED;
  const Icon = conf.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm md:text-base px-3.5 py-1.5 gap-2 font-semibold'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${conf.color} ${sizeClasses[size] || sizeClasses.md}`}
    >
      {showIcon && <Icon className={iconSizes[size] || iconSizes.md} />}
      <span>{conf.label}</span>
    </span>
  );
}
