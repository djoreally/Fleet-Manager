

import React from 'react';
import type { Vehicle } from '../types';
import { useInspections } from '../hooks/useInspections';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { MapPinIcon } from './icons/MapPinIcon';

interface InspectionHistoryModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onStartInspection: (vehicle: Vehicle) => void;
}

export const InspectionHistoryModal: React.FC<InspectionHistoryModalProps> = ({ vehicle, onClose, onStartInspection }) => {
  const inspections = useInspections(vehicle.id);

  return (
    <div 
      className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-surface-glass backdrop-blur-md rounded-lg shadow-xl border border-line animate-fade-in-up flex flex-col"
        style={{maxHeight: '80vh'}}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-line">
          <h3 className="text-lg font-semibold text-text-primary">Inspection History</h3>
          <p className="text-sm text-text-secondary">{vehicle.year} {vehicle.make} {vehicle.model}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {inspections.length > 0 ? (
            <ul className="space-y-4">
              {inspections.map(inspection => (
                <li key={inspection.id} className="p-4 bg-background/50 rounded-md border border-line">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-text-secondary">
                        Inspected by: {inspection.inspectorName}
                      </p>
                      <p className="text-sm text-text-tertiary">
                        {new Date(inspection.inspectionDate).toLocaleDateString()}
                      </p>
                      {inspection.latitude && inspection.longitude && (
                         <a 
                            href={`https://www.google.com/maps?q=${inspection.latitude},${inspection.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                        >
                            <MapPinIcon className="w-4 h-4" />
                            <span>View on Map</span>
                        </a>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        inspection.status === 'sent' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    }`}>
                        {inspection.status === 'sent' ? 'Sent' : 'Draft'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <ClipboardListIcon className="mx-auto w-12 h-12 text-text-tertiary" />
              <h4 className="mt-4 text-lg font-medium text-text-primary">No inspections found</h4>
              <p className="mt-1 text-sm text-text-secondary">Start a new inspection for this vehicle.</p>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-line flex flex-col sm:flex-row-reverse gap-3 bg-surface-glass rounded-b-lg">
            <button 
                type="button" 
                onClick={() => { onClose(); onStartInspection(vehicle); }}
                className="flex-1 w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent"
            >
                Start New Inspection
            </button>
            <button 
                type="button" 
                onClick={onClose}
                className="flex-1 w-full flex justify-center py-2 px-4 border border-line rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent"
            >
                Close
            </button>
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