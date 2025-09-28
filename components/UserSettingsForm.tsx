import React, { useState, useEffect } from 'react';
import { useUserSettings } from '../hooks/useUserSettings';
import { localDB } from '../services/localDB';
import { SpinnerIcon } from './icons/SpinnerIcon';

export const UserSettingsForm: React.FC = () => {
    const currentSettings = useUserSettings();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [logo, setLogo] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentSettings) {
            setName(currentSettings.businessName || '');
            setAddress(currentSettings.businessAddress || '');
            setPhone(currentSettings.businessPhone || '');
            setLogo(currentSettings.logoImage || '');
        }
    }, [currentSettings]);
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await localDB.userSettings.put({
                id: 1,
                businessName: name,
                businessAddress: address,
                businessPhone: phone,
                logoImage: logo,
                updatedAt: Date.now(),
            });
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-surface p-6 rounded-lg shadow-md border border-line">
            <h3 className="text-lg font-semibold mb-1 text-text-primary">Business Settings</h3>
            <p className="text-sm text-text-secondary mb-4">
                Customize the application with your business details and logo.
            </p>
            <form onSubmit={handleSave} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1 space-y-4">
                        <div>
                            <label htmlFor="business-name" className="block text-sm font-medium text-text-secondary">Business Name</label>
                            <input type="text" id="business-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your Company LLC" className="mt-1 block w-full input" />
                        </div>
                         <div>
                            <label htmlFor="business-phone" className="block text-sm font-medium text-text-secondary">Business Phone</label>
                            <input type="tel" id="business-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 867-5309" className="mt-1 block w-full input" />
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                         <label className="block text-sm font-medium text-text-secondary mb-1">Business Logo</label>
                         <div className="w-32 h-32 bg-background rounded-md flex items-center justify-center border-2 border-dashed border-line overflow-hidden">
                            {logo ? (
                                <img src={logo} alt="Business Logo Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-text-tertiary text-center">No Logo</span>
                            )}
                         </div>
                         <input type="file" id="logo-upload" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="sr-only"/>
                         <label htmlFor="logo-upload" className="mt-2 block w-full text-center text-sm font-medium text-accent cursor-pointer hover:underline">
                            Upload Image
                         </label>
                    </div>
                </div>
                 <div>
                    <label htmlFor="business-address" className="block text-sm font-medium text-text-secondary">Business Address</label>
                    <textarea id="business-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, Anytown, USA" rows={3} className="mt-1 block w-full input" />
                </div>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSaving && <SpinnerIcon className="w-5 h-5 animate-spin-slow" />}
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
};