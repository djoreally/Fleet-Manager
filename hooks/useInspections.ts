import { useLiveQuery } from "dexie-react-hooks";
import { localDB } from "../services/localDB";
import type { Inspection } from "../types";

export function useInspections(vehicleId: string): Inspection[] {
  const inspections = useLiveQuery(
    () => localDB.inspections.where('vehicleId').equals(vehicleId).sortBy('inspectionDate'),
    [vehicleId],
    []
  );
  return inspections.reverse();
}

export function useAllInspections(): Inspection[] {
    const inspections = useLiveQuery(
        () => localDB.inspections.orderBy('inspectionDate').reverse().toArray(),
        [],
        []
    );
    return inspections;
}

export function useInspectionCount(vehicleId: string): number {
    const count = useLiveQuery(
        () => localDB.inspections.where({ vehicleId }).count(),
        [vehicleId],
        0
    );
    return count;
}
