import React, { useState } from 'react';
import type { Customer } from '../types';

interface AddEditCustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSave: (customerData: Omit<Customer, 'id' | 'updatedAt'>) => Promise<void>;
}

export const AddEditCustomerModal: React.FC<AddEditCustomerModalProps> = ({ customer, onClose, onSave }) => {
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!customer;

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
      console.error("Failed to save customer:", error);
      alert("Failed to save customer. Check console for details.");
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
                    {isEditing ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="customer-name" className="block text-sm font-medium text-text-secondary">Full Name</label>
                        <input type="text" id="customer-name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., John Doe" className="mt-1 block w-full input"/>
                    </div>
                    <div>
                        <label htmlFor="customer-email" className="block text-sm font-medium text-text-secondary">Email Address</label>
                        <input type="email" id="customer-email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="e.g., john.doe@example.com" className="mt-1 block w-full input"/>
                    </div>
                    <div>
                        <label htmlFor="customer-phone" className="block text-sm font-medium text-text-secondary">Phone Number</label>
                        <input type="tel" id="customer-phone" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g., (555) 123-4567" className="mt-1 block w-full input"/>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-line flex flex-col sm:flex-row-reverse gap-3 bg-surface-glass rounded-b-lg">
                <button type="submit" disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Customer'}
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