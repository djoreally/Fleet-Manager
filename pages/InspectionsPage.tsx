
import React, { useState } from 'react';
import { useAllInspections } from '../hooks/useInspections';
import { useVehicles } from '../hooks/useVehicles';
import { useCustomers } from '../hooks/useCustomers';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';
import { AssignCustomerForBulkReportModal } from '../components/AssignCustomerForBulkReportModal';
import { SendBulkReportModal } from '../components/SendBulkReportModal';

export const InspectionsPage: React.FC = () => {
    const inspections = useAllInspections();
    const vehicles = useVehicles();
    const customers = useCustomers();

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedInspectionIds, setSelectedInspectionIds] = useState<string[]>([]);
    const [isAssigningCustomer, setIsAssigningCustomer] = useState(false);
    const [bulkReportData, setBulkReportData] = useState<{ inspectionIds: string[]; customerId: string } | null>(null);

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedInspectionIds([]); // Reset on toggle
    };

    const handleToggleSelection = (inspectionId: string) => {
        setSelectedInspectionIds(prev =>
            prev.includes(inspectionId)
                ? prev.filter(id => id !== inspectionId)
                : [...prev, inspectionId]
        );
    };

    const handleCreateBulkReport = () => {
        if (selectedInspectionIds.length > 0) {
            setIsAssigningCustomer(true);
        }
    };
    
    const handleCustomerAssignedForBulk = (customerId: string) => {
        setBulkReportData({ inspectionIds: selectedInspectionIds, customerId });
        setIsAssigningCustomer(false);
        // Reset selection state as we move to the next modal
        setIsSelectionMode(false);
        setSelectedInspectionIds([]);
    };

    const getVehicleInfo = (vehicleId: string) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
    };

    const getCustomerName = (customerId?: string) => {
        if (!customerId) return 'No customer assigned';
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : 'Unknown Customer';
    };

    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-text-primary">All Inspections ({inspections.length})</h2>
                    <div className="flex gap-2">
                        {isSelectionMode && (
                            <button
                                onClick={handleCreateBulkReport}
                                disabled={selectedInspectionIds.length === 0}
                                className="px-4 py-2 flex items-center gap-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-success hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Create Bulk Report ({selectedInspectionIds.length})
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
                {inspections.length > 0 ? (
                    <div className="bg-surface rounded-lg shadow-lg border border-line">
                        <ul className="divide-y divide-line">
                            {inspections.map(inspection => (
                                <li 
                                    key={inspection.id}
                                    onClick={() => isSelectionMode && handleToggleSelection(inspection.id)}
                                    className={`transition-colors duration-200 ${isSelectionMode ? 'cursor-pointer' : ''} ${selectedInspectionIds.includes(inspection.id) ? 'bg-accent/20' : isSelectionMode ? 'hover:bg-line/20' : ''}`}
                                >
                                    <div className="p-4 flex items-center gap-4">
                                        {isSelectionMode && (
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedInspectionIds.includes(inspection.id)}
                                                    readOnly
                                                    className="form-checkbox h-5 w-5 rounded bg-surface border-line text-accent focus:ring-accent pointer-events-none"
                                                    aria-label={`Select inspection for ${getVehicleInfo(inspection.vehicleId)}`}
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 flex flex-col sm:flex-row justify-between sm:items-center">
                                            <div>
                                                <p className="font-bold text-text-primary">
                                                    {getVehicleInfo(inspection.vehicleId)}
                                                </p>
                                                <p className="text-sm text-text-secondary">
                                                {inspection.checklistTemplateName} by {inspection.inspectorName}
                                                </p>
                                                <p className={`text-sm font-semibold mt-1 ${inspection.customerId ? 'text-accent' : 'text-text-tertiary'}`}>
                                                Customer: {getCustomerName(inspection.customerId)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-start sm:items-end gap-1 mt-2 sm:mt-0">
                                                <p className="text-sm text-text-tertiary">
                                                    {new Date(inspection.inspectionDate).toLocaleString()}
                                                </p>
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                                    inspection.status === 'sent' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                                                }`}>
                                                    {inspection.status === 'sent' ? 'Sent' : 'Draft'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="text-center py-12 px-6 bg-surface/50 rounded-lg border-2 border-dashed border-line">
                        <ClipboardListIcon className="mx-auto w-12 h-12 text-text-tertiary" />
                        <h3 className="mt-4 text-xl font-medium text-text-primary">No inspections recorded</h3>
                        <p className="mt-2 text-text-secondary">
                            Perform an inspection from the 'My Fleet' page to see it here.
                        </p>
                    </div>
                )}
            </div>

            {isAssigningCustomer && (
                <AssignCustomerForBulkReportModal
                    inspectionCount={selectedInspectionIds.length}
                    onClose={() => setIsAssigningCustomer(false)}
                    onAssign={handleCustomerAssignedForBulk}
                />
            )}

            {bulkReportData && (
                <SendBulkReportModal
                    inspectionIds={bulkReportData.inspectionIds}
                    customerId={bulkReportData.customerId}
                    onClose={() => setBulkReportData(null)}
                />
            )}
        </>
    );
};