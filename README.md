# Local-First Vehicle Fleet Manager

This is a progressive web application for managing vehicle fleets with a robust offline-first architecture. It allows users to manage vehicles, conduct inspections, and handle customer data seamlessly, with or without an internet connection.

## Core Philosophy: Local-First

The application is built on a "local-first" principle, meaning all core functionality is available offline. Data is stored and managed directly in the user's browser, providing a fast, reliable, and private user experience. Optional cloud synchronization is available for data backup and multi-device access.

## Key Features

- **Full Offline Functionality**: Perform all CRUD (Create, Read, Update, Delete) operations on vehicles, inspections, customers, and inspectors without an internet connection.
- **VIN Decoding**: Automatically populate vehicle details using the NHTSA API by entering a VIN.
- **Detailed Inspections**: Use customizable checklist templates to conduct thorough vehicle inspections.
- **Rich Media Attachments**: Attach photos, videos, and audio notes to individual inspection items.
- **Status Tracking**: Inspections are tracked with `draft` or `sent` status for better workflow management.
- **Data Export**: Easily export all core data as CSV or JSON files for backup or external use.
- **Themable UI**: Switch between Light, Dark, and Arcade themes to customize the user experience.
- **Optional Cloud Sync**: Connect to a Supabase backend for real-time data synchronization and backup across multiple devices.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Local Database**: IndexedDB with [Dexie.js](https://dexie.org/) for a powerful and friendly API.
- **Reactivity**: [dexie-react-hooks](https://dexie.org/docs/react/useLiveQuery) for seamless, real-time UI updates from the local database.
- **Cloud Synchronization (Optional)**: [Supabase](https://supabase.com/) for PostgreSQL database, real-time sync, and authentication.

## Getting Started

This is a static web application. All files are self-contained and require no build step. To run the application, simply serve the root directory containing `index.html` using any static file server.

Example using Python:
```bash
python -m http.server
```

## Project Structure

The codebase is organized into logical directories:

- `/components`: Contains all reusable React components, from simple icons to complex modals.
- `/contexts`: Manages global UI state, such as the application theme.
- `/hooks`: Custom React hooks that query the local database using `dexie-react-hooks`. This is the primary way data is supplied to the UI.
- `/pages`: Top-level components that represent the main screens of the application.
- `/services`: Core application logic, including database schema definition (`localDB.ts`), cloud sync orchestration (`syncService.ts`), and external API calls (`nhtsaService.ts`).
- `types.ts`: A single source of truth for all data models and types used throughout the application.

## Detailed Documentation

For in-depth information about the application's architecture, developer guides, and user manual, please refer to the documents in the `/docs` directory.
