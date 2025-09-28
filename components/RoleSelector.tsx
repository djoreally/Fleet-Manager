import React from 'react';
import { useUserSettings } from '../hooks/useUserSettings';
import { localDB } from '../services/localDB';
import type { UserSettings } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { WrenchIcon } from './icons/WrenchIcon';


// FIX: The type for `icon` was too generic (`React.ReactElement`), causing TypeScript to fail to infer the element's props. By specifying `React.ReactElement<{ className?: string }>`, we provide the necessary type information for `React.cloneElement` to correctly validate the `className` prop, resolving the type error.
const roles: { name: NonNullable<UserSettings['userRole']>; label: string; icon: React.ReactElement<{ className?: string }>; }[] = [
    { name: 'manager', label: 'Manager', icon: <BriefcaseIcon className="w-6 h-6" /> },
    { name: 'technician', label: 'Technician', icon: <WrenchIcon className="w-6 h-6" /> },
];

export const RoleSelector: React.FC = () => {
    const settings = useUserSettings();
    const currentRole = settings.userRole || 'manager';

    const handleSetRole = async (role: NonNullable<UserSettings['userRole']>) => {
        try {
            await localDB.userSettings.update(1, { userRole: role });
        } catch (error) {
            console.error("Failed to update user role:", error);
            alert("Could not save the role. Please try again.");
        }
    };

    return (
        <div className="bg-surface p-6 rounded-lg shadow-md border border-line">
            <h3 className="text-lg font-semibold mb-1 text-text-primary">User Role</h3>
            <p className="text-sm text-text-secondary mb-4">
                Switch between a full-featured manager view and a streamlined technician view.
            </p>
            <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                    <button
                        key={r.name}
                        onClick={() => handleSetRole(r.name)}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-md border-2 transition-colors ${
                            currentRole === r.name
                                ? 'border-accent bg-accent/10'
                                : 'border-line hover:border-accent/50 hover:bg-line/20'
                        }`}
                    >
                        {React.cloneElement(r.icon, { className: `w-6 h-6 ${currentRole === r.name ? 'text-accent' : 'text-text-secondary'}` })}
                        <span className={`text-sm font-medium ${currentRole === r.name ? 'text-accent' : 'text-text-secondary'}`}>{r.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
