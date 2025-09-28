
import { useLiveQuery } from "dexie-react-hooks";
import { localDB } from "../services/localDB";

export function useVehicles() {
  const vehicles = useLiveQuery(
    () => localDB.vehicles.orderBy("updatedAt").reverse().toArray(),
    []
  );
  return vehicles ?? [];
}
