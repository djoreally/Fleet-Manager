
import Dexie, { type Table } from "dexie";
import type { Vehicle, Inspection, ChecklistTemplate, Customer, Inspector, UserSettings } from "../types";

class LocalDB extends Dexie {
  vehicles!: Table<Vehicle, string>;
  inspections!: Table<Inspection, string>;
  checklistTemplates!: Table<ChecklistTemplate, string>;
  customers!: Table<Customer, string>;
  inspectors!: Table<Inspector, string>;
  userSettings!: Table<UserSettings, number>;

  constructor() {
    super("local_vehicle_db");
    // Fix: The schema definition should be inside the constructor when subclassing Dexie.
    // FIX: Explicitly cast `this` to `Dexie` to resolve a TypeScript typing error.
    (this as Dexie).version(9).stores({
      vehicles: "id, vin, licensePlate, updatedAt", // Primary key and indexes
      inspections: "id, vehicleId, inspectionDate, customerId, inspectorId, status, updatedAt",
      checklistTemplates: "id, name, updatedAt",
      customers: "id, name, updatedAt",
      inspectors: "id, name, updatedAt",
      userSettings: "id, updatedAt",
    }).upgrade(tx => {
      // This migration function runs if a user opens the app with an older database version.
      // We add the `userRole` field to existing settings if it's not already there.
      return tx.table('userSettings').where('id').equals(1).modify(settings => {
        if (settings && typeof settings.userRole === 'undefined') {
          settings.userRole = 'manager';
        }
      });
    });
  }
}

const localDBInstance = new LocalDB();

export const localDB = localDBInstance;