# Documentation: User Guide

### **Target Audience:** End-Users

---

Welcome to the **Vehicle Fleet Manager**! This guide will help you get started with the application's key features.

## 1. Understanding "Local-First"

This application is special because it works perfectly **with or without an internet connection**.

- **Your Data is Safe:** All the information you enter—vehicles, inspections, customer details—is saved directly and securely on your device in the browser.
- **Works Anywhere:** You can be in a garage, on a remote site, or anywhere else without internet and still use all features of the app.
- **It's Fast:** Because the data is stored locally, the app is incredibly fast and responsive.

## 2. Core Features

### Managing Your Fleet

- **Adding a Vehicle:**
    1.  Go to the **Dashboard** or **My Fleet** page.
    2.  Fill out the "Add New Vehicle" form.
    3.  **Pro Tip:** If you enter a 17-character VIN (Vehicle Identification Number) and click **Decode**, the app will try to automatically fill in the Make, Model, and Year for you (this part requires internet).
- **Editing or Deleting a Vehicle:**
    1.  Go to the **My Fleet** page.
    2.  On desktop, you can click the "Edit" button on a vehicle card. On mobile or in "Arcade Mode," swipe the vehicle card from right to left to reveal the "Edit" and "Delete" actions.

### Performing an Inspection

1.  Go to the **My Fleet** page.
2.  Find the vehicle you want to inspect and click the **Inspections** button.
3.  In the pop-up window, click **Start New Inspection**.
4.  Fill out the inspection form:
    - Select an **Inspector** and a **Checklist Template**.
    - For each item, choose **PASS**, **FAIL**, or **NA** (Not Applicable).
    - If an item fails, you can add notes.
    - **Attach Media:** Click the paperclip icon next to any checklist item to open the media modal. You can take a photo, record a video, or record an audio note to attach as evidence.
5.  Add any overall notes at the bottom and click **Save Inspection**.

### Generating and Sending Reports

After you save an inspection, you'll be asked to assign a customer.
- You can select an existing customer, add a new one, or skip this step.
- Once a customer is assigned, a report preview will appear.
- You can click **Send via Email** or **Send via Text** to open your device's default mail or messaging app with the report pre-filled.
- After sending, click **Mark as Sent** to update the inspection's status.

## 3. Data & Export

On the **Data & Export** page, you can download a complete copy of your data at any time.
- Choose the data type you want (e.g., Vehicles, Inspections).
- Export as **CSV** (for spreadsheets like Excel or Google Sheets) or **JSON** (for developers or machine-readable backups).

## 4. (Optional) Syncing with the Cloud

If your organization has set up a cloud account with Supabase, you can sync your data. This is useful for backing up your information or using the app on multiple devices.

1.  Go to the **Settings** page.
2.  Enter the **Supabase URL** and **Key** provided by your administrator.
3.  Click **Connect & Sync**.

The status indicator will change from "Offline" to "Live Sync", and your data will be kept up-to-date across all your connected devices.
