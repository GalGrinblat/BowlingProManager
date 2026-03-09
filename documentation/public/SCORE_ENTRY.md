# Score Entry (Public)

The Score Entry page allows players or team representatives to submit game scores without logging in. It is designed for use on a phone or tablet at the bowling lane.

- **Route**: `/score/:gameId` — public, no authentication required (but works for logged-in players too)
- **Key files**:
  - `src/components/public/score/PlayerScoreEntry.tsx` — main score entry component
  - `src/components/public/score/ScoreLayout.tsx` — page layout wrapper
  - `src/components/admin/game/PendingSubmissionPanel.tsx` — admin review panel

---

## Layout

`ScoreLayout` uses a dark background with no header, optimized for focused data entry on a mobile device.

---

## Submitter Identity

When a logged-in player (role: player) follows the score entry link from their dashboard, their identity is automatically captured in the submission:

- `submitterId` — the player's registry ID
- `submitterName` — the player's display name

This information is displayed in the admin's **Pending Submission Panel** as "Submitted by: Name", making it easy to know which player entered the scores.

If the link is opened by an unauthenticated user (e.g., a team captain scanning a QR code), the submission is still accepted — submitter fields are simply omitted.

---

## How the Admin Shares the Link

From the game view in the admin area:

1. Open a pending game.
2. Find the **Share / Score Entry** section — it displays the public link and a QR code.
3. Share the link with players directly (copy/paste or messaging), or display the QR code for teams to scan at the venue.

The link can be shared before or during the match. Multiple people can open the link, but only one submission per session is accepted (tracked by a unique session ID stored in the browser).

---

## 3-Step Submission Flow

### Step 1: Confirm Lineup

- Both teams' lineups are displayed side by side.
- Players can be marked as **absent** with a toggle.
- Absent players will be automatically scored as **average − 10** in the backend calculation.
- The lineup is read from the game record set up by the admin.

### Step 2: Enter Scores

- Matches are displayed one at a time (e.g., "Match 1 of 3").
- Navigate forward and backward between matches using Previous / Next buttons.
- For each match, enter the **pin total** for each player.
- Absent players' cells are shown with their auto-score pre-filled (average − 10) and are not editable.

### Step 3: Review & Submit

- A summary of all entered scores is displayed for review.
- Both teams and all matches are listed.
- Clicking **Submit** sends the scores to the server as a pending submission.
- A confirmation screen appears after successful submission, including a shareable link and QR code to the board view for the game.

---

## Draft Persistence

Scores are auto-saved to `localStorage` every 500 milliseconds as the player types.

- If the browser tab is closed or the page is accidentally navigated away from, the draft is preserved.
- When the same link is reopened in the same browser, the draft is detected and restored.
- A notification message ("Draft recovered") appears at the top of the page.
- The player can continue from where they left off.

The draft is cleared automatically after a successful submission.

---

## Session Tracking

Each browser generates a unique session ID on first visit to the score entry page. This ID is stored in `localStorage` and sent with the submission.

- Prevents duplicate submissions from the same browser.
- If the same browser submits again for the same game, the previous submission is replaced rather than duplicated.

---

## Before-Unload Warning

If the player attempts to navigate away (close tab, go back, open a different URL) while there is unsaved data, the browser shows a standard warning dialog: "You have unsaved changes. Are you sure you want to leave?"

This prevents accidental data loss mid-entry.

---

## Error States

| State | What Happens |
|-------|-------------|
| `notFound` | The `gameId` does not exist — shows an error message with a link back to the board |
| `completed` | The game is already marked as completed — shows a message and a link to the game result on the board |
| `postponed` | The game has been postponed — shows a message with the new date if available |
| `loadError` | Unexpected error loading game data — shows an error message with a retry option |

---

## QR Code

After a successful submission, the confirmation screen displays:

- A success message.
- A QR code (generated via `qrcode.react`) linking to the game's result on the public board (`/board/games/:gameId`).
- A copyable URL for sharing.

---

## Admin Review

After a player submits scores, the admin game view (`/admin/games/:gameId/play`) shows a **Pending Submission Panel** (`src/components/admin/game/PendingSubmissionPanel.tsx`):

- Displays the submitted pin scores and absent flags for each player.
- Shows **who submitted** the scores (name) and when, if the submitter was logged in as a player.
- **Apply**: writes the submitted scores to the live game record and recalculates bonus points and standings.
- **Discard**: removes the pending submission without applying any changes.

Only one pending submission per game is shown at a time. Applying or discarding clears the panel.

---

See also: [Public Board](PUBLIC_BOARD.md) | [Public General](GENERAL.md) | [Admin Dashboard](../admin/ADMIN_DASHBOARD.md)
