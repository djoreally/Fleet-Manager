import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CarIcon } from '../components/icons/CarIcon';

export const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUp(email, password, businessName);
      // On success, redirect to the login page with a success message
      navigate('/login?status=signup_success');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-surface rounded-xl shadow-lg border border-line/50">
        <div className="text-center mb-8">
            <div className="inline-block bg-accent/10 p-3 rounded-full mb-4">
                <CarIcon className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">Create Your Account</h1>
            <p className="text-text-secondary">Start managing your fleet today.</p>
        </div>

        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label htmlFor="businessName" className="block text-sm font-medium text-text-secondary mb-2">
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="input w-full"
              placeholder="e.g., Acme Auto"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input w-full"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" aria-label="Password" className="block text-sm font-medium text-text-secondary mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input w-full"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-accent text-text-inverted font-semibold rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-accent hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};