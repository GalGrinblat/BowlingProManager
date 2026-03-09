# Settings

The Settings page allows admins to configure organization-level options and perform system-level actions.

- **Route**: `/admin/settings`
- **Key files**: `src/components/admin/Settings.tsx`, `src/services/api/organizationApi.ts`

---

## Organization Settings

### Organization Name

Admins can change the display name of the organization. This name appears throughout the app and on printed reports.

1. Edit the name field.
2. Click Save.

The updated name is saved to the `organization` table in Supabase and reflects immediately across all users.

### Display Language

The app supports English and Hebrew. Switching languages:

- Changes all UI labels, buttons, and messages to the selected language.
- Enables RTL (right-to-left) layout automatically when Hebrew is selected, using Tailwind's `dir:` variants.
- The language preference is saved to the database and applies to all users in the organization.

To change:
1. Select English or Hebrew from the language dropdown.
2. Click Save.
3. The page re-renders with the new language immediately.

---

## System Info

The System Info section displays read-only information about the current deployment:

- **Storage type**: Supabase PostgreSQL (cloud database)
- **Important note**: All data is shared across every user in the organization. There is no per-user isolation — changes made by one admin are visible to all others immediately.

This section is informational only; no settings are editable here.

---

## Demo Data

Demo data seeding is available from the **Admin Dashboard** (not directly from the Settings page). It populates the organization with sample leagues, seasons, teams, and players for exploration and testing.

See the Getting Started section on the Admin Dashboard for the Seed Demo Data button.

---

## Danger Zone

The Danger Zone contains a single destructive action: **Delete All Data**.

### Delete All Data

This action permanently wipes all organization data, including:
- All leagues, seasons, teams, and games
- All players in the registry
- All standings, statistics, and game history
- Organization settings

**Two confirmation dialogs** are shown before the deletion proceeds. Both must be confirmed.

After deletion, the app redirects to the home page and the organization is effectively blank (no data, no leagues).

This action cannot be undone. Export your data first if you need a backup (available via the export function in the admin area).

---

See also: [Admin Dashboard](ADMIN_DASHBOARD.md) | [User Management](USER_MANAGEMENT.md)
