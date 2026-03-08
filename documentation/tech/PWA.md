# PWA (Progressive Web App)

Bowling Pro Manager is installable as a Progressive Web App on Android, iOS, and desktop. Once installed, it launches in standalone mode (no browser chrome) and works with offline caching for previously loaded data.

---

## Plugin

The PWA is implemented with `vite-plugin-pwa` configured in `vite.config.ts`.

- `registerType: 'autoUpdate'` — the service worker updates automatically in the background when a new version is deployed. Users get the latest version on the next app load without any manual action.

---

## Web App Manifest

| Property | Value |
|----------|-------|
| Name | `Bowling Pro Manager` |
| Short name | `BowlingPro` |
| Description | "Bowling league management — standings, stats, and scores." |
| Display | `standalone` — hides browser chrome when launched from home screen |
| Start URL | `/` |
| Background color | `#1e1b4b` (dark indigo) |
| Theme color | `#7c3aed` (purple) |

### Icons

| File | Size | Purpose |
|------|------|---------|
| `/icons/icon-192x192.png` | 192×192 | Standard icon (any purpose) |
| `/icons/icon-512x512.png` | 512×512 | Large icon (any purpose) |
| `/icons/icon-512x512.png` | 512×512 | Maskable (adaptive icons on Android) |

### Screenshots (for install prompt)

| File | Size | Platform |
|------|------|---------|
| `/screenshots/mobile.png` | 390×844 | Mobile preview |
| `/screenshots/desktop.png` | 1280×800 | Desktop preview |

---

## Service Worker — Caching Strategy

### Static Assets (Pre-cache)

JavaScript bundles, CSS, HTML, images, and fonts are pre-cached by the service worker using workbox glob patterns. These assets are available immediately after install, even offline.

### Supabase API Calls (NetworkFirst)

All requests to `*.supabase.co/*` use the **NetworkFirst** strategy:

| Setting | Value |
|---------|-------|
| Cache name | `supabase-api-cache` |
| Network timeout | 10 seconds — falls back to cache if the network does not respond |
| Max entries | 50 |
| Max age | 5 minutes |

This means the app can display recently loaded standings, game results, and player data when offline or on a slow connection. Data older than 5 minutes is re-fetched from the network when connectivity is restored.

---

## Service Worker Registration

- **File**: `src/main.tsx`
- **Import**: `virtual:pwa-register` — a virtual module provided by `vite-plugin-pwa`
- Registration happens automatically when the app loads. No manual service worker file needs to be maintained.

---

## iOS Limitation

Google OAuth authentication does not work seamlessly inside an installed iOS PWA.

**What happens:**
- When a user taps "Sign in with Google" inside the PWA on iOS, the OAuth redirect opens in Safari instead of returning to the PWA.
- After completing login in Safari, the user is redirected back but may land in Safari rather than the installed app.

**How the app handles this:**
- `LoginView.tsx` detects standalone mode using `navigator.standalone` (iOS-specific) and the `display-mode: standalone` CSS media query.
- When standalone mode is detected on iOS, a warning banner is shown explaining the limitation.
- The banner includes an "Open in Browser" button that deep-links to the login page in Safari, where OAuth works correctly.

**Android:** PWA OAuth works correctly. The OAuth redirect returns to the installed app.

---

## Testing PWA Installation

| Platform | Steps |
|----------|-------|
| Android | Open in Chrome → browser menu → "Add to Home Screen" or use the install button that appears in the URL bar |
| iOS | Open in Safari → Share → "Add to Home Screen" |
| Desktop Chrome/Edge | Install button appears in the address bar after a few seconds |

After installation, open the app from the home screen. The title bar should display the theme color (`#7c3aed`) and there should be no browser address bar or navigation buttons — this confirms standalone mode is active.

---

## Vercel Deployment

`vercel.json` includes a SPA catch-all rewrite rule so all routes serve `index.html`. This is required for PWA routes to function correctly after install. Without this rule, deep links (e.g., `/board/seasons/abc`) would return a 404 on hard refresh.

---

See also: [Routing](ROUTING.md)
