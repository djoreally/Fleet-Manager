import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserSettingsForm } from '../components/UserSettingsForm';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { RoleSelector } from '../components/RoleSelector';

export const SettingsPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="p-4 bg-surface rounded-lg shadow-md border border-line">
        <h2 className="text-xl font-bold text-text-primary">Account</h2>
        <p className="text-text-secondary">Manage your account settings.</p>
        {user && <p className="mt-2 text-text-primary">Logged in as: {user.email}</p>}
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors"
        >
          Logout
        </button>
      </div>

      <RoleSelector />
      <ThemeSwitcher />
      <UserSettingsForm />
    </div>
  );
};