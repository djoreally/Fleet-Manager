import React, { useState, useEffect } from 'react';
import type { Vehicle, ChecklistItem, ChecklistStatus, ChecklistTemplate } from '../types';
import { localDB } from '../services/localDB';
import { useChecklistTemplates } from '../hooks/useChecklistTemplates';
import { AddVehicleForm } from './AddVehicleForm';

// The second step of the inspection flow, containing the checklist form.
const InspectionStep: React.FC<{ vehicle: Vehicle; onSave: () => void; onClose: () => void }> = ({ vehicle, onSave, onClose }) => {
    const [inspectorName, setInspectorName] = useState('');
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [overallNotes, setOverallNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const templates = useChecklistTemplates();

    useEffect(() => {
      // Set a default template if available
      if (templates.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(templates[0].id);
      }
    }, [templates, selectedTemplateId]);

    useEffect(() => {
        if (selectedTemplateId) {
            const template = templates.find(t => t.id === selectedTemplateId);
            if (template) {
                setChecklist(template.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    status: 'pass' as ChecklistStatus,
                    notes: '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inspectorName) {
            alert("Please enter the inspector's name.");
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

        try {
            await localDB.inspections.add({
                id: crypto.randomUUID(),
                vehicleId: vehicle.id,
                inspectorName,
                inspectionDate: Date.now(),
                checklist,
                overallNotes,
                checklistTemplateId: selectedTemplate.id,
                checklistTemplateName: selectedTemplate.name,
                updatedAt: Date.now(),
            });
            onSave();
        } catch (error) {
            console.error("Failed to save inspection:", error);
            alert("Failed to save inspection. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="inspectorName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Inspector Name</label>
                        <input
                            type="text"
                            id="inspectorName"
                            value={inspectorName}
                            onChange={e => setInspectorName(e.target.value)}
                            required
                            placeholder="e.g., Jane Doe"
                            className="mt-1 block w-full input"
                        />
                    </div>
                    <div>
                        <label htmlFor="checklistTemplate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Checklist Template</label>
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
                        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Checklist Items</h4>
                        {checklist.map(item => (
                            <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <label className="font-medium text-slate-700 dark:text-slate-200">{item.name}</label>
                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        {['pass', 'fail', 'na'].map(status => (
                                            <label key={status} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${item.status === status ? 'radio-checked-' + status : 'radio-unchecked'}`}>
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
                            </div>
                        ))}
                    </div>
                )}
                <div>
                    <label htmlFor="overallNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Overall Notes</label>
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
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row-reverse gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                <button type="submit" disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 dark:disabled:bg-sky-800 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Saving...' : 'Save Inspection'}
                </button>
                <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50">
                    Cancel
                </button>
            </div>
        </form>
    );
};


// The main modal component that orchestrates the two-step flow.
export const NewInspectionFlowModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const [step, setStep] = useState<'addVehicle' | 'fillInspection'>('addVehicle');
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);

    const handleVehicleAdded = (newVehicle: Vehicle) => {
        setVehicle(newVehicle);
        setStep('fillInspection');
    };
    
    const headerConfig = {
        addVehicle: {
            title: 'New Inspection: Step 1 of 2',
            subtitle: 'Enter Vehicle Details',
        },
        fillInspection: {
            title: 'New Inspection: Step 2 of 2',
            subtitle: `Complete the checklist for ${vehicle?.year || ''} ${vehicle?.make || ''} ${vehicle?.model || ''}`,
        },
    };
    const currentHeader = headerConfig[step];

    return (
        <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up flex flex-col"
                style={{maxHeight: '90vh'}}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{currentHeader.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{currentHeader.subtitle}</p>
                </div>

                {step === 'addVehicle' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <AddVehicleForm 
                            onVehicleAdded={handleVehicleAdded} 
                            submitButtonText="Continue to Inspection Details"
                            sampleButtonText="Add Sample & Continue to Inspection"
                        />
                    </div>
                )}

                {step === 'fillInspection' && vehicle && (
                    <InspectionStep vehicle={vehicle} onSave={onClose} onClose={onClose} />
                )}
                
                {step === 'addVehicle' && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="w-full sm:w-auto flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                        >
                            Cancel
                        </button>
                    </div>
                )}
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
    );
};
