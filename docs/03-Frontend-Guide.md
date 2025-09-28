# Documentation: Frontend Developer Guide

### **Target Audience:** Frontend Developers

---

## 1. Project Structure

The codebase is organized to promote separation of concerns and maintainability.

- **`/components`**: Contains all reusable React components.
  - `/components/icons`: SVG icon components.
  - Other components are organized by feature (e.g., `VehicleCard.tsx`, `InspectionFormModal.tsx`).
- **`/contexts`**: Manages global UI state that is not part of the database, such as the current theme (`ThemeContext.tsx`).
- **`/hooks`**: Custom React hooks that abstract data-fetching logic from the local database. **This is the primary way components should access data.**
- **`/pages`**: Top-level components that correspond to the main navigation items (e.g., `FleetPage.tsx`, `DashboardPage.tsx`). They are responsible for laying out the page and composing smaller components.
- **`/services`**: Core, non-UI logic.
  - `localDB.ts`: Defines the IndexedDB schema using Dexie.js.
  - `syncService.ts`: Manages all communication with the Supabase backend.
  - `nhtsaService.ts`: Handles VIN decoding via the external NHTSA API.
  - `exportService.ts`: Contains logic for exporting data to CSV and JSON.
- **`App.tsx`**: The root component. It handles routing, manages the state for all modals, and orchestrates major user flows.
- **`types.ts`**: The single source of truth for all data models and type definitions.

## 2. State Management and Data Flow

The application uses a simple but powerful state management strategy.

- **Local/Ephemeral UI State:** Managed within components using standard React hooks like `useState` and `useRef`. This is for state that does not need to persist, like form inputs or modal visibility.
- **Persistent Application State:** All core business data (vehicles, inspections, etc.) is stored in IndexedDB and managed by **Dexie.js**.

The flow of data from the database to the UI is handled reactively:

1.  A custom hook (e.g., `useVehicles` in `hooks/useVehicles.ts`) uses Dexie's `useLiveQuery` to subscribe to a database query (e.g., `localDB.vehicles.toArray()`).
2.  A component (e.g., `VehicleList.tsx`) calls `useVehicles()` to get the current list of vehicles.
3.  When a change occurs in the `vehicles` table (e.g., a new vehicle is added, or a real-time sync updates a record), `useLiveQuery` automatically re-runs the query.
4.  The hook returns the new data, triggering a re-render of the component with the updated information.

**This pattern eliminates the need for manual state management libraries like Redux or Zustand for persistent data.**

## 3. Styling and Theming

- **Styling:** The app uses **Tailwind CSS** for all styling.
- **Theming:** The theme system is based on CSS variables.
  1.  `index.html` defines CSS variables for colors under the `:root` selector (which defaults to the dark theme).
  2.  It also defines overrides for `.light` and `.arcade` classes.
  3.  The `ThemeContext` manages the current theme state.
  4.  When the theme changes, a `useEffect` in `ThemeProvider` adds the corresponding class (`light`, `dark`, or `arcade`) to the `<html>` element, which activates the correct set of CSS variables.
  5.  Components use the theme-aware color names from `tailwind.config.js` (e.g., `bg-surface`, `text-accent`), which map to these CSS variables.

## 4. How to Add a New Data Entity (e.g., "Work Orders")

This is the most common major task. Follow these steps carefully.

**1. Define the Type:**
- Open `types.ts` and add the `WorkOrder` interface. Ensure it has an `id: string` and an `updatedAt: number`.

```typescript
// in types.ts
export interface WorkOrder {
  id: string;
  vehicleId: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  cost: number;
  updatedAt: number;
}
```

**2. Update the Local Database Schema:**
- Open `services/localDB.ts`.
- **Increment the version number**. If the current version is `.version(7)`, change it to `.version(8)`. This is critical for Dexie to trigger a migration.
- Add the new `workOrders` table to the `.stores()` definition. Define the primary key (`id`) and any fields you want to be indexed for fast querying.

```typescript
// in services/localDB.ts
(this as Dexie).version(8).stores({
  // ...existing tables
  workOrders: "id, vehicleId, status, updatedAt",
});
```
- Add the table property to the `LocalDB` class: `workOrders!: Table<WorkOrder, string>;`

**3. Enable Cloud Sync (Optional):**
- Open `services/syncService.ts`.
- Add `workOrders` to `pushToCloud()` and `pullFromCloud()`, mirroring the existing patterns for other tables.
- In `startRealtimeSync()`, create a `handleWorkOrderChange` handler and subscribe to the `work_orders` table in Supabase.

**4. Create a Data Hook:**
- Create a new file `hooks/useWorkOrders.ts`.
- Use `useLiveQuery` to create a hook that fetches work order data.

```typescript
// in hooks/useWorkOrders.ts
import { useLiveQuery } from "dexie-react-hooks";
import { localDB } from "../services/localDB";

export function useWorkOrders(vehicleId?: string) {
  const workOrders = useLiveQuery(
    () => {
      if (vehicleId) {
        return localDB.workOrders.where({ vehicleId }).sortBy('updatedAt');
      }
      return localDB.workOrders.orderBy('updatedAt').reverse().toArray();
    },
    [vehicleId] // Dependency array
  );
  return workOrders ?? [];
}
```

**5. Build the UI:**
- Create new pages and components under `/pages` and `/components`.
- Use your new `useWorkOrders()` hook to get data into your components.
- Use the `localDB.workOrders.add()`, `localDB.workOrders.put()`, and `localDB.workOrders.delete()` methods to perform CRUD operations in response to user actions. The UI will update automatically.

## 5. Modals

The application manages all modals from the root `App.tsx` component.
- A `useState` variable holds the data for the modal (e.g., `const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);`).
- The modal is conditionally rendered based on whether this state is `null`.
- To open a modal, a child component calls a callback function passed down from `App.tsx` (e.g., `onEditVehicle(vehicle)`), which sets the state.
- The modal's `onClose` prop is a function that sets the state back to `null`.
