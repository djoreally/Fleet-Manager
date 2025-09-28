import React from 'react';
import type { Vehicle } from '../types';
import { AddVehicleForm } from './AddVehicleForm';

interface NewInspectionQuickStartProps {
  onVehicleAdded: (vehicle: Vehicle) => void;
}

export const NewInspectionQuickStart: React.FC<NewInspectionQuickStartProps> = ({ onVehicleAdded }) => {
  return (
    <div className="bg-surface rounded-lg shadow-lg border border-line">
      <div className="p-4 border-b border-line">
        <h2 className="text-lg font-semibold text-text-primary">Quick Start: New Inspection</h2>
        <p className="text-sm text-text-secondary">Add a new vehicle to begin the inspection process.</p>
      </div>
      <div className="p-6">
        <AddVehicleForm 
            onVehicleAdded={onVehicleAdded}
            submitButtonText="Add & Continue"
            sampleButtonText="Add Sample & Continue"
            title="" 
        />
      </div>
    </div>
  );
};