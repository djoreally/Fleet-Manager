import React, { useState } from 'react';
import type { Inspector } from '../types';

interface AddEditInspectorModalProps {
  inspector: Inspector | null;
  onClose: () => void;
  onSave: (inspectorData: Omit<Inspector, 'id' | 'updatedAt'>) => Promise<void>;
}

export const AddEditInspectorModal: React.FC<AddEditInspectorModalProps> = ({ inspector, onClose, onSave }) => {
  const [name, setName] = useState(inspector?.name || '');
  const [email, setEmail] = useState(inspector?.email || '');
  const [phone, setPhone] = useState(inspector?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!inspector;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
        alert("Please fill out all fields.");
        return;
    };
    
    setIsSubmitting(true);
    try {
      await onSave({ name, email, phone });
      onClose();
    } catch (error) {
      console.error("Failed to save inspector:", error);
      alert("Failed to save inspector. Check console for details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-surface-glass backdrop-blur-md rounded-lg shadow-xl border border-line animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                    {isEditing ? 'Edit Inspector' : 'Add New Inspector'}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="inspector-name" className="block text-sm font-medium text-text-secondary">Full Name</label>
                        <input type="text" id="inspector-name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Jane Doe" className="mt-1 block w-full input"/>
                    </div>
                    <div>
                        <label htmlFor="inspector-email" className="block text-sm font-medium text-text-secondary">Email Address</label>
                        <input type="email" id="inspector-email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="e.g., jane.doe@example.com" className="mt-1 block w-full input"/>
                    </div>
                    <div>
                        <label htmlFor="inspector-phone" className="block text-sm font-medium text-text-secondary">Phone Number</label>
                        <input type="tel" id="inspector-phone" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g., (555) 123-4567" className="mt-1 block w-full input"/>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-line flex flex-col sm:flex-row-reverse gap-3 bg-surface-glass rounded-b-lg">
                <button type="submit" disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Inspector'}
                </button>
                <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 border border-line rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50">
                    Cancel
                </button>
            </div>
        </form>
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