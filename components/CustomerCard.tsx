import React, { useState, useRef } from 'react';
import type { Customer } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { UserIcon } from './icons/UserIcon';
import { EditIcon } from './icons/EditIcon';
import { localDB } from '../services/localDB';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (customerId: string) => void;
}

const ACTION_WIDTH = 128; // 64px per button

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onEdit, isSelectionMode, isSelected, onToggleSelection }) => {
  const { theme } = useTheme();
  
  const [translateX, setTranslateX] = useState(0);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${customer.name}? This cannot be undone.`)) {
        await localDB.customers.delete(customer.id);
    }
    resetPosition();
  };

  const handleEditClick = () => {
    onEdit(customer);
    resetPosition();
  };
  
  const resetPosition = () => {
    setTranslateX(0);
  };
  
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSelectionMode || theme !== 'arcade') return;
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

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleSelection(customer.id);
    }
  };
    
  return (
    <div 
      onClick={handleClick}
      className={`relative bg-surface rounded-lg shadow-lg border overflow-hidden ${theme === 'arcade' && !isSelectionMode ? 'arcade-border' : ''} transition-all duration-200 ${isSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'border-accent ring-2 ring-accent' : 'border-line'}`}
    >
      {!isSelectionMode && (
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
      )}

      <div 
        className="relative bg-surface w-full p-4 flex items-start gap-4 z-10"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ 
          transform: `translateX(${isSelectionMode ? 0 : translateX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
          touchAction: isSelectionMode ? 'auto' : 'pan-y'
        }}
      >
        {isSelectionMode && (
          <div className="flex items-center justify-center h-full pr-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(customer.id)}
              className="form-checkbox h-5 w-5 rounded bg-surface border-line text-accent focus:ring-accent"
              aria-label={`Select customer ${customer.name}`}
            />
          </div>
        )}
        <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <UserIcon className="w-7 h-7 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold text-text-primary ${theme === 'arcade' ? 'arcade-text-glow' : ''}`}>
                {customer.name}
            </h3>
            <p className="text-sm text-text-secondary truncate">
                {customer.email}
            </p>
            <p className="text-sm text-text-secondary">
                {customer.phone}
            </p>
        </div>
      </div>
    </div>
  );
};