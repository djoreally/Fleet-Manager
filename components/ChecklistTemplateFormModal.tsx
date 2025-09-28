import React, { useState } from 'react';
import type { ChecklistTemplate, ChecklistTemplateItem } from '../types';
import { localDB } from '../services/localDB';

interface ChecklistTemplateFormModalProps {
  template?: ChecklistTemplate | null;
  onClose: () => void;
}

export const ChecklistTemplateFormModal: React.FC<ChecklistTemplateFormModalProps> = ({ template, onClose }) => {
  const [name, setName] = useState(template?.name || '');
  const [items, setItems] = useState<ChecklistTemplateItem[]>(template?.items || [{ id: crypto.randomUUID(), name: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleItemChange = (id: string, value: string) => {
    setItems(currentItems => currentItems.map(item => item.id === id ? { ...item, name: value } : item));
  };

  const addItem = () => {
    setItems(currentItems => [...currentItems, { id: crypto.randomUUID(), name: '' }]);
  };

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredItems = items.filter(item => item.name.trim() !== '');
    if (!name || filteredItems.length === 0) {
        alert("Please provide a name and at least one checklist item.");
        return;
    }
    
    setIsSubmitting(true);
    try {
      const newTemplate: ChecklistTemplate = {
        id: template?.id || crypto.randomUUID(),
        name,
        items: filteredItems,
        updatedAt: Date.now(),
      };
      await localDB.checklistTemplates.put(newTemplate);
      onClose();
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Failed to save template. Check console for details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-surface-glass backdrop-blur-md rounded-lg shadow-xl border border-line animate-fade-in-up flex flex-col"
        style={{maxHeight: '90vh'}}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-line">
          <h3 className="text-lg font-semibold text-text-primary">
            {template ? 'Edit Checklist Template' : 'Create Checklist Template'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
                <label htmlFor="template-name" className="block text-sm font-medium text-text-secondary">Template Name</label>
                <input
                    type="text"
                    id="template-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="e.g., Daily Pre-Trip Inspection"
                    className="mt-1 block w-full input"
                />
            </div>

            <div>
                <h4 className="block text-sm font-medium text-text-secondary mb-2">Checklist Items</h4>
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={item.name}
                                onChange={e => handleItemChange(item.id, e.target.value)}
                                placeholder={`Item #${index + 1}`}
                                className="block w-full input"
                            />
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                disabled={items.length <= 1}
                                className="p-2 text-danger rounded-md hover:bg-danger/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Remove item"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                 <button
                    type="button"
                    onClick={addItem}
                    className="mt-3 px-3 py-1.5 flex items-center gap-2 text-sm font-semibold text-accent bg-accent/20 hover:bg-accent/30 rounded-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                </button>
            </div>
        </form>

        <div className="p-6 border-t border-line flex flex-col sm:flex-row-reverse gap-3 bg-surface-glass rounded-b-lg">
            <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? 'Saving...' : 'Save Template'}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 border border-line rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50">
                Cancel
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