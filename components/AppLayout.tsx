import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth(); // We can get user info like role here

  // In a real app, you'd get the role from the decoded user token
  const userRole = user?.role || 'manager';

  return (
    <div className="relative z-10 min-h-screen antialiased">
      <Navigation
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userRole={userRole}
      />

      <div className="md:pl-60 transition-all duration-300 ease-in-out">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-surface-glass backdrop-blur-md rounded-xl border border-line/50 p-6">
              {children}
            </div>
          </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
        ></div>
      )}
    </div>
  );
};