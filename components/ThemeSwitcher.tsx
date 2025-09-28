import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { JoystickIcon } from './icons/JoystickIcon';

const themes = [
    { name: 'light', label: 'Daylight Shift', icon: <SunIcon className="w-5 h-5" /> },
    { name: 'dark', label: 'Midnight Drive', icon: <MoonIcon className="w-5 h-5" /> },
    { name: 'arcade', label: 'Arcade Mode', icon: <JoystickIcon className="w-5 h-5" /> },
] as const;

export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="bg-surface p-6 rounded-lg shadow-md border border-line">
            <h3 className="text-lg font-semibold mb-1 text-text-primary">Appearance</h3>
            <p className="text-sm text-text-secondary mb-4">
                Choose how you want the application to look.
            </p>
            <div className="grid grid-cols-3 gap-3">
                {themes.map((t) => (
                    <button
                        key={t.name}
                        onClick={() => setTheme(t.name)}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-md border-2 transition-colors ${
                            theme === t.name
                                ? 'border-accent bg-accent/10'
                                : 'border-line hover:border-accent/50 hover:bg-line/20'
                        }`}
                    >
                        {React.cloneElement(t.icon, { className: `w-6 h-6 ${theme === t.name ? 'text-accent' : 'text-text-secondary'}` })}
                        <span className={`text-sm font-medium ${theme === t.name ? 'text-accent' : 'text-text-secondary'}`}>{t.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
