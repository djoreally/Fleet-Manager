
import React, { useState, useMemo } from 'react';
import type { Vehicle } from '../types';
import { useVehicles } from '../hooks/useVehicles';
import { AddVehicleForm } from './AddVehicleForm';
import { CarIcon } from './icons/CarIcon';
import { PlusIcon } from './icons/PlusIcon';

interface SelectVehicleForInspectionModalProps {
  onClose: () => void;
  onVehicleSelected: (vehicle: Vehicle) => void;
}

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-medium focus:outline-none transition-colors ${
        isActive
          ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/20'
          : 'border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
      }`}
    >
      {children}
    </button>
  );
}

export const SelectVehicleForInspectionModal: React.FC<SelectVehicleForInspectionModalProps> = ({ onClose, onVehicleSelected }) => {
  const allVehicles = useVehicles();
  const [activeTab, setActiveTab] = useState<'select' | 'add'>('select');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return allVehicles;
    return allVehicles.filter(v => 
        `${v.year} ${v.make} ${v.model} ${v.licensePlate} ${v.vin}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [allVehicles, searchTerm]);
  

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up flex flex-col"
        style={{maxHeight: '90vh'}}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex">
            <TabButton isActive={activeTab === 'select'} onClick={() => setActiveTab('select')}>
                <CarIcon className="w-5 h-5"/> Select Existing Vehicle
            </TabButton>
            <TabButton isActive={activeTab === 'add'} onClick={() => setActiveTab('add')}>
                <PlusIcon className="w-5 h-5"/> Add New Vehicle
            </TabButton>
        </div>
        
        {activeTab === 'select' ? (
            <div className="flex flex-col flex-1 min-h-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <input
                        type="search"
                        placeholder="Search by make, model, VIN, or plate..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full input"
                        autoFocus
                    />
                </div>
                 <div className="flex-1 overflow-y-auto p-4">
                    {filteredVehicles.length > 0 ? (
                        <ul className="space-y-2">
                        {filteredVehicles.map(vehicle => (
                            <li key={vehicle.id}>
                                <button 
                                    onClick={() => onVehicleSelected(vehicle)}
                                    className="w-full text-left p-3 flex items-center gap-4 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center">
                                      <CarIcon className="w-6 h-6 text-sky-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{vehicle.licensePlate} &bull; {vehicle.vin}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">No vehicles found. Try a different search or add a new vehicle.</p>
                    )}
                 </div>
            </div>
        ) : (
             <div className="flex-1 overflow-y-auto p-6">
                <AddVehicleForm onVehicleAdded={onVehicleSelected} />
            </div>
        )}
        
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