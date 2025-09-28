import React from 'react';

export const CogIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M12 2v2" />
        <path d="M12 22v-2" />
        <path d="m17 20.66-1-1.73" />
        <path d="m11 10.27 1 1.73" />
        <path d="m7 3.34 1 1.73" />
        <path d="m13 13.73-1-1.73" />
        <path d="M2 12h2" />
        <path d="M22 12h-2" />
        <path d="m17 3.34-1 1.73" />
        <path d="m11 13.73 1-1.73" />
        <path d="m7 20.66 1-1.73" />
        <path d="m13 10.27-1 1.73" />
    </svg>
);