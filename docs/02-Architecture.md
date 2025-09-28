# Documentation: System Architecture

### **Target Audience:** All Developers (Frontend, Backend, Database Administrators)

---

## 1. High-Level Architecture

The application is a **Progressive Web App (PWA)** built on a **local-first architecture**. The client is a self-contained static application that runs entirely in the browser. It uses the browser's IndexedDB for storage and can optionally synchronize with a Supabase backend.

A simple representation of the data flow:

```
          +-----------------+
          |   User / UI     |
          +-------+---------+
                  | (React)
        +---------v---------+
        |   React App       |
        | (Components/Hooks)|
        +---------+---------+
                  | (useLiveQuery)
+-----------------v------------------+      (Real-time Sync, Push/Pull)
|      Dexie.js / IndexedDB          |  <------------------------------>  +-----------------------+
| (Local Browser Database)           |                                    |   Supabase Backend    |
| - vehicles table                   |                                    | - PostgreSQL Database |
| - inspections table                |                                    | - Realtime Engine     |
| - ...etc                           |                                    |                       |
+------------------------------------+                                    +-----------------------+
```

## 2. Frontend Client

- **Framework:** **React 19** with TypeScript.
- **Styling:** **Tailwind CSS** is used for utility-first styling. A theme-aware CSS variable system is defined in `index.html` and managed via the `ThemeContext` to allow runtime theme switching (Light, Dark, Arcade).
- **Core Libraries:**
    - **`dexie`**: A powerful wrapper for IndexedDB that simplifies database operations.
    - **`dexie-react-hooks`**: Provides the `useLiveQuery` hook, which is fundamental to the application's reactivity. It creates a subscription to a database query and automatically re-renders the component when the underlying data changes.

## 3. Local Database

- **Technology:** **IndexedDB**, a standard low-level API for client-side storage of large amounts of structured data.
- **Abstraction Layer:** **Dexie.js** is used to provide a clean, promise-based API over IndexedDB's more verbose event-based API. It also handles schema definition and database versioning.
- **Schema Definition (`services/localDB.ts`):** This file is the single source of truth for the local database schema. It defines all tables (object stores) and their indexes. Any change to the data structure that requires indexing must be done here, accompanied by a version bump.
- **Data Models (`types.ts`):** This file contains all TypeScript interfaces for the application's data entities (e.g., `Vehicle`, `Inspection`). It serves as the canonical reference for the shape of the data.

## 4. Cloud Synchronization (Backend)

- **Technology:** **Supabase**. The frontend is designed to work with a Supabase project that mirrors the local database schema.
- **Components Used:**
    - **PostgreSQL Database:** The primary data store in the cloud.
    - **Realtime Engine:** Listens for database changes and broadcasts them to subscribed clients.
    - **REST API:** Supabase automatically generates a RESTful API, which is accessed via the `supabase-js` client library.

- **Synchronization Logic (`services/syncService.ts`):** This service is the bridge between the local database and the Supabase backend.
    - **Connection:** The user provides their Supabase URL and `anon` key in the settings, which initializes the `supabase-js` client. These credentials are not stored.
    - **Initial Sync:** On first connection, the service performs a two-way sync:
        1.  `pushToCloud()`: Uploads all local records to Supabase using `upsert`.
        2.  `pullFromCloud()`: Downloads all cloud records and merges them into the local Dexie database using `bulkPut`.
    - **Real-Time Sync (`startRealtimeSync()`):** After the initial sync, the client subscribes to changes in the remote database. When a change event is received (e.g., an update from another device), the payload is used to update the corresponding record in the local Dexie database. The UI then updates automatically thanks to the `useLiveQuery` hooks.
    - **Conflict Resolution:** The current strategy is **"Last Write Wins"**, based on a `updatedAt` Unix timestamp (milliseconds) present on every record. When data is pushed or pulled, the record with the newer timestamp is considered the source of truth.

## 5. Third-Party Services

- **NHTSA vPIC API:** A public API used for decoding Vehicle Identification Numbers (VINs). The logic is contained in `services/nhtsaService.ts`. This is a simple `fetch` call and is one of the few features that requires an internet connection to use.
