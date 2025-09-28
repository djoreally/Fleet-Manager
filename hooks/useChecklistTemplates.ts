import { useLiveQuery } from "dexie-react-hooks";
import { localDB } from "../services/localDB";
import type { ChecklistTemplate } from "../types";

export function useChecklistTemplates(): ChecklistTemplate[] {
  const templates = useLiveQuery(
    () => localDB.checklistTemplates.orderBy("updatedAt").reverse().toArray(),
    [],
    []
  );
  return templates;
}
