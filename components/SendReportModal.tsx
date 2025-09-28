import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { localDB } from '../services/localDB';
import type { Inspection, Customer, Vehicle, UserSettings, MediaType } from '../types';
import { SendIcon } from './icons/SendIcon';
import { MessageIcon } from './icons/MessageIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface SendReportModalProps {
  inspectionId: string;
  customerId: string;
  onClose: () => void;
}

const generateReportText = (inspection: Inspection, vehicle: Vehicle, customer: Customer, settings?: UserSettings | null): string => {
    let report = ``;

    if (settings && settings.businessName) {
        report += `${settings.businessName.toUpperCase()} - VEHICLE INSPECTION REPORT\n`;
        if (settings.businessAddress) report += `${settings.businessAddress}\n`;
        if (settings.businessPhone) report += `${settings.businessPhone}\n`;
        report += `\n------------------------------------\n\n`;
    } else {
        report += `VEHICLE INSPECTION REPORT\n\n`;
    }

    report += `Customer: ${customer.name}\n`;
    report += `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}\n`;
    report += `VIN: ${vehicle.vin}\n\n`;
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
    report += `${inspection.overallNotes || 'None'}\n`;
    
    return report;
};


export const SendReportModal: React.FC<SendReportModalProps> = ({ inspectionId, customerId, onClose }) => {
    
    const data = useLiveQuery(async () => {
        const inspection = await localDB.inspections.get(inspectionId);
        if (!inspection) return null;
        
        const customer = await localDB.customers.get(customerId);
        if (!customer) return null;
        
        const vehicle = await localDB.vehicles.get(inspection.vehicleId);
        if (!vehicle) return null;

        const settings = await localDB.userSettings.get(1);
        
        return { inspection, customer, vehicle, settings };
    }, [inspectionId, customerId]);
    
    const [isMarkingAsSent, setIsMarkingAsSent] = useState(false);

    const handleMarkAsSent = async () => {
        setIsMarkingAsSent(true);
        try {
            await localDB.inspections.update(inspectionId, { status: 'sent', updatedAt: Date.now() });
        } catch (error) {
            console.error("Failed to mark as sent:", error);
            alert("Failed to update status.");
        } finally {
            setIsMarkingAsSent(false);
        }
    };

    const reportText = useMemo(() => {
        if (!data) return '';
        return generateReportText(data.inspection, data.vehicle, data.customer, data.settings);
    }, [data]);
    
    if (!data) {
        return (
            <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center">
                <SpinnerIcon className="w-10 h-10 text-text-primary animate-spin-slow" />
            </div>
        );
    }
    
    const { customer, vehicle, inspection } = data;
    const isSent = inspection.status === 'sent';
    const encodedBody = encodeURIComponent(reportText);
    const mailtoHref = `mailto:${customer.email}?subject=${encodeURIComponent(`Vehicle Inspection Report for ${vehicle.year} ${vehicle.make} ${vehicle.model}`)}&body=${encodedBody}`;
    const smsHref = `sms:${customer.phone}?body=${encodedBody}`;

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
        <div className="p-6 border-b border-line">
          <h3 className="text-lg font-semibold text-text-primary">Send Inspection Report</h3>
          <p className="text-sm text-text-secondary">Send the report for {vehicle.year} {vehicle.make} to {customer.name}.</p>
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
                onClick={handleMarkAsSent}
                disabled={isSent || isMarkingAsSent}
                className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-success/80 hover:bg-success disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
                {isMarkingAsSent && <SpinnerIcon className="w-5 h-5 animate-spin-slow" />}
                {isSent ? '✓ Report Sent' : 'Mark as Sent'}
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