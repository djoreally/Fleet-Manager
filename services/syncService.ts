
import { localDB } from "./localDB";
import type { Vehicle, Inspection, ChecklistTemplate, Customer, Inspector, UserSettings } from "../types";
import { getSupabase } from "./supabaseClient";

// Pushes all local data to the cloud.
export async function pushToCloud() {
  const supabase = getSupabase();
  
  const localVehicles = await localDB.vehicles.toArray();
  console.log(`Pushing ${localVehicles.length} vehicles to cloud...`);
  if (localVehicles.length > 0) {
    const { error } = await supabase.from("vehicles").upsert(localVehicles);
    if (error) {
      console.error("Error pushing vehicles to cloud:", error);
      throw error;
    }
  }

  const localInspections = await localDB.inspections.toArray();
  console.log(`Pushing ${localInspections.length} inspections to cloud...`);
  if (localInspections.length > 0) {
    const { error } = await supabase.from("inspections").upsert(localInspections);
    if (error) {
        console.error("Error pushing inspections to cloud:", error);
        throw error;
    }
  }

  const localTemplates = await localDB.checklistTemplates.toArray();
  console.log(`Pushing ${localTemplates.length} checklist templates to cloud...`);
  if (localTemplates.length > 0) {
    const { error } = await supabase.from("checklist_templates").upsert(localTemplates);
    if (error) {
        console.error("Error pushing checklist templates to cloud:", error);
        throw error;
    }
  }
  
  const localCustomers = await localDB.customers.toArray();
  console.log(`Pushing ${localCustomers.length} customers to cloud...`);
  if (localCustomers.length > 0) {
    const { error } = await supabase.from("customers").upsert(localCustomers);
    if (error) {
        console.error("Error pushing customers to cloud:", error);
        throw error;
    }
  }
  
  const localInspectors = await localDB.inspectors.toArray();
  console.log(`Pushing ${localInspectors.length} inspectors to cloud...`);
  if (localInspectors.length > 0) {
    const { error } = await supabase.from("inspectors").upsert(localInspectors);
    if (error) {
        console.error("Error pushing inspectors to cloud:", error);
        throw error;
    }
  }

  const localSettings = await localDB.userSettings.toArray();
  console.log(`Pushing ${localSettings.length} user settings to cloud...`);
  if (localSettings.length > 0) {
    const { error } = await supabase.from("user_settings").upsert(localSettings);
    if (error) {
        console.error("Error pushing user settings to cloud:", error);
        throw error;
    }
  }
}

// Pulls all cloud data to the local database.
export async function pullFromCloud() {
  const supabase = getSupabase();
  
  console.log("Pulling vehicles from cloud...");
  const { data: vehiclesData, error: vehiclesError } = await supabase.from("vehicles").select("*");
  if (vehiclesError) {
    console.error("Error pulling vehicles from cloud:", vehiclesError);
    throw vehiclesError;
  }
  if (vehiclesData) {
    console.log(`Received ${vehiclesData.length} vehicles from cloud. Merging locally...`);
    await localDB.vehicles.bulkPut(vehiclesData as Vehicle[]);
  }

  console.log("Pulling inspections from cloud...");
  const { data: inspectionsData, error: inspectionsError } = await supabase.from("inspections").select("*");
  if (inspectionsError) {
    console.error("Error pulling inspections from cloud:", inspectionsError);
    throw inspectionsError;
  }
  if (inspectionsData) {
    console.log(`Received ${inspectionsData.length} inspections from cloud. Merging locally...`);
    // Supabase returns JSON for the checklist, need to parse it.
    const parsedInspections = inspectionsData.map(i => ({...i, checklist: typeof i.checklist === 'string' ? JSON.parse(i.checklist) : i.checklist}));
    await localDB.inspections.bulkPut(parsedInspections as Inspection[]);
  }

  console.log("Pulling checklist templates from cloud...");
  const { data: templatesData, error: templatesError } = await supabase.from("checklist_templates").select("*");
  if (templatesError) {
    console.error("Error pulling templates from cloud:", templatesError);
    throw templatesError;
  }
  if (templatesData) {
    console.log(`Received ${templatesData.length} templates from cloud. Merging locally...`);
    const parsedTemplates = templatesData.map(t => ({...t, items: typeof t.items === 'string' ? JSON.parse(t.items) : t.items}));
    await localDB.checklistTemplates.bulkPut(parsedTemplates as ChecklistTemplate[]);
  }
  
  console.log("Pulling customers from cloud...");
  const { data: customersData, error: customersError } = await supabase.from("customers").select("*");
  if (customersError) {
    console.error("Error pulling customers from cloud:", customersError);
    throw customersError;
  }
  if (customersData) {
    console.log(`Received ${customersData.length} customers from cloud. Merging locally...`);
    await localDB.customers.bulkPut(customersData as Customer[]);
  }

  console.log("Pulling inspectors from cloud...");
  const { data: inspectorsData, error: inspectorsError } = await supabase.from("inspectors").select("*");
  if (inspectorsError) {
    console.error("Error pulling inspectors from cloud:", inspectorsError);
    throw inspectorsError;
  }
  if (inspectorsData) {
    console.log(`Received ${inspectorsData.length} inspectors from cloud. Merging locally...`);
    await localDB.inspectors.bulkPut(inspectorsData as Inspector[]);
  }

  console.log("Pulling user settings from cloud...");
  const { data: settingsData, error: settingsError } = await supabase.from("user_settings").select("*");
  if (settingsError) {
    console.error("Error pulling user settings from cloud:", settingsError);
    throw settingsError;
  }
  if (settingsData) {
    console.log(`Received ${settingsData.length} user settings from cloud. Merging locally...`);
    await localDB.userSettings.bulkPut(settingsData as UserSettings[]);
  }
}

// Subscribes to real-time changes from the cloud.
export function startRealtimeSync() {
  const supabase = getSupabase();
  console.log("Starting real-time sync...");
  
  const handleVehicleChange = async (payload: any) => {
    console.log("Realtime vehicle change received:", payload);
    if (payload.new) {
        await localDB.vehicles.put(payload.new as Vehicle);
    } else if (payload.eventType === 'DELETE' && payload.old) {
        await localDB.vehicles.delete(payload.old.id);
    }
  };

  const handleInspectionChange = async (payload: any) => {
    console.log("Realtime inspection change received:", payload);
    if (payload.new) {
        const inspection = payload.new as Inspection;
        // Supabase returns JSON for the checklist, need to parse it.
        if (typeof inspection.checklist === 'string') {
            inspection.checklist = JSON.parse(inspection.checklist);
        }
        await localDB.inspections.put(inspection);
    } else if (payload.eventType === 'DELETE' && payload.old) {
        await localDB.inspections.delete(payload.old.id);
    }
  };

   const handleTemplateChange = async (payload: any) => {
    console.log("Realtime template change received:", payload);
    if (payload.new) {
        const template = payload.new as ChecklistTemplate;
        if (typeof template.items === 'string') {
            template.items = JSON.parse(template.items);
        }
        await localDB.checklistTemplates.put(template);
    } else if (payload.eventType === 'DELETE' && payload.old) {
        await localDB.checklistTemplates.delete(payload.old.id);
    }
  };
  
  const handleCustomerChange = async (payload: any) => {
    console.log("Realtime customer change received:", payload);
    if (payload.new) {
        await localDB.customers.put(payload.new as Customer);
    } else if (payload.eventType === 'DELETE' && payload.old) {
        await localDB.customers.delete(payload.old.id);
    }
  };

  const handleInspectorChange = async (payload: any) => {
    console.log("Realtime inspector change received:", payload);
    if (payload.new) {
        await localDB.inspectors.put(payload.new as Inspector);
    } else if (payload.eventType === 'DELETE' && payload.old) {
        await localDB.inspectors.delete(payload.old.id);
    }
  };

  const handleSettingsChange = async (payload: any) => {
    console.log("Realtime user settings change received:", payload);
    if (payload.new) {
        await localDB.userSettings.put(payload.new as UserSettings);
    }
  };

  return supabase
    .channel("db-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "vehicles" },
      handleVehicleChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "inspections" },
      handleInspectionChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "checklist_templates" },
      handleTemplateChange
    )
     .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "customers" },
      handleCustomerChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "inspectors" },
      handleInspectorChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "user_settings" },
      handleSettingsChange
    )
    .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('Real-time sync subscribed successfully!');
        }
        if (status === 'CHANNEL_ERROR') {
            console.error('Real-time sync channel error.');
        }
    });
}