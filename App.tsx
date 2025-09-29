import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { SyncStatus, type Vehicle, type Customer, type Inspector } from "./types";
import { pushToCloud, pullFromCloud, startRealtimeSync } from "./services/syncService";
import { localDB } from "./services/localDB";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useUserSettings } from "./hooks/useUserSettings";

import { Header } from "./components/Header";
import { EditVehicleModal } from "./components/EditVehicleModal";
import { InspectionHistoryModal } from "./components/InspectionHistoryModal";
import { InspectionFormModal } from "./components/InspectionFormModal";
import { Navigation } from "./components/Navigation";
import { AssignCustomerModal } from "./components/AssignCustomerModal";
import { AddEditCustomerModal } from "./components/AddEditCustomerModal";
import { SendReportModal } from "./components/SendReportModal";
import { AddEditInspectorModal } from "./components/AddEditInspectorModal";

import { HomePage } from "./pages/HomePage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FleetPage } from "./pages/FleetPage";
import { InspectionsPage } from "./pages/InspectionsPage";
import { ChecklistsPage } from "./pages/ChecklistsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { InspectorsPage } from "./pages/InspectorsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ExportPage } from "./pages/ExportPage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";

// Placeholder auth pages
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const DEFAULT_CHECKLIST_ITEMS = [
    { name: 'Tire Pressure & Condition' },
    { name: 'Brake Fluid & Pad Wear' },
    { name: 'Engine Oil Level & Quality' },
    { name: 'Coolant Level' },
    { name: 'Headlights, Taillights & Signals' },
    { name: 'Windshield Wipers & Washer Fluid' },
    { name: 'Horn Functionality' },
    { name: 'Battery Terminals & Charge' },
    { name: 'Emergency Kit (Jack, Spare Tire)' },
];


function AppContent() {
  const location = useLocation();
  const [viewingInspectionsFor, setViewingInspectionsFor] = useState<Vehicle | null>(null);
  const [inspectingVehicle, setInspectingVehicle] = useState<Vehicle | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [pendingInspectionId, setPendingInspectionId] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [editingInspector, setEditingInspector] = useState<Inspector | null>(null);
  const [isCreatingInspector, setIsCreatingInspector] = useState(false);
  const [reportToSend, setReportToSend] = useState<{ inspectionId: string; customerId: string } | null>(null);
  
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  const settings = useUserSettings();
  const userRole = settings.userRole || 'manager';
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setInstallPromptEvent(null);
    });
  };

  useEffect(() => {
    const seedData = async () => {
        const count = await localDB.checklistTemplates.count();
        if (count === 0) {
            console.log("Seeding default checklist template...");
            await localDB.checklistTemplates.add({
                id: crypto.randomUUID(),
                name: "Standard Pre-Trip Inspection",
                items: DEFAULT_CHECKLIST_ITEMS.map(item => ({...item, id: crypto.randomUUID()})),
                updatedAt: Date.now(),
            });
        }
        
        const settingsCount = await localDB.userSettings.count();
        if (settingsCount === 0) {
            console.log("Seeding default user settings...");
            await localDB.userSettings.add({
                id: 1,
                businessName: "Fleet Manager",
                businessAddress: "",
                businessPhone: "",
                logoImage: "",
                userRole: 'manager',
                onboardingComplete: false,
                updatedAt: Date.now(),
            });
        }
    };
    seedData();
  }, []);


  const handleStartInspection = (vehicle: Vehicle) => {
    setViewingInspectionsFor(null);
    setInspectingVehicle(vehicle);
  };
  
  const handleVehicleAddedAndStartInspection = (vehicle: Vehicle) => {
    setInspectingVehicle(vehicle);
  };
  
  const handleInspectionSaveSuccess = (inspectionId: string) => {
    setInspectingVehicle(null); // Close inspection modal
    setPendingInspectionId(inspectionId); // Open assign customer modal
  };
  
  const handleSaveCustomer = async (customerData: Omit<Customer, 'id' | 'updatedAt'>) => {
    const customerToSave = {
        id: editingCustomer?.id || crypto.randomUUID(),
        ...customerData,
        updatedAt: Date.now(),
    };
    await localDB.customers.put(customerToSave);
  };

  const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
      <>
        <Navigation
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          userRole={userRole}
        />
        <div className="md:pl-60 transition-all duration-300 ease-in-out">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-surface-glass backdrop-blur-md rounded-xl border border-line/50 p-6">
                {children}
              </div>
            </main>
        </div>
        {isSidebarOpen && (
          <div
              className="fixed inset-0 bg-background/70 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
          ></div>
        )}
      </>
    )
  }
  
  const isInsideApp = !['/', '/login', '/signup', '/onboarding'].includes(location.pathname);

  return (
    <div className="relative z-10 min-h-screen antialiased">
      <Routes>
        <Route path="/" element={<HomePage
            onContinueToApp={() => {}} // This will be handled by router now
            installPromptEvent={installPromptEvent}
            onInstall={handleInstall}
          />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage onVehicleAddedForInspection={handleVehicleAddedAndStartInspection} /></AppLayout></ProtectedRoute>} />
        <Route path="/fleet" element={<ProtectedRoute><AppLayout><FleetPage onViewInspections={setViewingInspectionsFor} /></AppLayout></ProtectedRoute>} />
        <Route path="/inspections" element={<ProtectedRoute><AppLayout><InspectionsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/checklists" element={<ProtectedRoute><AppLayout><ChecklistsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><AppLayout><CustomersPage onEditCustomer={setEditingCustomer} onCreateCustomer={() => setIsCreatingCustomer(true)} /></AppLayout></ProtectedRoute>} />
        <Route path="/inspectors" element={<ProtectedRoute><AppLayout><InspectorsPage onEditInspector={setEditingInspector} onCreateInspector={() => setIsCreatingInspector(true)} /></AppLayout></ProtectedRoute>} />
        <Route path="/export" element={<ProtectedRoute><AppLayout><ExportPage /></AppLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>

      {/* Modals remain here as they are global */}
      {viewingInspectionsFor && (
        <InspectionHistoryModal
          vehicle={viewingInspectionsFor}
          onClose={() => setViewingInspectionsFor(null)}
          onStartInspection={handleStartInspection}
        />
      )}

      {inspectingVehicle && (
        <InspectionFormModal
          vehicle={inspectingVehicle}
          onClose={() => setInspectingVehicle(null)}
          onSaveSuccess={handleInspectionSaveSuccess}
        />
      )}

      {pendingInspectionId && (
        <AssignCustomerModal 
            inspectionId={pendingInspectionId}
            onClose={() => setPendingInspectionId(null)}
            onAssign={(customerId) => {
                setReportToSend({ inspectionId: pendingInspectionId, customerId });
                setPendingInspectionId(null);
            }}
        />
      )}
      
      {(isCreatingCustomer || editingCustomer) && (
        <AddEditCustomerModal 
            customer={editingCustomer}
            onClose={() => {setIsCreatingCustomer(false); setEditingCustomer(null);}}
            onSave={handleSaveCustomer}
        />
      )}

      {(isCreatingInspector || editingInspector) && (
        <AddEditInspectorModal 
            inspector={editingInspector}
            onClose={() => {setIsCreatingInspector(false); setEditingInspector(null);}}
        />
      )}

      {reportToSend && (
        <SendReportModal
            inspectionId={reportToSend.inspectionId}
            customerId={reportToSend.customerId}
            onClose={() => setReportToSend(null)}
        />
      )}
    </div>
  );
}

export default function App() {
    return (
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    )
}