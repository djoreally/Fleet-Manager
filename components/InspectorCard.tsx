import React, { useState, useRef } from 'react';
import type { Inspector } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { EditIcon } from './icons/EditIcon';
import { localDB } from '../services/localDB';

interface InspectorCardProps {
  inspector: Inspector;
  onEdit: (inspector: Inspector) => void;
}

const ACTION_WIDTH = 128; // 64px per button

export const InspectorCard: React.FC<InspectorCardProps> = ({ inspector, onEdit }) => {
  const { theme } = useTheme();

  const [translateX, setTranslateX] = useState(0);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${inspector.name}? This cannot be undone.`)) {
        await localDB.inspectors.delete(inspector.id);
    }
    resetPosition();
  };

  const handleEditClick = () => {
    onEdit(inspector);
    resetPosition();
  };

  const resetPosition = () => {
    setTranslateX(0);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (theme !== 'arcade') return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    const newTranslateX = Math.max(-ACTION_WIDTH, Math.min(0, deltaX));
    setTranslateX(newTranslateX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    if (translateX < -ACTION_WIDTH / 2) {
      setTranslateX(-ACTION_WIDTH);
    } else {
      setTranslateX(0);
    }
  };

  return (
    <div className={`relative bg-surface rounded-lg shadow-lg border border-line overflow-hidden ${theme === 'arcade' ? 'arcade-border' : ''} transition-all`}>
      <div className="absolute top-0 right-0 h-full flex items-center z-0">
        <button onClick={handleEditClick} className="w-16 h-full flex flex-col items-center justify-center bg-accent/80 text-text-inverted hover:bg-accent">
          <EditIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Edit</span>
        </button>
        <button onClick={handleDelete} className="w-16 h-full flex flex-col items-center justify-center bg-danger/80 text-text-inverted hover:bg-danger">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
          <span className="text-xs mt-1">Delete</span>
        </button>
      </div>

      <div
        className="relative bg-surface w-full p-4 flex flex-col justify-between gap-4 z-10"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
          touchAction: 'pan-y'
        }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <BriefcaseIcon className="w-7 h-7 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold text-text-primary ${theme === 'arcade' ? 'arcade-text-glow' : ''}`}>
              {inspector.name}
            </h3>
            <p className="text-sm text-text-secondary truncate">
              {inspector.email}
            </p>
            <p className="text-sm text-text-secondary">
              {inspector.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};