import React from 'react';
import type { Vehicle } from '../types';
import { VehicleCard } from './VehicleCard';

interface VehicleListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onViewInspections: (vehicle: Vehicle) => void;
  isSelectionMode: boolean;
  selectedVehicleIds: string[];
  onToggleSelection: (vehicleId: string) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onEdit, onViewInspections, isSelectionMode, selectedVehicleIds, onToggleSelection }) => {
  return (
    <div>
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onEdit={onEdit} 
              onViewInspections={onViewInspections}
              isSelectionMode={isSelectionMode}
              isSelected={selectedVehicleIds.includes(vehicle.id)}
              onToggleSelection={onToggleSelection}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-surface/50 rounded-lg border-2 border-dashed border-line">
          <h3 className="text-xl font-medium text-text-primary">No vehicles yet</h3>
          <p className="mt-2 text-text-secondary">
            Use the form above to add your first vehicle to the local database.
          </p>
        </div>
      )}
    </div>
  );
};