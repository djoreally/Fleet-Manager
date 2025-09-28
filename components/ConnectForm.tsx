import React, { useState } from 'react';
import { SyncStatus } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ConnectFormProps {
  onConnect: (url: string, key: string) => Promise<void>;
  status: SyncStatus;
}

export const ConnectForm: React.FC<ConnectFormProps> = ({ onConnect, status }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const isConnecting = status === SyncStatus.CONNECTING;
  const isConnected = status === SyncStatus.LIVE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) {
      onConnect(url, key);
    }
  };

  if (isConnected) {
    return null;
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md border border-line">
      <h3 className="text-lg font-semibold mb-1 text-text-primary">Connect to Cloud Database</h3>
      <p className="text-sm text-text-secondary mb-4">
        Enter your Supabase credentials to enable real-time sync. This data is not stored.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="supabase-url" className="block text-sm font-medium text-text-secondary">
            Supabase URL
          </label>
          <input
            type="text"
            id="supabase-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            className="mt-1 block w-full input"
            required
            disabled={isConnecting}
          />
        </div>
        <div>
          <label htmlFor="supabase-key" className="block text-sm font-medium text-text-secondary">
            Supabase Anon Key
          </label>
          <input
            type="password"
            id="supabase-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="tenant-specific-anon-key"
            className="mt-1 block w-full input"
            required
            disabled={isConnecting}
          />
        </div>
        <button
          type="submit"
          disabled={isConnecting}
          className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting && <SpinnerIcon className="w-5 h-5 animate-spin-slow" />}
          {isConnecting ? 'Connecting...' : 'Connect & Sync'}
        </button>
      </form>
    </div>
  );
};