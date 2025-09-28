import React from 'react';
import type { Vehicle } from '../types';
import { NewInspectionQuickStart } from '../components/QuickActions';
import { StatsBar } from '../components/StatsBar';
import { RecentActivityFeed } from '../components/RecentActivityFeed';

interface DashboardPageProps {
  onVehicleAddedForInspection: (vehicle: Vehicle) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onVehicleAddedForInspection }) => {
  return (
    <div className="flex flex-col gap-8">
      <StatsBar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <NewInspectionQuickStart onVehicleAdded={onVehicleAddedForInspection} />
        </div>
        <div>
            <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
};