import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CarIcon } from '../components/icons/CarIcon';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await login(email);
      setMessage('Check your email for the login link!');
    } catch (error) {
      setMessage('Failed to send login link. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-surface rounded-xl shadow-lg border border-line/50">
        <div className="text-center mb-8">
            <div className="inline-block bg-accent/10 p-3 rounded-full mb-4">
                <CarIcon className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">Login</h1>
            <p className="text-text-secondary">Enter your email to receive a magic link.</p>
        </div>

        <form onSubmit={handleLogin}>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-accent text-text-inverted font-semibold rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-text-secondary">{message}</p>
        )}
      </div>
    </div>
  );
};