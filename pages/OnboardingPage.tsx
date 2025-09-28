import React, { useState } from 'react';
import { UserSettingsForm } from '../components/UserSettingsForm';
import { InspectorForm } from '../components/InspectorForm';
import { CarIcon } from '../components/icons/CarIcon';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'settings' | 'inspector'>('settings');

    const handleSettingsSaved = () => {
        setStep('inspector');
    };

    const handleInspectorSaved = () => {
        onComplete();
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-2xl mx-auto">
                <div className="flex justify-center mb-8">
                    <div className="bg-accent/10 p-4 rounded-full">
                        <CarIcon className="w-12 h-12 text-accent" />
                    </div>
                </div>
                
                <ol className="flex items-center w-full mb-8 px-4">
                    <li className={`flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b-2 after:inline-block ${step === 'settings' ? 'text-accent after:border-line' : 'text-text-primary after:border-accent'}`}>
                        <span className={`flex items-center justify-center w-10 h-10 font-bold rounded-full lg:h-12 lg:w-12 shrink-0 ${step === 'settings' ? 'bg-accent/20' : 'bg-accent/90 text-text-inverted'}`}>
                            1
                        </span>
                    </li>
                    <li className="flex items-center">
                         <span className={`flex items-center justify-center w-10 h-10 font-bold rounded-full lg:h-12 lg:w-12 shrink-0 ${step === 'inspector' ? 'bg-accent/20' : 'bg-surface border-2 border-line'}`}>
                            2
                        </span>
                    </li>
                </ol>

                <div className="bg-surface-glass backdrop-blur-md rounded-xl border border-line/50">
                    {step === 'settings' && (
                        <div className="p-1">
                            <div className="p-6 text-center">
                                <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome! Let's get started.</h2>
                                <p className="text-text-secondary">First, let's set up your business information. This will be used in reports and throughout the app.</p>
                            </div>
                            <UserSettingsForm 
                                onSaveSuccess={handleSettingsSaved} 
                                submitButtonText="Save & Continue"
                            />
                        </div>
                    )}
                    {step === 'inspector' && (
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-text-primary mb-2">Almost there!</h2>
                                <p className="text-text-secondary">Now, add at least one inspector. You can add more later from the 'Inspectors' page.</p>
                            </div>
                            <InspectorForm 
                                onSaveSuccess={handleInspectorSaved}
                                submitButtonText="Finish Setup"
                                showCancelButton={false}
                             />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
