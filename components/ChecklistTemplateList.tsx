import React from 'react';
import type { ChecklistTemplate } from '../types';
import { localDB } from '../services/localDB';
import { EditIcon } from './icons/EditIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';

interface ChecklistTemplateListProps {
  templates: ChecklistTemplate[];
  onEdit: (template: ChecklistTemplate) => void;
}

export const ChecklistTemplateList: React.FC<ChecklistTemplateListProps> = ({ templates, onEdit }) => {
  
  const handleDelete = async (template: ChecklistTemplate) => {
    if (confirm(`Are you sure you want to delete the "${template.name}" checklist?`)) {
        await localDB.checklistTemplates.delete(template.id);
    }
  };
    
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Checklist Templates ({templates.length})</h2>
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-surface rounded-lg shadow-lg border border-line p-4 flex justify-between items-start gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <ChecklistIcon className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    {template.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {template.items.length} items
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                 <button 
                    onClick={() => onEdit(template)}
                    className="p-2 text-text-tertiary hover:text-accent rounded-md hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Edit template"
                    >
                    <EditIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => handleDelete(template)}
                    className="p-2 text-text-tertiary hover:text-danger rounded-md hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-danger"
                    aria-label="Delete template"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
                    </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-surface/50 rounded-lg border-2 border-dashed border-line">
          <h3 className="text-xl font-medium text-text-primary">No checklist templates found</h3>
          <p className="mt-2 text-text-secondary">
            Create your first template to use in vehicle inspections.
          </p>
        </div>
      )}
    </div>
  );
};