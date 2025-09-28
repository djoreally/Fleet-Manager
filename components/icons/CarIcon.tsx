import React from 'react';

export const CarIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 16.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2.5" />
    <path d="M19 17h2a2 2 0 0 0 2-2v-3.17a2 2 0 0 0-1.11-1.79l-3.9-2.05a2 2 0 0 0-1.9 0L3.11 9.04a2 2 0 0 0-1.11 1.79V15a2 2 0 0 0 2 2h2" />
    <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
);