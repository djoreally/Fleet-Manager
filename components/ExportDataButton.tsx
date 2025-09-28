import React, { useState, useEffect, useRef } from 'react';
import { exportAsCsv, exportAsJson } from '../services/exportService';
import { DownloadIcon } from './icons/DownloadIcon';

interface ExportDataButtonProps {
  data: any[];
  fileNamePrefix: string;
}

export const ExportDataButton: React.FC<ExportDataButtonProps> = ({ data, fileNamePrefix }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleExport = (format: 'csv' | 'json') => {
    if (data.length === 0) {
        alert("There is no data to export.");
        setIsOpen(false);
        return;
    }

    if (format === 'csv') {
        exportAsCsv(data, fileNamePrefix);
    } else {
        exportAsJson(data, fileNamePrefix);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={wrapperRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full items-center gap-2 rounded-md border border-line px-4 py-2 bg-surface text-sm font-medium text-text-secondary hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <DownloadIcon className="w-5 h-5" />
          Export Data
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-surface ring-1 ring-line ring-opacity-50 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left block px-4 py-2 text-sm text-text-secondary hover:bg-line/50 hover:text-text-primary"
              role="menuitem"
            >
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left block px-4 py-2 text-sm text-text-secondary hover:bg-line/50 hover:text-text-primary"
              role="menuitem"
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
