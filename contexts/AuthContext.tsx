import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { apiFetch } from '../services/api';

// Define more specific types for our context
interface User {
  email: string;
  name: string | null;
  role: string;
  onboardingComplete: boolean;
}

interface Tenant {
  id: string;
  name: string;
  logoImage?: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, businessName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // This function logs out the user and clears all state
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setTenant(null);
  };

  // This function fetches user and tenant data from the backend
  const fetchUserSettings = async () => {
    try {
      const settings = await apiFetch('user/settings');
      setUser(settings.user);
      setTenant(settings.tenant);
    } catch (error) {
      console.error("Authentication error: Failed to fetch user settings.", error);
      handleLogout(); // If we can't get settings, the token is likely invalid
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        // We have a token, now let's get the user and tenant info from our backend
        await fetchUserSettings();
      }
      setLoading(false);
    }
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`http://localhost:3001/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const { token: newToken } = await response.json();
    localStorage.setItem('authToken', newToken);
    // After logging in, fetch the user settings
    await fetchUserSettings();
  };

  const signUp = async (email: string, password: string, businessName: string) => {
    const response = await fetch(`http://localhost:3001/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, businessName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Sign-up failed');
    }
  };

  const value = {
    user,
    tenant,
    loading,
    login,
    signUp,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};