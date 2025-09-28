import React, { useState, useMemo } from 'react';
import type { Customer } from '../types';
import { useCustomers } from '../hooks/useCustomers';
import { localDB } from '../services/localDB';
import { UserIcon } from './icons/UserIcon';
import { PlusIcon } from './icons/PlusIcon';

interface AssignCustomerForBulkReportModalProps {
  inspectionCount: number;
  onClose: () => void;
  onAssign: (customerId: string) => void;
}

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-medium focus:outline-none transition-colors ${
        isActive
          ? 'border-b-2 border-accent text-accent bg-accent/10'
          : 'border-b border-line text-text-secondary hover:bg-line/50'
      }`}
    >
      {children}
    </button>
  );
}

const AddCustomerForm: React.FC<{ onCustomerAdded: (customerId: string) => void }> = ({ onCustomerAdded }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !phone) return;
        setIsSubmitting(true);
        try {
            const newCustomer: Customer = {
                id: crypto.randomUUID(),
                name,
                email,
                phone,
                updatedAt: Date.now()
            };
            await localDB.customers.add(newCustomer);
            onCustomerAdded(newCustomer.id);
        } catch (error) {
            console.error("Failed to add customer", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="modal-customer-name" className="block text-sm font-medium text-text-secondary">Full Name</label>
                <input type="text" id="modal-customer-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full input"/>
            </div>
            <div>
                <label htmlFor="modal-customer-email" className="block text-sm font-medium text-text-secondary">Email Address</label>
                <input type="email" id="modal-customer-email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full input"/>
            </div>
            <div>
                <label htmlFor="modal-customer-phone" className="block text-sm font-medium text-text-secondary">Phone Number</label>
                <input type="tel" id="modal-customer-phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full input"/>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? 'Adding...' : 'Add and Assign Customer'}
            </button>
        </form>
    );
};


export const AssignCustomerForBulkReportModal: React.FC<AssignCustomerForBulkReportModalProps> = ({ inspectionCount, onClose, onAssign }) => {
  const allCustomers = useCustomers();
  const [activeTab, setActiveTab] = useState<'select' | 'add'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return allCustomers;
    return allCustomers.filter(c => 
        `${c.name} ${c.email} ${c.phone}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [allCustomers, searchTerm]);

  const handleAssignCustomer = async (customerId: string) => {
    setIsAssigning(true);
    // No DB write here, just pass the ID up
    onAssign(customerId);
  };
  
  return (
    <div 
      className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-surface-glass backdrop-blur-md rounded-lg shadow-xl border border-line animate-fade-in-up flex flex-col"
        style={{maxHeight: '90vh'}}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-line">
          <h3 className="text-lg font-semibold text-text-primary">Assign Customer to {inspectionCount} Inspection(s)</h3>
          <p className="text-sm text-text-secondary">Select a customer to associate with these reports.</p>
        </div>
        <div className="flex">
            <TabButton isActive={activeTab === 'select'} onClick={() => setActiveTab('select')}>
                <UserIcon className="w-5 h-5"/> Select Existing Customer
            </TabButton>
            <TabButton isActive={activeTab === 'add'} onClick={() => setActiveTab('add')}>
                <PlusIcon className="w-5 h-5"/> Add New Customer
            </TabButton>
        </div>
        
        {activeTab === 'select' ? (
            <div className="flex flex-col flex-1 min-h-0">
                <div className="p-4 border-b border-line">
                    <input
                        type="search"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full input"
                        autoFocus
                    />
                </div>
                 <div className="flex-1 overflow-y-auto p-4">
                    {filteredCustomers.length > 0 ? (
                        <ul className="space-y-2">
                        {filteredCustomers.map(customer => (
                            <li key={customer.id}>
                                <button 
                                    onClick={() => handleAssignCustomer(customer.id)}
                                    disabled={isAssigning}
                                    className="w-full text-left p-3 flex items-center gap-4 rounded-md hover:bg-line/50 transition-colors disabled:opacity-50"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                      <UserIcon className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-primary">{customer.name}</p>
                                        <p className="text-sm text-text-secondary">{customer.email}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-center text-text-secondary py-8">No customers found. Try a different search or add a new customer.</p>
                    )}
                 </div>
            </div>
        ) : (
             <div className="flex-1 overflow-y-auto p-6">
                <AddCustomerForm onCustomerAdded={handleAssignCustomer} />
            </div>
        )}
        
        <div className="p-4 border-t border-line flex justify-end bg-surface-glass rounded-b-lg">
            <button 
                type="button" 
                onClick={onClose}
                disabled={isAssigning}
                className="w-full sm:w-auto flex justify-center py-2 px-4 border border-line rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent"
            >
                Cancel
            </button>
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
