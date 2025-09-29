import React, { useState } from 'react';
// TODO: Refactor this page to fetch and manage data using the new `apiFetch` service.
// The current implementation relies on the deprecated localDB and `useCustomers` hook.
import type { Customer } from '../types';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerList } from '../components/CustomerList';
import { localDB } from '../services/localDB';

interface CustomersPageProps {
  onEditCustomer: (customer: Customer) => void;
  onCreateCustomer: () => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onEditCustomer, onCreateCustomer }) => {
  const customers = useCustomers();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedCustomerIds([]);
  };

  const handleToggleCustomerSelection = (customerId: string) => {
    setSelectedCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedCustomerIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedCustomerIds.length} customer(s)? This action cannot be undone.`)) {
      try {
        await localDB.customers.bulkDelete(selectedCustomerIds);
        // Also need to un-assign these customers from any inspections
        await localDB.inspections
            .where('customerId').anyOf(selectedCustomerIds)
            .modify({ customerId: undefined });
        toggleSelectionMode();
      } catch (error) {
        console.error("Failed to bulk delete customers:", error);
        alert("An error occurred during bulk deletion. Please check the console.");
      }
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div/> {/* Spacer */}
         <div className="flex gap-2">
            {!isSelectionMode && (
                <button 
                onClick={onCreateCustomer}
                className="px-4 py-2 flex items-center gap-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent transition-colors"
                >
                Create New Customer
                </button>
            )}
            {isSelectionMode && selectedCustomerIds.length > 0 && (
                <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 flex items-center gap-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-danger hover:opacity-90 transition-colors"
                >
                    Delete ({selectedCustomerIds.length})
                </button>
            )}
            <button
                onClick={toggleSelectionMode}
                className={`px-4 py-2 flex items-center gap-2 rounded-md shadow-sm text-sm font-semibold ${isSelectionMode ? 'bg-surface text-text-secondary border border-line' : 'bg-accent text-text-inverted'}`}
            >
                {isSelectionMode ? 'Cancel' : 'Select'}
            </button>
        </div>
      </div>

      <CustomerList 
        customers={customers} 
        onEdit={onEditCustomer} 
        isSelectionMode={isSelectionMode}
        selectedCustomerIds={selectedCustomerIds}
        onToggleSelection={handleToggleCustomerSelection}
      />
    </div>
  );
};