import React, { useMemo, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { localDB } from '../services/localDB';
import type { Inspection, Customer, Vehicle, UserSettings, MediaType } from '../types';
import { SendIcon } from './icons/SendIcon';
import { MessageIcon } from './icons/MessageIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface SendBulkReportModalProps {
  inspectionIds: string[];
  customerId: string;
  onClose: () => void;
}

const generateBulkReportText = (inspections: Inspection[], vehicles: Vehicle[], customer: Customer, settings?: UserSettings | null): string => {
    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
    let report = ``;

    if (settings && settings.businessName) {
        report += `${settings.businessName.toUpperCase()} - FLEET INSPECTION SUMMARY\n`;
        if (settings.businessAddress) report += `${settings.businessAddress}\n`;
        if (settings.businessPhone) report += `${settings.businessPhone}\n`;
    } else {
        report += `FLEET INSPECTION SUMMARY\n`;
    }

    report += `\n------------------------------------\n\n`;
    report += `Customer: ${customer.name}\n`;
    report += `Date: ${new Date().toLocaleString()}\n`;
    report += `This report contains inspection results for ${inspections.length} vehicle(s).\n\n`;

    inspections.forEach((inspection, index) => {
        const vehicle = vehicleMap.get(inspection.vehicleId);
        if (!vehicle) return;

        report += `====================================\n`;
        report += `VEHICLE ${index + 1} of ${inspections.length}\n`;
        report += `====================================\n`;
        report += `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}\n`;
        report += `VIN: ${vehicle.vin}\n`;
        report += `License Plate: ${vehicle.licensePlate}\n\n`;
        report += `Inspection Date: ${new Date(inspection.inspectionDate).toLocaleString()}\n`;
        report += `Inspector: ${inspection.inspectorName}\n`;
        if (inspection.latitude && inspection.longitude) {
            report += `Location: https://www.google.com/maps?q=${inspection.latitude},${inspection.longitude}\n`;
        }
        report += `\n--- CHECKLIST: ${inspection.checklistTemplateName} ---\n`;
        inspection.checklist.forEach(item => {
            report += `  - ${item.name}: ${item.status.toUpperCase()}\n`;
            if (item.status === 'fail' && item.notes) {
                report += `    Notes: ${item.notes}\n`;
            }
            if (item.media && item.media.length > 0) {
                const mediaCounts = item.media.reduce((acc, m) => {
                    acc[m.type] = (acc[m.type] || 0) + 1;
                    return acc;
                }, {} as Record<MediaType, number>);
    
                const mediaSummary = Object.entries(mediaCounts)
                    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
                    .join(', ');
                
                report += `    Attachments: ${mediaSummary}\n`;
            }
        });
        report += `\n--- OVERALL NOTES ---\n`;
        report += `${inspection.overallNotes || 'None'}\n\n`;
    });
    
    return report;
};


export const SendBulkReportModal: React.FC<SendBulkReportModalProps> = ({ inspectionIds, customerId, onClose }) => {
    const [isAssigning, setIsAssigning] = useState(true);
    const [isMarkingAsSent, setIsMarkingAsSent] = useState(false);

    const data = useLiveQuery(async () => {
        if (!inspectionIds || inspectionIds.length === 0 || !customerId) return null;

        const inspections = await localDB.inspections.where('id').anyOf(inspectionIds).toArray();
        if (inspections.length === 0) return null;
        
        const customer = await localDB.customers.get(customerId);
        if (!customer) return null;
        
        const vehicleIds = [...new Set(inspections.map(i => i.vehicleId))];
        const vehicles = await localDB.vehicles.where('id').anyOf(vehicleIds).toArray();
        if (vehicles.length === 0) return null;

        const settings = await localDB.userSettings.get(1);
        
        return { inspections, customer, vehicles, settings };
    }, [inspectionIds, customerId]);

    useEffect(() => {
        if (isAssigning && inspectionIds.length > 0 && customerId) {
            const assignCustomerToInspections = async () => {
                try {
                    const updates = inspectionIds.map(id => ({
                        key: id,
                        changes: { customerId, updatedAt: Date.now() }
                    }));
                    await localDB.inspections.bulkUpdate(updates);
                } catch (error) {
                    console.error("Failed to bulk assign customer to inspections:", error);
                    alert("An error occurred while assigning the customer. Please check the console.");
                } finally {
                    setIsAssigning(false);
                }
            };
            assignCustomerToInspections();
        }
    }, [inspectionIds, customerId, isAssigning]);
    
    const areAllSent = useMemo(() => {
        return data?.inspections.every(i => i.status === 'sent') ?? false;
    }, [data]);

    const handleMarkAllAsSent = async () => {
        setIsMarkingAsSent(true);
        try {
            const updates = inspectionIds.map(id => ({
                key: id,
                // FIX: Explicitly cast 'sent' to its literal type to satisfy the UpdateSpec<Inspection> type required by bulkUpdate.
                changes: { status: 'sent' as 'sent', updatedAt: Date.now() }
            }));
            await localDB.inspections.bulkUpdate(updates);
        } catch (error) {
            console.error("Failed to bulk mark as sent:", error);
            alert("Failed to update statuses.");
        } finally {
            setIsMarkingAsSent(false);
        }
    };

    const reportText = useMemo(() => {
        if (!data) return '';
        return generateBulkReportText(data.inspections, data.vehicles, data.customer, data.settings);
    }, [data]);
    
    if (!data || isAssigning) {
        return (
            <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex flex-col justify-center items-center gap-4">
                <SpinnerIcon className="w-10 h-10 text-text-primary animate-spin-slow" />
                <p className="text-text-secondary">Assigning customer & generating report...</p>
            </div>
        );
    }
    
    const { customer } = data;
    const encodedBody = encodeURIComponent(reportText);
    const mailtoHref = `mailto:${customer.email}?subject=${encodeURIComponent(`Fleet Inspection Report for ${customer.name}`)}&body=${encodedBody}`;
    const smsHref = `sms:${customer.phone}?body=${encodedBody}`;

  return (
    <div 
      className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-surface-glass backdrop-blur-md rounded-lg shadow-xl border border-line animate-fade-in-up flex flex-col"
        style={{maxHeight: '90vh'}}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-line">
          <h3 className="text-lg font-semibold text-text-primary">Send Bulk Inspection Report</h3>
          <p className="text-sm text-text-secondary">Sending report for {inspectionIds.length} vehicle(s) to {customer.name}.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
                <h4 className="text-md font-medium text-text-secondary mb-2">Report Preview</h4>
                <pre className="text-sm p-4 bg-background/50 rounded-md whitespace-pre-wrap font-mono text-text-secondary">
                    {reportText}
                </pre>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                    href={mailtoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent"
                >
                    <SendIcon className="w-5 h-5" />
                    Send via Email
                </a>
                <a 
                    href={smsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-success hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-success"
                >
                    <MessageIcon className="w-5 h-5" />
                    Send via Text
                </a>
            </div>
        </div>
        
        <div className="p-6 border-t border-line flex flex-col sm:flex-row justify-end items-center gap-3 bg-surface-glass rounded-b-lg">
            <button
                type="button"
                onClick={handleMarkAllAsSent}
                disabled={areAllSent || isMarkingAsSent}
                className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-success/80 hover:bg-success disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
                {isMarkingAsSent && <SpinnerIcon className="w-5 h-5 animate-spin-slow" />}
                {areAllSent ? '✓ All Sent' : 'Mark All as Sent'}
            </button>
            <button 
                type="button" 
                onClick={onClose}
                className="w-full sm:w-auto flex justify-center py-2 px-4 border border-line rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent"
            >
                Done
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
