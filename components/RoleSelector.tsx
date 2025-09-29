import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { WrenchIcon } from './icons/WrenchIcon';

const roles = [
    { name: 'manager', label: 'Manager', icon: <BriefcaseIcon className="w-6 h-6" /> },
    { name: 'technician', label: 'Technician', icon: <WrenchIcon className="w-6 h-6" /> },
];

export const RoleSelector: React.FC = () => {
    const { user } = useAuth();
    const currentRole = user?.role || 'manager';

    const handleSetRole = async (role: string) => {
        // TODO: Implement a backend endpoint to update the user's role.
        // For now, this is a placeholder.
        alert(`Role switching is not yet implemented. You are currently a ${currentRole}.`);
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