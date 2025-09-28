import React, { useState } from 'react';
import type { Vehicle } from '../types';
import { useVehicles } from '../hooks/useVehicles';
import { VehicleList } from '../components/VehicleList';
import { localDB } from '../services/localDB';

interface FleetPageProps {
  onEditVehicle: (vehicle: Vehicle) => void;
  onViewInspections: (vehicle: Vehicle) => void;
}

export const FleetPage: React.FC<FleetPageProps> = ({ onEditVehicle, onViewInspections }) => {
  const vehicles = useVehicles();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedVehicleIds([]); // Reset selection when toggling mode
  };

  const handleToggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedVehicleIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedVehicleIds.length} vehicle(s) and all their associated inspections? This action cannot be undone.`)) {
      try {
        // Find all inspections associated with the selected vehicles
        const inspectionsToDelete = await localDB.inspections
          .where('vehicleId').anyOf(selectedVehicleIds)
          .toArray();
        const inspectionIdsToDelete = inspectionsToDelete.map(i => i.id);

        // Perform deletions in a transaction
        // FIX: Cast localDB to 'any' to resolve TypeScript error where 'transaction' method is not found on the subclassed Dexie instance.
        await (localDB as any).transaction('rw', localDB.inspections, localDB.vehicles, async () => {
          if (inspectionIdsToDelete.length > 0) {
            await localDB.inspections.bulkDelete(inspectionIdsToDelete);
          }
          await localDB.vehicles.bulkDelete(selectedVehicleIds);
        });
        
        // Exit selection mode
        toggleSelectionMode();
      } catch (error) {
        console.error("Failed to bulk delete vehicles:", error);
        alert("An error occurred during bulk deletion. Please check the console.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-text-primary">My Fleet ({vehicles.length})</h2>
        <div className="flex gap-2">
            {isSelectionMode && selectedVehicleIds.length > 0 && (
                <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 flex items-center gap-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-danger hover:opacity-90 transition-colors"
                >
                    Delete ({selectedVehicleIds.length})
                </button>
            )}
            <button
                onClick={toggleSelectionMode}
                className={`px-4 py-2 flex items-center gap-2 rounded-md shadow-sm text-sm font-semibold ${isSelectionMode ? 'bg-surface text-text-secondary border border-line' : 'bg-accent text-text-inverted'}`}
            >
                {isSelectionMode ? 'Cancel' : 'Select'}
            </button>
        </div>
      </div>
      <VehicleList 
        vehicles={vehicles} 
        onEdit={onEditVehicle} 
        onViewInspections={onViewInspections}
        isSelectionMode={isSelectionMode}
        selectedVehicleIds={selectedVehicleIds}
        onToggleSelection={handleToggleVehicleSelection}
      />
    </div>
  );
};