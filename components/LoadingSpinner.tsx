import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <SpinnerIcon className="w-10 h-10 text-accent animate-spin-slow" />
      <p className="text-text-secondary">Loading...</p>
    </div>
  );
};