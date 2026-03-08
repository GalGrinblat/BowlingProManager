# User Management

The User Management page gives admins full control over who can access the application and what role each user has.

- **Route**: `/admin/users`
- **Key files**: `src/components/admin/UserManagement.tsx`, `src/services/api/` (usersApi, allowedEmailsApi)

---

## Purpose

The app uses Google OAuth for authentication. Because any Google account could attempt to sign in, access is restricted to a whitelist of allowed email addresses. Once a user signs in for the first time, an admin can assign them a role and link them to a player profile in the registry.

---

## Email Whitelist

Only email addresses on the whitelist may log in. This is enforced at the Supabase auth layer via the `allowed_emails` table.

### How it works

- On sign-in, Supabase checks whether the user's email exists in `allowed_emails`.
- If the email is not on the list, the login is rejected.
- Admins manage this list from the User Management page.

### Managing the whitelist

| Action | How |
|--------|-----|
| Add an email | Enter the email address and optional notes, then click Add |
| Remove an email | Click the delete icon next to the email entry |

The `notes` field is optional and intended for internal use (e.g., "Thursday night team captain").

---

## Registered Users

The Registered Users section lists all accounts that have signed in at least once.

### User fields

| Field | Description |
|-------|-------------|
| Email | Google account email address |
| Role | `admin` or `player` |
| Linked Player | Optional — the player profile in the registry this account belongs to |
| Join Date | When the user first signed in |

### First user

The very first user to sign in is automatically assigned the `admin` role. All subsequent users default to the `player` role.

---

## Role Management

Admins can change any user's role between `admin` and `player` at any time.

- **admin**: Full access to all admin views, CRUD on leagues/seasons/players/games, user management.
- **player**: Read-only access to their own player dashboard, standings, and game history. Can also submit scores via the public score entry link.

To change a role, select the desired role from the dropdown next to the user's name and save.

---

## Player Linking

A user account can be linked to a player record in the player registry. This connection enables the player dashboard to show personalized statistics and game history.

- Only users with the `player` role are typically linked to a player profile.
- Admin users may also be linked if they participate as players.
- Linking is optional — a user without a linked player profile can still log in and use the app, but will not see personal stats.

To link a user, select a player from the dropdown in the user's row and save.

To unlink, clear the player selection and save.

---

## Notes

- Users are created automatically on first Google OAuth sign-in; they cannot be created manually.
- Removing an email from the whitelist does not deactivate an existing user account — it only prevents future sign-ins from that email.
- Deleting user data requires using the Danger Zone in Settings.

See also: [Admin Dashboard](ADMIN_DASHBOARD.md) | [Player Registry](PLAYER_REGISTRY.md) | [Settings](SETTINGS.md)
