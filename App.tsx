import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FleetPage } from './pages/FleetPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { ChecklistsPage } from './pages/ChecklistsPage';
import { CustomersPage } from './pages/CustomersPage';
import { InspectorsPage } from './pages/InspectorsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ExportPage } from './pages/ExportPage';

// Import Components
import { AppLayout } from './components/AppLayout'; // Assuming we create a reusable layout
import { LoadingSpinner } from './components/LoadingSpinner';

// A component to protect routes that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner while we verify the user's token
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
  }

  if (!user) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      
      {/* Protected Routes */}
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/fleet" element={<ProtectedRoute><AppLayout><FleetPage /></AppLayout></ProtectedRoute>} />
      <Route path="/inspections" element={<ProtectedRoute><AppLayout><InspectionsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/checklists" element={<ProtectedRoute><AppLayout><ChecklistsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><AppLayout><CustomersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/inspectors" element={<ProtectedRoute><AppLayout><InspectorsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/export" element={<ProtectedRoute><AppLayout><ExportPage /></AppLayout></ProtectedRoute>} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}