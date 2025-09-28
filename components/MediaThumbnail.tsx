import React from 'react';
import type { MediaAttachment } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface MediaThumbnailProps {
  media: MediaAttachment;
  onDelete: () => void;
}

export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ media, onDelete }) => {
  const src = `data:${media.mimeType};base64,${media.data}`;

  const renderMedia = () => {
    switch (media.type) {
      case 'image':
        return <img src={src} alt="Inspection attachment" className="w-full h-full object-cover" />;
      case 'video':
        return <video src={src} controls className="w-full h-full object-contain bg-background" />;
      case 'audio':
        return <audio src={src} controls className="w-full" />;
      default:
        return null;
    }
  };
  
  const containerClasses = media.type === 'audio' 
    ? "relative w-full p-2 bg-surface rounded-lg"
    // FIX: Changed from w-full to w-24 to avoid stretching audio player
    : "relative w-24 h-24 bg-surface rounded-lg overflow-hidden";

  return (
    <div className={containerClasses}>
      {renderMedia()}
      <button
        onClick={onDelete}
        className="absolute top-1 right-1 p-1 bg-danger/80 text-text-inverted rounded-full hover:bg-danger"
        aria-label="Delete media"
      >
        <TrashIcon className="w-3 h-3" />
      </button>
    </div>
  );
};