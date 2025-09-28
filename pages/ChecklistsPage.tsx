import React, { useState } from 'react';
import type { ChecklistTemplate } from '../types';
import { useChecklistTemplates } from '../hooks/useChecklistTemplates';
import { ChecklistTemplateList } from '../components/ChecklistTemplateList';
import { ChecklistTemplateFormModal } from '../components/ChecklistTemplateFormModal';

export const ChecklistsPage: React.FC = () => {
  const templates = useChecklistTemplates();
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
  };
  
  const handleCloseModal = () => {
    setEditingTemplate(null);
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 flex items-center gap-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent transition-colors"
        >
          Create New Template
        </button>
      </div>

      <ChecklistTemplateList templates={templates} onEdit={handleEdit} />

      {(editingTemplate || isCreating) && (
        <ChecklistTemplateFormModal 
            template={editingTemplate}
            onClose={handleCloseModal}
        />
      )}
    </div>
  );
};