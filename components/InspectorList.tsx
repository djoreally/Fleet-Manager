import React from 'react';
import type { Inspector } from '../types';
import { InspectorCard } from './InspectorCard';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface InspectorListProps {
  inspectors: Inspector[];
  onEdit: (inspector: Inspector) => void;
}

export const InspectorList: React.FC<InspectorListProps> = ({ inspectors, onEdit }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Inspectors ({inspectors.length})</h2>
      {inspectors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inspectors.map((inspector) => (
            <InspectorCard key={inspector.id} inspector={inspector} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-surface/50 rounded-lg border-2 border-dashed border-line">
            <BriefcaseIcon className="mx-auto w-12 h-12 text-text-tertiary" />
            <h3 className="mt-4 text-xl font-medium text-text-primary">No inspectors yet</h3>
            <p className="mt-2 text-text-secondary">
                Use the button above to add your first inspector.
            </p>
        </div>
      )}
    </div>
  );
};