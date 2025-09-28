import React from 'react';
import type { Inspector } from '../types';
import { InspectorForm } from './InspectorForm';

interface AddEditInspectorModalProps {
  inspector: Inspector | null;
  onClose: () => void;
}

export const AddEditInspectorModal: React.FC<AddEditInspectorModalProps> = ({ inspector, onClose }) => {
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
            <h3 className="text-lg font-semibold text-text-primary mb-4">
                {inspector ? 'Edit Inspector' : 'Add New Inspector'}
            </h3>
            <InspectorForm 
                inspector={inspector}
                onSaveSuccess={onClose}
                onCancel={onClose}
            />
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