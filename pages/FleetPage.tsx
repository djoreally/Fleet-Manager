import React, { useState, useEffect, useCallback } from 'react';
import type { Vehicle } from '../types';
import { apiFetch } from '../services/api';
import { VehicleList } from '../components/VehicleList';
import { EditVehicleModal } from '../components/EditVehicleModal';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface FleetPageProps {
  onViewInspections: (vehicle: Vehicle) => void;
}

export const FleetPage: React.FC<FleetPageProps> = ({ onViewInspections }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('get-vehicles');
      setVehicles(data);
    } catch (err) {
      setError('Failed to fetch vehicles. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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
    if (confirm(`Are you sure you want to delete ${selectedVehicleIds.length} vehicle(s)? This action cannot be undone.`)) {
      try {
        await Promise.all(
          selectedVehicleIds.map(id => apiFetch(`delete-vehicle/${id}`, { method: 'DELETE' }))
        );
        await fetchVehicles();
        toggleSelectionMode();
      } catch (err) {
        console.error("Failed to bulk delete vehicles:", err);
        alert("An error occurred during bulk deletion. Please check the console.");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-center text-danger p-4">{error}</div>;
  }

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
        onEdit={setEditingVehicle}
        onViewInspections={onViewInspections}
        isSelectionMode={isSelectionMode}
        selectedVehicleIds={selectedVehicleIds}
        onToggleSelection={handleToggleVehicleSelection}
      />
      {editingVehicle && (
        <EditVehicleModal
            vehicle={editingVehicle}
            onClose={() => setEditingVehicle(null)}
            onUpdateSuccess={fetchVehicles}
        />
      )}
    </div>
  );
};