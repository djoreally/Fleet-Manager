import React from 'react';
import type { Inspector } from '../types';
import { useInspectors } from '../hooks/useInspectors';
import { InspectorList } from '../components/InspectorList';

interface InspectorsPageProps {
  onEditInspector: (inspector: Inspector) => void;
  onCreateInspector: () => void;
}

export const InspectorsPage: React.FC<InspectorsPageProps> = ({ onEditInspector, onCreateInspector }) => {
  const inspectors = useInspectors();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end gap-4">
        <button 
          onClick={onCreateInspector}
          className="px-4 py-2 flex items-center gap-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent transition-colors"
        >
          Create New Inspector
        </button>
      </div>

      <InspectorList inspectors={inspectors} onEdit={onEditInspector} />
    </div>
  );
};