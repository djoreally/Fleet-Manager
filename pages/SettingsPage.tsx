import React from 'react';
import { SyncStatus } from '../types';
import { StatusIndicator } from '../components/StatusIndicator';
import { ConnectForm } from '../components/ConnectForm';
import { UserSettingsForm } from '../components/UserSettingsForm';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { RoleSelector } from '../components/RoleSelector';

interface SettingsPageProps {
    syncStatus: SyncStatus;
    errorMessage: string | null;
    onConnect: (url: string, key: string) => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ syncStatus, errorMessage, onConnect }) => {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-surface rounded-lg shadow-md border border-line">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Sync Status</h2>
          <p className="text-text-secondary">Manage your connection to the cloud.</p>
        </div>
        <StatusIndicator status={syncStatus} />
      </div>

      {errorMessage && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{errorMessage}</p>
        </div>
      )}

      <RoleSelector />
      <ThemeSwitcher />
      <UserSettingsForm />
      <ConnectForm onConnect={onConnect} status={syncStatus} />
    </div>
  );
};