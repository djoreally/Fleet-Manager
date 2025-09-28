
import React from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useAllInspections } from '../hooks/useInspections';
import { useCustomers } from '../hooks/useCustomers';
import { useInspectors } from '../hooks/useInspectors';
import { exportAsCsv, exportAsJson } from '../services/exportService';
import { CarIcon } from '../components/icons/CarIcon';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { BriefcaseIcon } from '../components/icons/BriefcaseIcon';
import { GoogleIcon } from '../components/icons/GoogleIcon';

interface ExportCardProps {
    title: string;
    icon: React.ReactNode;
    count: number;
    onExportCsv: () => void;
    onExportJson: () => void;
    onExportGSheet: () => void;
}

const ExportCard: React.FC<ExportCardProps> = ({ title, icon, count, onExportCsv, onExportJson, onExportGSheet }) => {
    return (
        <div className="bg-surface rounded-lg shadow-lg border border-line p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                    <p className="text-sm text-text-secondary">{count} record(s)</p>
                </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <button 
                    onClick={onExportCsv}
                    disabled={count === 0}
                    className="flex-1 px-3 py-1.5 text-sm font-semibold text-text-secondary bg-surface hover:bg-line/50 rounded-md border border-line focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    CSV
                </button>
                <button
                    onClick={onExportJson}
                    disabled={count === 0}
                    className="flex-1 px-3 py-1.5 text-sm font-semibold text-text-secondary bg-surface hover:bg-line/50 rounded-md border border-line focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    JSON
                </button>
                <button
                    onClick={onExportGSheet}
                    disabled={count === 0}
                    className="flex-1 px-3 py-1.5 flex items-center justify-center gap-1.5 text-sm font-semibold text-text-secondary bg-surface hover:bg-line/50 rounded-md border border-line focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <GoogleIcon className="w-4 h-4" />
                    Sheets
                </button>
            </div>
        </div>
    );
};


export const ExportPage: React.FC = () => {
    const vehicles = useVehicles();
    const inspections = useAllInspections();
    const customers = useCustomers();
    const inspectors = useInspectors();

    const handleExportGSheet = (dataType: string) => {
        alert(`This is a demo of the 'Export to Google Sheets' feature.\n\nIn a real application, this would trigger the following flow:\n1. Prompt you to sign in with your Google account (OAuth).\n2. Request permission to create and edit Google Sheets.\n3. Create a new Sheet in your Google Drive named 'Fleet Export - ${dataType}'.\n4. Push all ${dataType.toLowerCase()} data to the new sheet.\n\nThis functionality is currently a placeholder.`);
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-2xl font-bold text-text-primary">Data & Export</h2>
                <p className="mt-2 text-text-secondary max-w-2xl">
                    This is a local-first application. All your data is securely stored in your browser's IndexedDB, which means it's fast, available offline, and completely private. You can optionally connect to a cloud database to sync your data across devices.
                </p>
                <p className="mt-2 text-text-secondary max-w-2xl">
                    You can export any of your data at any time in either CSV or JSON format.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExportCard 
                    title="Vehicles"
                    icon={<CarIcon className="w-7 h-7 text-accent" />}
                    count={vehicles.length}
                    onExportCsv={() => exportAsCsv(vehicles, 'vehicles')}
                    onExportJson={() => exportAsJson(vehicles, 'vehicles')}
                    onExportGSheet={() => handleExportGSheet('Vehicles')}
                />
                <ExportCard 
                    title="Inspections"
                    icon={<ClipboardListIcon className="w-7 h-7 text-accent" />}
                    count={inspections.length}
                    onExportCsv={() => exportAsCsv(inspections, 'inspections')}
                    onExportJson={() => exportAsJson(inspections, 'inspections')}
                    onExportGSheet={() => handleExportGSheet('Inspections')}
                />
                <ExportCard 
                    title="Customers"
                    icon={<UserIcon className="w-7 h-7 text-accent" />}
                    count={customers.length}
                    onExportCsv={() => exportAsCsv(customers, 'customers')}
                    onExportJson={() => exportAsJson(customers, 'customers')}
                    onExportGSheet={() => handleExportGSheet('Customers')}
                />
                <ExportCard 
                    title="Inspectors"
                    icon={<BriefcaseIcon className="w-7 h-7 text-accent" />}
                    count={inspectors.length}
                    onExportCsv={() => exportAsCsv(inspectors, 'inspectors')}
                    onExportJson={() => exportAsJson(inspectors, 'inspectors')}
                    onExportGSheet={() => handleExportGSheet('Inspectors')}
                />
            </div>
        </div>
    );
};