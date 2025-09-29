import React from 'react';
import { CarIcon } from './icons/CarIcon';
import { MenuIcon } from './icons/MenuIcon';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { tenant } = useAuth();
  const appName = tenant?.name || 'Fleet Manager';

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center text-center py-6">
             {/* Menu Button for Mobile */}
            <div className="absolute left-0 inset-y-0 flex items-center md:hidden">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 rounded-md text-text-tertiary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Open sidebar"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="flex items-center">
                <CarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-accent mr-3 sm:mr-4"/>
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
                        {appName}
                    </h1>
                    <p className="hidden sm:block mt-1 text-base lg:text-lg text-text-secondary">
                        A modern solution for managing your vehicle fleet.
                    </p>
                </div>
            </div>
        </div>
    </header>
  );
};