import React from 'react';
import { AddVehicleForm } from './AddVehicleForm';
import type { Vehicle } from '../types';

interface AddVehicleModalProps {
  onClose: () => void;
  onAddSuccess: (newVehicle: Vehicle) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onClose, onAddSuccess }) => {
  return (
    <div
      className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-glass backdrop-blur-md rounded-lg shadow-xl border border-line animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <AddVehicleForm
            onVehicleAdded={onAddSuccess}
            title="Add New Vehicle"
          />
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};