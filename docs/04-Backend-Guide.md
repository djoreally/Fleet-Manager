# Documentation: Backend & Database Guide

### **Target Audience:** Backend Developers, Database Administrators, DevOps

---

## 1. Overview

The application is designed to be backend-agnostic but includes a pre-built synchronization service (`syncService.ts`) for **Supabase**. This guide provides instructions for setting up a Supabase project to work seamlessly with the frontend client.

The frontend client expects the backend to provide:
1.  A PostgreSQL database with a schema matching the interfaces in `types.ts`.
2.  A real-time engine that broadcasts database changes.
3.  A RESTful API for querying and mutating data.

Supabase provides all of these out of the box.

## 2. Supabase Project Setup

1.  **Create a Project:** Go to [supabase.com](https://supabase.com), create an account, and start a new project. Store your Project URL and `anon` key securely.

2.  **Create Tables:** Use the SQL Editor in the Supabase dashboard to run the `CREATE TABLE` statements below. This will create the necessary tables with schemas that match the frontend's data models.

3.  **Enable Real-time:**
    - Navigate to **Database > Replication**.
    - You will see your tables listed. Click the "0 tables" button under the `public` schema.
    - Toggle the switch for **all tables** to enable them for real-time broadcasting. This allows `syncService.ts` to subscribe to changes.

4.  **Row Level Security (RLS):**
    - For initial development and testing, you can leave RLS disabled.
    - **For production, you MUST enable RLS on all tables.** This is a critical security measure.
    - You will need to define security policies that control who can access and modify data. A common pattern for multi-tenant apps is to associate data with a `user_id` and create policies like:
        ```sql
        -- Example policy: Users can only see and manage their own vehicles.
        CREATE POLICY "Enable all operations for users based on user_id"
        ON public.vehicles
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        ```
    - **Note:** The current application does not have a user authentication model. To implement multi-tenancy, you would need to add user login functionality and associate a `user_id` with every record.

## 3. SQL Schema

Run the following SQL in your Supabase SQL Editor.

**Important Notes:**
- Fields that can contain complex objects or arrays (like `checklist` in `inspections`) are defined as `JSONB`. The frontend `syncService` correctly handles serializing/deserializing these fields.
- `updated_at` is a `BIGINT` to store a Unix millisecond timestamp, which is used for conflict resolution.

```sql
-- ========= Vehicles =========
CREATE TABLE public.vehicles (
    id TEXT PRIMARY KEY,
    make TEXT,
    model TEXT,
    year INT,
    mileage INT,
    vin TEXT UNIQUE,
    license_plate TEXT,
    oil_filter_part_number TEXT,
    air_filter_part_number TEXT,
    cabin_air_filter_part_number TEXT,
    fuel_filter_part_number TEXT,
    updated_at BIGINT
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- ========= Customers =========
CREATE TABLE public.customers (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    updated_at BIGINT
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ========= Inspectors =========
CREATE TABLE public.inspectors (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    updated_at BIGINT
);
ALTER TABLE public.inspectors ENABLE ROW LEVEL SECURITY;

-- ========= Checklist Templates =========
CREATE TABLE public.checklist_templates (
    id TEXT PRIMARY KEY,
    name TEXT,
    items JSONB,
    updated_at BIGINT
);
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

-- ========= Inspections =========
CREATE TABLE public.inspections (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES public.vehicles(id) ON DELETE CASCADE,
    checklist_template_id TEXT REFERENCES public.checklist_templates(id),
    checklist_template_name TEXT,
    inspector_id TEXT REFERENCES public.inspectors(id),
    inspector_name TEXT,
    inspection_date BIGINT,
    checklist JSONB,
    overall_notes TEXT,
    customer_id TEXT REFERENCES public.customers(id),
    status TEXT,
    updated_at BIGINT
);
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;


-- ========= User Settings =========
-- This table is designed to hold a single row for business-wide settings.
CREATE TABLE public.user_settings (
    id INT PRIMARY KEY,
    business_name TEXT,
    business_address TEXT,
    business_phone TEXT,
    logo_image TEXT, -- Base64 encoded string
    updated_at BIGINT
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
```

## 4. Connecting the Frontend

Once the backend is set up, the end-user can connect the application by:
1.  Navigating to the **Settings** page.
2.  Entering the **Supabase URL** and **Supabase Anon Key** from their project's API settings.
3.  Clicking "Connect & Sync".

The application will then perform the initial two-way sync and begin listening for real-time updates.