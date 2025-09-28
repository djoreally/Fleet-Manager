
import { useLiveQuery } from "dexie-react-hooks";
import { localDB } from "../services/localDB";
import type { Customer } from "../types";

export function useCustomers(): Customer[] {
  const customers = useLiveQuery(
    () => localDB.customers.orderBy("updatedAt").reverse().toArray(),
    [],
    []
  );
  return customers;
}
