import React from 'react';
import type { Customer } from '../types';
import { CustomerCard } from './CustomerCard';
import { UserIcon } from './icons/UserIcon';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  isSelectionMode: boolean;
  selectedCustomerIds: string[];
  onToggleSelection: (customerId: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onEdit, isSelectionMode, selectedCustomerIds, onToggleSelection }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Customers ({customers.length})</h2>
      {customers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onEdit={onEdit}
              isSelectionMode={isSelectionMode}
              isSelected={selectedCustomerIds.includes(customer.id)}
              onToggleSelection={onToggleSelection}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-surface/50 rounded-lg border-2 border-dashed border-line">
            <UserIcon className="mx-auto w-12 h-12 text-text-tertiary" />
            <h3 className="mt-4 text-xl font-medium text-text-primary">No customers yet</h3>
            <p className="mt-2 text-text-secondary">
                Use the button above to add your first customer.
            </p>
        </div>
      )}
    </div>
  );
};