import React from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useAllInspections } from '../hooks/useInspections';
import { useCustomers } from '../hooks/useCustomers';
import { CarIcon } from './icons/CarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-surface p-4 rounded-lg flex items-center gap-4 border border-line">
    <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

export const StatsBar: React.FC = () => {
  const vehicles = useVehicles();
  const inspections = useAllInspections();
  const customers = useCustomers();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-text-primary">At a Glance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<CarIcon className="w-5 h-5 text-accent" />}
          label="Total Vehicles"
          value={vehicles.length}
        />
        <StatCard 
          icon={<TrendingUpIcon className="w-5 h-5 text-accent" />}
          label="Total Inspections"
          value={inspections.length}
        />
        <StatCard 
          icon={<UsersIcon className="w-5 h-5 text-accent" />}
          label="Total Customers"
          value={customers.length}
        />
      </div>
    </div>
  );
};