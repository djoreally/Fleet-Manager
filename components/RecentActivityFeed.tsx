import React from 'react';
import { ClockIcon } from './icons/ClockIcon';
import { CarIcon } from './icons/CarIcon';
import { UserIcon } from './icons/UserIcon';

const sampleActivities = [
  { id: 1, icon: <CarIcon className="w-5 h-5 text-text-secondary" />, text: 'Inspection for Ford F-150 completed.' },
  { id: 2, icon: <UserIcon className="w-5 h-5 text-text-secondary" />, text: 'New customer John Appleseed added.' },
  { id: 3, icon: <CarIcon className="w-5 h-5 text-text-secondary" />, text: 'Vehicle Toyota Camry added to fleet.' },
];

export const RecentActivityFeed: React.FC = () => {
  return (
    <div className="bg-surface rounded-lg shadow-lg border border-line h-full">
      <div className="p-4 border-b border-line flex items-center gap-2">
        <ClockIcon className="w-5 h-5 text-text-secondary" />
        <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
      </div>
      <div className="p-4">
        {sampleActivities.length > 0 ? (
          <ul className="space-y-3">
            {sampleActivities.map(activity => (
              <li key={activity.id} className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 mt-0.5">{activity.icon}</div>
                <p className="text-text-secondary">{activity.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-center text-text-tertiary py-4">No recent activity.</p>
        )}
      </div>
    </div>
  );
};