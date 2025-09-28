import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { CarIcon } from './icons/CarIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { CogIcon } from './icons/CogIcon';
import { UserIcon } from './icons/UserIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { useUserSettings } from '../hooks/useUserSettings';
import { useTheme } from '../contexts/ThemeContext';
import { DatabaseIcon } from './icons/DatabaseIcon';
import type { UserSettings } from '../types';
import { LayoutGridIcon } from './icons/LayoutGridIcon';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  userRole: UserSettings['userRole'];
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen, userRole }) => {
  const settings = useUserSettings();
  const { theme } = useTheme();
  const appName = settings.businessName || 'Fleet';

  const allNavItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon className="w-5 h-5" />, roles: ['manager', 'technician'] },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGridIcon className="w-5 h-5" />, roles: ['manager'] },
    { id: 'fleet', label: 'My Fleet', icon: <CarIcon className="w-5 h-5" />, roles: ['manager', 'technician'] },
    { id: 'inspections', label: 'Inspections', icon: <ClipboardListIcon className="w-5 h-5" />, roles: ['manager', 'technician'] },
    { id: 'customers', label: 'Customers', icon: <UserIcon className="w-5 h-5" />, roles: ['manager'] },
    { id: 'inspectors', label: 'Inspectors', icon: <BriefcaseIcon className="w-5 h-5" />, roles: ['manager'] },
    { id: 'checklists', label: 'Checklists', icon: <ChecklistIcon className="w-5 h-5" />, roles: ['manager'] },
    { id: 'export', label: 'Data & Export', icon: <DatabaseIcon className="w-5 h-5" />, roles: ['manager'] },
    { id: 'settings', label: 'Settings', icon: <CogIcon className="w-5 h-5" />, roles: ['manager', 'technician'] },
  ];
  
  const navItems = allNavItems.filter(item => item.roles.includes(userRole || 'manager'));

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar after navigation on mobile
  };

  return (
    <nav className={`fixed inset-y-0 left-0 z-40 w-60 bg-surface-glass backdrop-blur-md p-4 flex flex-col gap-4 border-r border-line/50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 px-2">
            {settings.logoImage ? (
                <img src={settings.logoImage} alt="Business Logo" className="w-8 h-8 rounded-md object-cover" />
            ) : (
                <CarIcon className="w-8 h-8 text-accent"/>
            )}
            <span className={`text-xl font-bold text-text-primary ${theme === 'arcade' ? 'arcade-text-glow' : ''}`}>{appName}</span>
        </div>
        <div className="flex flex-col gap-2 mt-4">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        currentPage === item.id 
                        ? 'bg-accent/10 text-accent font-semibold' 
                        : 'text-text-secondary hover:bg-line/50 hover:text-text-primary'
                    }`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    </nav>
  );
};
