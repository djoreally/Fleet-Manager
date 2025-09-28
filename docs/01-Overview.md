# Documentation: Application Overview

### **Target Audience:** All Stakeholders (Project Managers, Business Owners, Developers)

---

## 1. Purpose

The **Local-First Vehicle Fleet Manager** is a modern web application designed to streamline the process of managing and inspecting a fleet of vehicles. It addresses the common challenge of needing to perform critical tasks in environments with unreliable or non-existent internet access, such as remote job sites, large warehouses, or underground parking garages.

The application empowers inspectors and managers to perform their duties efficiently from any device with a web browser, ensuring that data is never lost and work is never interrupted by network issues.

## 2. The "Local-First" Philosophy

The most important concept to understand about this application is its **local-first architecture**.

- **What it means:** The application functions as a complete, standalone tool on the user's device (laptop, tablet, or phone). All data is stored locally in the browser's database. It does not require an internet connection to add vehicles, perform inspections, or view history.

- **Why it matters:**
    - **Reliability:** The app is immune to network outages. Work can continue anywhere, anytime.
    - **Performance:** Interactions are instantaneous. There is no waiting for data to be sent to or received from a server.
    - **Privacy:** By default, all data resides on the user's device, ensuring maximum privacy and data ownership.

- **Optional Cloud Sync:** While fully functional offline, the application can be connected to a cloud backend (Supabase). This provides powerful enhancements:
    - **Data Backup:** Protects against data loss if a device is lost or its cache is cleared.
    - **Multi-Device Access:** A user can start an inspection on a tablet and complete the report on their laptop, with all data seamlessly synchronized.

## 3. Key Features

The application provides a comprehensive suite of tools for fleet management:

- **Fleet Management:** Add, view, edit, and delete vehicles from your fleet. A VIN decoder helps add new vehicles quickly and accurately.
- **Detailed Inspections:**
    - Create and manage reusable checklist templates.
    - Conduct inspections using these templates, marking items as pass, fail, or not applicable.
    - Attach rich media evidence—**photos, video clips, and audio notes**—directly to any checklist item.
- **Customer & Inspector Management:** Maintain a directory of customers and inspectors to assign to reports.
- **Workflow & Reporting:**
    - Inspections are saved as drafts and can be explicitly marked as "Sent".
    - Generate clean, text-based reports that can be easily sent via email or SMS.
    - Create bulk reports that combine multiple inspections for a single customer.
- **Data Export:** Download all application data (vehicles, inspections, etc.) into universal CSV or JSON formats for backup, analysis, or integration with other systems.

## 4. Business Value

This application provides tangible benefits to any business managing a vehicle fleet:

- **Increased Efficiency:** Faster data entry and instantaneous access to information reduce time spent on administrative tasks.
- **Improved Accuracy:** Digital checklists and mandatory fields ensure that inspections are consistent and complete. Media attachments provide indisputable evidence.
- **Enhanced Reliability:** Empowers employees to work effectively in any environment, removing dependency on network connectivity.
- **Centralized & Secure Data:** When synced, data is centralized in the cloud, providing a single source of truth that is backed up and secure.
