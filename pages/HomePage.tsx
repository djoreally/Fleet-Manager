import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { CarIcon } from '../components/icons/CarIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isContinuing, setIsContinuing] = useState(false);

  const handleContinueToApp = async () => {
    setIsContinuing(true);
    try {
      // Fetch the user's settings to check their onboarding status
      const settings = await apiFetch('user/settings');
      if (settings.user.onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      console.error("Failed to fetch user settings:", error);
      // If fetching settings fails, it's safest to log out the user
      // as their session might be invalid.
      // In a real app, you might want to show an error message.
      navigate('/login');
    } finally {
      setIsContinuing(false);
    }
  };

  const renderAuthButtons = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (user) {
      return (
        <button
          onClick={handleContinueToApp}
          disabled={isContinuing}
          className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold rounded-lg bg-accent text-text-inverted hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50"
        >
          {isContinuing ? <LoadingSpinner /> : (
            <>
              <span>Continue to App</span>
              <ArrowRightIcon className="w-6 h-6" />
            </>
          )}
        </button>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold rounded-lg bg-accent text-text-inverted hover:opacity-90 transition-all transform hover:scale-105"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold rounded-lg bg-surface hover:bg-line/50 border border-line text-text-secondary transition-colors"
        >
          Sign Up
        </button>
      </div>
    );
  };

  return (
    <div className="text-center flex flex-col items-center justify-center p-8 rounded-lg min-h-[60vh]">
        <div className="bg-accent/10 p-4 rounded-full mb-6">
            <CarIcon className="w-16 h-16 text-accent" />
        </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
        Welcome to the Fleet Manager
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-text-secondary mb-8">
        A modern, cloud-based application to manage your vehicle fleet with ease. All your data is stored securely and is accessible from anywhere.
      </p>

      {renderAuthButtons()}
    </div>
  );
};