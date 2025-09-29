import React, { useState, useEffect } from 'react';
import { CarIcon } from '../components/icons/CarIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';

interface HomePageProps {
  onContinueToApp: () => void;
  installPromptEvent: any;
  onInstall: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onContinueToApp, installPromptEvent, onInstall }) => {
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }
  }, []);

  return (
    <div className="text-center flex flex-col items-center justify-center p-8 rounded-lg min-h-[60vh]">
        <div className="bg-accent/10 p-4 rounded-full mb-6">
            <CarIcon className="w-16 h-16 text-accent" />
        </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
        Welcome to the Fleet Manager
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-text-secondary mb-8">
        A modern, offline-first application to manage your vehicle fleet with ease. All your data is stored securely on your device, ensuring speed, privacy, and reliability—even without an internet connection.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {!isAppInstalled && installPromptEvent && (
          <button
            onClick={onInstall}
            className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold rounded-lg shadow-lg text-text-inverted bg-accent hover:opacity-90 transition-all transform hover:scale-105"
          >
            <DownloadIcon className="w-6 h-6" />
            Install App
          </button>
        )}
        
        <button
          onClick={onContinueToApp}
          className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold rounded-lg bg-surface hover:bg-line/50 border border-line text-text-secondary transition-colors"
        >
          <span>Continue to App</span>
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </div>

      {isAppInstalled && (
          <p className="mt-6 text-sm text-success">
              ✓ Application is installed and ready for offline use.
          </p>
      )}
    </div>
  );
};
