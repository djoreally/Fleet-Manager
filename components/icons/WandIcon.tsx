import React from 'react';

export const WandIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4V2" />
    <path d="M15 8V6" />
    <path d="M12.5 6.5L14 5" />
    <path d="M10 8L11.5 6.5" />
    <path d="M5 4V2" />
    <path d="M5 8V6" />
    <path d="M7.5 6.5L6 5" />
    <path d="M10 2L8.5 3.5" />
    <path d="M15 22V10a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v12" />
    <path d="M5 22h14" />
  </svg>
);