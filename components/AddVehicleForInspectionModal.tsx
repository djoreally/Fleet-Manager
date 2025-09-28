import React from 'react';
import type { Vehicle } from '../types';
import { AddVehicleForm } from './AddVehicleForm';

interface AddVehicleForInspectionModalProps {
  onClose: () => void;
  onVehicleAdded: (vehicle: Vehicle) => void;
}

export const AddVehicleForInspectionModal: React.FC<AddVehicleForInspectionModalProps> = ({ onClose, onVehicleAdded }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
            <AddVehicleForm 
                onVehicleAdded={onVehicleAdded} 
                title="New Inspection: Enter Vehicle Details"
            />
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
            <button 
                type="button" 
                onClick={onClose}
                className="w-full sm:w-auto flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
                Cancel
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
