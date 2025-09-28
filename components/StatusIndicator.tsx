import React from 'react';
import { SyncStatus } from '../types';
import { CloudIcon } from './icons/CloudIcon';
import { PlugIcon } from './icons/PlugIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface StatusIndicatorProps {
  status: SyncStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const statusConfig = {
      [SyncStatus.OFFLINE]: {
        text: 'Offline',
        icon: <PlugIcon className="w-5 h-5" />,
        colorClass: 'text-text-tertiary',
        bgColorClass: 'bg-surface',
      },
      [SyncStatus.CONNECTING]: {
        text: 'Connecting...',
        icon: <SpinnerIcon className="w-5 h-5 animate-spin-slow" />,
        colorClass: 'text-warning',
        bgColorClass: 'bg-warning/10',
      },
      [SyncStatus.LIVE]: {
        text: 'Live Sync',
        icon: <CloudIcon className="w-5 h-5" />,
        colorClass: 'text-success',
        bgColorClass: 'bg-success/10',
      },
      [SyncStatus.ERROR]: {
        text: 'Error',
        icon: <PlugIcon className="w-5 h-5" />,
        colorClass: 'text-danger',
        bgColorClass: 'bg-danger/10',
      },
    };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.colorClass} ${config.bgColorClass}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};