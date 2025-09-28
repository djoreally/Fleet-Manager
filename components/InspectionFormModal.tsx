import React, { useState, useEffect } from 'react';
import type { Vehicle, ChecklistItem, ChecklistStatus, ChecklistTemplate, MediaAttachment } from '../types';
import { localDB } from '../services/localDB';
import { useChecklistTemplates } from '../hooks/useChecklistTemplates';
import { useInspectors } from '../hooks/useInspectors';
import { AddMediaModal } from './AddMediaModal';
import { MediaThumbnail } from './MediaThumbnail';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface LocationState {
  latitude?: number;
  longitude?: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

interface InspectionFormModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSaveSuccess: (inspectionId: string) => void;
}

export const InspectionFormModal: React.FC<InspectionFormModalProps> = ({ vehicle, onClose, onSaveSuccess }) => {
  const [inspectorId, setInspectorId] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [overallNotes, setOverallNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [addingMediaToItemId, setAddingMediaToItemId] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationState>({ status: 'idle', message: '' });
  
  const templates = useChecklistTemplates();
  const inspectors = useInspectors();

  useEffect(() => {
    // Automatically capture geolocation when the modal opens
    setLocation({ status: 'loading', message: 'Getting location...' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          status: 'success',
          message: 'Location captured'
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocation({ status: 'error', message: `Location error: ${error.message}` });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    // When a template is selected, populate the checklist
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setChecklist(template.items.map(item => ({
          id: item.id,
          name: item.name,
          status: 'pass' as ChecklistStatus,
          notes: '',
          media: [],
        })));
      }
    } else {
      setChecklist([]);
    }
  }, [selectedTemplateId, templates]);

  const handleChecklistChange = (id: string, field: 'status' | 'notes', value: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleMediaCaptured = (media: Omit<MediaAttachment, 'id'>) => {
    if (!addingMediaToItemId) return;

    const newMedia: MediaAttachment = {
        id: crypto.randomUUID(),
        ...media
    };
    
    setChecklist(prev =>
      prev.map(item =>
        item.id === addingMediaToItemId
          ? { ...item, media: [...(item.media || []), newMedia] }
          : item
      )
    );
    setAddingMediaToItemId(null); // Close the modal
  };

  const handleDeleteMedia = (itemId: string, mediaId: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, media: item.media?.filter(m => m.id !== mediaId) }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectorId) {
        alert("Please select an inspector.");
        return;
    }
    if (!selectedTemplateId || checklist.length === 0) {
        alert("Please select an inspection checklist.");
        return;
    }
    setIsSubmitting(true);

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) {
        alert("Selected template not found.");
        setIsSubmitting(false);
        return;
    }
    
    const selectedInspector = inspectors.find(i => i.id === inspectorId);
    if (!selectedInspector) {
        alert("Selected inspector not found.");
        setIsSubmitting(false);
        return;
    }

    try {
      const newInspectionId = crypto.randomUUID();
      await localDB.inspections.add({
        id: newInspectionId,
        vehicleId: vehicle.id,
        inspectorId: selectedInspector.id,
        inspectorName: selectedInspector.name,
        inspectionDate: Date.now(),
        checklist,
        overallNotes,
        checklistTemplateId: selectedTemplate.id,
        checklistTemplateName: selectedTemplate.name,
        status: 'draft',
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: Date.now(),
      });
      onSaveSuccess(newInspectionId);
    } catch (error) {
      console.error("Failed to save inspection:", error);
      alert("Failed to save inspection. Check console for details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const LocationStatusIndicator = () => {
      const statusClasses = {
        loading: 'text-text-tertiary',
        success: 'text-success',
        error: 'text-danger',
        idle: 'text-text-tertiary',
      };

      return (
        <div className={`flex items-center gap-1.5 text-xs ${statusClasses[location.status]}`}>
            {location.status === 'loading' && <SpinnerIcon className="w-3 h-3 animate-spin-slow" />}
            {location.status !== 'loading' && <MapPinIcon className="w-3 h-3" />}
            <span>{location.message}</span>
        </div>
      );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-3xl bg-surface-glass backdrop-blur-md rounded-lg shadow-xl border border-line animate-fade-in-up flex flex-col"
          style={{maxHeight: '90vh'}}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-line">
            <h3 className="text-lg font-semibold text-text-primary">New Inspection</h3>
            <p className="text-sm text-text-secondary">{vehicle.year} {vehicle.make} {vehicle.model}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inspectorName" className="block text-sm font-medium text-text-secondary">Inspector</label>
                  <select
                    id="inspectorName"
                    value={inspectorId}
                    onChange={e => setInspectorId(e.target.value)}
                    required
                    className="mt-1 block w-full input"
                  >
                      <option value="" disabled>Select an inspector...</option>
                      {inspectors.map(inspector => (
                          <option key={inspector.id} value={inspector.id}>{inspector.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="checklistTemplate" className="block text-sm font-medium text-text-secondary">Checklist Template</label>
                  <select
                      id="checklistTemplate"
                      value={selectedTemplateId}
                      onChange={e => setSelectedTemplateId(e.target.value)}
                      required
                      className="mt-1 block w-full input"
                  >
                      <option value="" disabled>Select a checklist...</option>
                      {templates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {checklist.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-line pb-2">
                    <h4 className="text-md font-semibold text-text-primary">Checklist Items</h4>
                    <LocationStatusIndicator />
                  </div>
                  {checklist.map(item => (
                    <div key={item.id} className="p-3 bg-background/50 rounded-md">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                        <label className="font-medium text-text-secondary pt-1">{item.name}</label>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          {['pass', 'fail', 'na'].map(status => (
                            <label key={status} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wider cursor-pointer ${item.status === status ? 'radio-checked-' + status : 'radio-unchecked'}`}>
                              <input
                                type="radio"
                                name={`status-${item.id}`}
                                value={status}
                                checked={item.status === status}
                                onChange={(e) => handleChecklistChange(item.id, 'status', e.target.value)}
                                className="sr-only"
                              />
                              {status.toUpperCase()}
                            </label>
                          ))}
                          <button 
                            type="button"
                            onClick={() => setAddingMediaToItemId(item.id)}
                            className="p-2 text-text-tertiary hover:text-accent rounded-md hover:bg-line/50"
                            aria-label="Add media"
                          >
                              <PaperclipIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {item.status === 'fail' && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => handleChecklistChange(item.id, 'notes', e.target.value)}
                                placeholder="Add notes for failure..."
                                className="block w-full text-sm input"
                            />
                        </div>
                      )}
                      {item.media && item.media.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-line/50 flex flex-wrap gap-2">
                            {item.media.map(media => (
                                <MediaThumbnail key={media.id} media={media} onDelete={() => handleDeleteMedia(item.id, media.id)} />
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label htmlFor="overallNotes" className="block text-sm font-medium text-text-secondary">Overall Notes</label>
                <textarea
                  id="overallNotes"
                  value={overallNotes}
                  onChange={e => setOverallNotes(e.target.value)}
                  rows={3}
                  placeholder="Any additional comments..."
                  className="mt-1 block w-full input"
                />
              </div>
            </div>
          
            <div className="p-6 border-t border-line flex flex-col sm:flex-row-reverse gap-3 bg-surface-glass rounded-b-lg">
                <button type="submit" disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Inspection'}
                </button>
                <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 border border-line rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50">
                    Cancel
                </button>
            </div>
          </form>
        </div>
        <style>{`
          @keyframes fade-in-up {
              from {
                  opacity: 0;
                  transform: translateY(20px);
              }
              to {
                  opacity: 1;
                  transform: translateY(0);
              }
          }
          .animate-fade-in-up {
              animation: fade-in-up 0.3s ease-out forwards;
          }
        `}</style>
      </div>
      {addingMediaToItemId && (
        <AddMediaModal 
            onClose={() => setAddingMediaToItemId(null)}
            onMediaCaptured={handleMediaCaptured}
        />
      )}
    </>
  );
};