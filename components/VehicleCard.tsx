import React, { useState, useRef } from 'react';
import type { Vehicle } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { CarIcon } from './icons/CarIcon';
import { EditIcon } from './icons/EditIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { useInspectionCount } from '../hooks/useInspections';
import { localDB } from '../services/localDB';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onViewInspections: (vehicle: Vehicle) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (vehicleId: string) => void;
}

const ACTION_WIDTH = 128; // Total width of the action buttons container (64px per button)

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onEdit, onViewInspections, isSelectionMode, isSelected, onToggleSelection }) => {
  const inspectionCount = useInspectionCount(vehicle.id);
  const { theme } = useTheme();
  
  const [translateX, setTranslateX] = useState(0);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const serviceParts = [
    { label: 'Oil Filter', value: vehicle.oilFilterPartNumber },
    { label: 'Air Filter', value: vehicle.airFilterPartNumber },
    { label: 'Cabin Filter', value: vehicle.cabinAirFilterPartNumber },
    { label: 'Fuel Filter', value: vehicle.fuelFilterPartNumber },
  ].filter(part => part.value);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model}? This will also delete its ${inspectionCount} inspection(s).`)) {
        await localDB.vehicles.delete(vehicle.id);
        await localDB.inspections.where('vehicleId').equals(vehicle.id).delete();
    }
    resetPosition();
  };

  const handleEditClick = () => {
    onEdit(vehicle);
    resetPosition();
  };
  
  const resetPosition = () => {
    setTranslateX(0);
  };
  
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSelectionMode || theme !== 'arcade') return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const currentX = e.clientX;
    const deltaX = currentX - dragStartX.current;
    
    // Only allow swiping left, and cap the swipe distance
    const newTranslateX = Math.max(-ACTION_WIDTH, Math.min(0, deltaX));
    setTranslateX(newTranslateX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);

    // Snap logic
    if (translateX < -ACTION_WIDTH / 2) {
      setTranslateX(-ACTION_WIDTH); // Snap open
    } else {
      setTranslateX(0); // Snap closed
    }
  };

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleSelection(vehicle.id);
    }
  };
    
  return (
    <div 
        onClick={handleClick}
        className={`relative bg-surface rounded-lg shadow-lg border overflow-hidden ${theme === 'arcade' && !isSelectionMode ? 'arcade-border' : ''} transition-all duration-200 ${isSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'border-accent ring-2 ring-accent' : 'border-line'}`}
    >
      {/* Action buttons (hidden behind) */}
      {!isSelectionMode && (
        <div className="absolute top-0 right-0 h-full flex items-center z-0">
            <button
                onClick={handleEditClick}
                className="w-16 h-full flex flex-col items-center justify-center bg-accent/80 text-text-inverted hover:bg-accent"
            >
                <EditIcon className="w-6 h-6" />
                <span className="text-xs mt-1">Edit</span>
            </button>
            <button
                onClick={handleDelete}
                className="w-16 h-full flex flex-col items-center justify-center bg-danger/80 text-text-inverted hover:bg-danger"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
                </svg>
                <span className="text-xs mt-1">Delete</span>
            </button>
        </div>
      )}

      <div 
        className="relative bg-surface w-full p-4 flex items-start gap-4 z-10"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp} // Also handle cancel events
        style={{ 
          transform: `translateX(${isSelectionMode ? 0 : translateX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
          touchAction: isSelectionMode ? 'auto' : 'pan-y' // Allows vertical scrolling while enabling horizontal drag
        }}
      >
        {isSelectionMode && (
          <div className="flex items-center justify-center h-full pr-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(vehicle.id)}
              className="form-checkbox h-5 w-5 rounded bg-surface border-line text-accent focus:ring-accent"
              aria-label={`Select vehicle ${vehicle.make} ${vehicle.model}`}
            />
          </div>
        )}
        <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
          <CarIcon className="w-7 h-7 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex flex-col justify-between h-full">
                <div>
                    <h3 className={`text-lg font-bold text-text-primary ${theme === 'arcade' ? 'arcade-text-glow' : ''}`}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-text-secondary">
                        {vehicle.mileage.toLocaleString()} miles &bull; Plate: {vehicle.licensePlate || 'N/A'}
                    </p>
                    <p className="text-sm text-text-secondary truncate">
                        VIN: {vehicle.vin || 'N/A'}
                    </p>
                    {serviceParts.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-line/50">
                            <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                {serviceParts.map(part => (
                                    <React.Fragment key={part.label}>
                                        <dt className="text-text-tertiary font-medium">{part.label}</dt>
                                        <dd className="text-text-secondary truncate">{part.value}</dd>
                                    </React.Fragment>
                                ))}
                            </dl>
                        </div>
                    )}
                    <p className="text-xs text-text-tertiary mt-2">
                        Last Updated: {new Date(vehicle.updatedAt).toLocaleString()}
                    </p>
                </div>
                {!isSelectionMode && (
                    <div className="flex flex-wrap gap-2 justify-end mt-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onViewInspections(vehicle); }}
                            className="px-3 py-1.5 flex items-center gap-2 text-sm font-semibold text-text-secondary bg-surface hover:bg-line/50 rounded-md border border-line focus:outline-none focus:ring-2 focus:ring-accent"
                            aria-label="View inspections"
                        >
                            <ClipboardListIcon className="w-4 h-4" />
                            <span>Inspections</span>
                            <span className="px-2 py-0.5 text-xs font-bold text-accent bg-accent/20 rounded-full">{inspectionCount}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};