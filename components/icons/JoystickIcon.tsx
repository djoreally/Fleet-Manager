import React from 'react';

export const JoystickIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.174 6.812a1 1 0 0 0-1.218-1.218l-5.484 2.502-1.58-1.58a1 1 0 1 0-1.414 1.414l1.58 1.58-2.502 5.484a1 1 0 0 0 1.218 1.218l5.484-2.502 1.58 1.58a1 1 0 1 0 1.414-1.414l-1.58-1.58z" />
        <path d="M6.5 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        <path d="M12.5 17.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        <path d="M4 20h16" />
        <path d="M10 20v-4h4v4" />
    </svg>
);
