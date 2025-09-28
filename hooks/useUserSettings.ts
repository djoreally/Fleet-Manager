

import { useLiveQuery } from "dexie-react-hooks";
import { localDB } from "../services/localDB";
import type { UserSettings } from "../types";

const defaultSettings: UserSettings = {
    id: 1,
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    logoImage: '',
    userRole: 'manager',
    updatedAt: 0,
};

export function useUserSettings(): UserSettings {
  const settings = useLiveQuery(
    () => localDB.userSettings.get(1),
    [],
  );
  return settings ?? defaultSettings;
}