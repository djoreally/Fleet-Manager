
import { useLiveQuery } from "dexie-react-hooks";
import { localDB } from "../services/localDB";
import type { Inspector } from "../types";

export function useInspectors(): Inspector[] {
  const inspectors = useLiveQuery(
    () => localDB.inspectors.orderBy("updatedAt").reverse().toArray(),
    [],
    []
  );
  return inspectors;
}