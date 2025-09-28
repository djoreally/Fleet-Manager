import React, { useState, useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { SyncStatus, type Vehicle, type Customer, type Inspector } from "./types";
import { connectSupabase } from "./services/supabaseClient";
import { pushToCloud, pullFromCloud, startRealtimeSync } from "./services/syncService";
import { localDB } from "./services/localDB";
import { ThemeProvider } from "./contexts/ThemeContext";
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
  const [currentPage, setCurrentPage] = useState('home');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.OFFLINE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
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
  
  useEffect(() => {
    // When role changes, navigate to an appropriate default page if the current page is not allowed for the role.
    const allowedTechnicianPages = ['home', 'fleet', 'inspections', 'settings'];
    if (userRole === 'technician' && !allowedTechnicianPages.includes(currentPage)) {
        setCurrentPage('fleet');
    }
  }, [userRole, currentPage]);

  useEffect(() => {
    // Cleanup subscription on component unmount
    return () => {
      if (realtimeChannel) {
        realtimeChannel.unsubscribe();
      }
    };
  }, [realtimeChannel]);

  const handleConnect = async (url: string, key: string) => {
    setSyncStatus(SyncStatus.CONNECTING);
    setErrorMessage(null);
    try {
      connectSupabase(url, key);
      
      // Perform initial sync
      await pushToCloud();
      await pullFromCloud();
      
      // Start listening for real-time updates
      const channel = startRealtimeSync();
      setRealtimeChannel(channel);

      setSyncStatus(SyncStatus.LIVE);
    } catch (error) {
      console.error("Connection failed:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Connection failed: ${message}`);
      setSyncStatus(SyncStatus.ERROR);
    }
  };

  const handleSaveVehicle = async (updatedData: Omit<Vehicle, 'id' | 'updatedAt'>) => {
    if (!editingVehicle) return;

    await localDB.vehicles.put({
      ...editingVehicle,
      ...updatedData,
      updatedAt: Date.now(),
    });
  };

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

  const handleContinueToApp = () => {
      if (settings.onboardingComplete) {
        if (userRole === 'technician') {
            setCurrentPage('fleet');
        } else {
            setCurrentPage('dashboard');
        }
      } else {
          setCurrentPage('onboarding');
      }
  };

  const handleOnboardingComplete = async () => {
    await localDB.userSettings.update(1, { onboardingComplete: true, updatedAt: Date.now() });
    if (userRole === 'technician') {
        setCurrentPage('fleet');
    } else {
        setCurrentPage('dashboard');
    }
  };

  const renderPage = () => {
    switch(currentPage) {
        case 'home':
            return <HomePage 
                        onContinueToApp={handleContinueToApp} 
                        installPromptEvent={installPromptEvent}
                        onInstall={handleInstall}
                    />;
        case 'onboarding':
            return <OnboardingPage onComplete={handleOnboardingComplete} />;
        case 'dashboard':
            return <DashboardPage onVehicleAddedForInspection={handleVehicleAddedAndStartInspection} />;
        case 'fleet':
            return <FleetPage onEditVehicle={setEditingVehicle} onViewInspections={setViewingInspectionsFor} />;
        case 'inspections':
            return <InspectionsPage />;
        case 'checklists':
            return <ChecklistsPage />;
        case 'customers':
            return <CustomersPage onEditCustomer={setEditingCustomer} onCreateCustomer={() => setIsCreatingCustomer(true)} />;
        case 'inspectors':
            return <InspectorsPage onEditInspector={setEditingInspector} onCreateInspector={() => setIsCreatingInspector(true)} />;
        case 'export':
            return <ExportPage />;
        case 'settings':
            return <SettingsPage syncStatus={syncStatus} errorMessage={errorMessage} onConnect={handleConnect} />;
        default:
            return <HomePage 
                        onContinueToApp={handleContinueToApp} 
                        installPromptEvent={installPromptEvent}
                        onInstall={handleInstall}
                    />;
    }
  };
  
  const isInsideApp = currentPage !== 'home' && currentPage !== 'onboarding';

  return (
    <div className="relative z-10 min-h-screen antialiased">
      {isInsideApp && (
          <Navigation 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            userRole={userRole}
          />
      )}
      
      {isInsideApp ? (
          <div className="md:pl-60 transition-all duration-300 ease-in-out">
              <Header onMenuClick={() => setIsSidebarOpen(true)} />
              <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-surface-glass backdrop-blur-md rounded-xl border border-line/50 p-6">
                  {renderPage()}
                </div>
              </main>
          </div>
      ) : (
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderPage()}
          </main>
      )}
      
      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && isInsideApp && (
        <div 
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
        ></div>
      )}
      
      {editingVehicle && (
        <EditVehicleModal 
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSave={handleSaveVehicle}
        />
      )}

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
            <AppContent />
        </ThemeProvider>
    )
}