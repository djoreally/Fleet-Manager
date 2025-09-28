import React, { useState } from 'react';
import type { Inspector } from '../types';
import { localDB } from '../services/localDB';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface InspectorFormProps {
  inspector?: Inspector | null;
  onSaveSuccess: () => void;
  onCancel?: () => void;
  submitButtonText?: string;
  showCancelButton?: boolean;
}

export const InspectorForm: React.FC<InspectorFormProps> = ({ inspector, onSaveSuccess, onCancel, submitButtonText, showCancelButton = true }) => {
  const [name, setName] = useState(inspector?.name || '');
  const [email, setEmail] = useState(inspector?.email || '');
  const [phone, setPhone] = useState(inspector?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
        alert("Please fill out all fields.");
        return;
    };
    
    setIsSubmitting(true);
    try {
      const inspectorToSave = {
        id: inspector?.id || crypto.randomUUID(),
        name, email, phone,
        updatedAt: Date.now(),
      };
      await localDB.inspectors.put(inspectorToSave);
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to save inspector:", error);
      alert("Failed to save inspector. Check console for details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
            <button type="submit" disabled={isSubmitting} className="flex-1 w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting && <SpinnerIcon className="w-5 h-5 animate-spin-slow" />}
                {isSubmitting ? 'Saving...' : (submitButtonText || 'Save Inspector')}
            </button>
            {showCancelButton && onCancel && (
              <button type="button" onClick={onCancel} disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 border border-line rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50">
                  Cancel
              </button>
            )}
        </div>
    </form>
  );
};
