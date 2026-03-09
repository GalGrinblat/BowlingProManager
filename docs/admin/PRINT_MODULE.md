# Print Module

The Print Module generates printable reports for match days, standings, and rosters. It is designed for leagues that distribute paper score sheets or post standings before or after each match day.

---

## How to Trigger Printing

1. Open the **Season Detail** view for any active or completed season.
2. Click the **Print Match Day** button.
3. The **PrintMatchDayOptions** modal opens — select which reports to include.
4. Click Print. The browser's print dialog opens with formatted output.

---

## Component Reference

| Component | File | Output |
|-----------|------|--------|
| PrintCombined | `src/components/admin/print/PrintCombined.tsx` | Main orchestrator — loads all data and renders the selected views in sequence |
| PrintMatchDayOptions | `src/components/admin/print/PrintMatchDayOptions.tsx` | Modal to select which reports to include before printing |
| MatchDayReport | `src/components/admin/print/MatchDayReport.tsx` | Full match day report with team matchups, handicaps, and player information |
| PrintTeamStandings | `src/components/admin/print/PrintTeamStandings.tsx` | Team standings table formatted for print |
| PrintPlayerStandings | `src/components/admin/print/PrintPlayerStandings.tsx` | Player standings table formatted for print |
| PlayerRosterTable | `src/components/admin/print/PlayerRosterTable.tsx` | Team roster listing each player's average and calculated handicap |
| ScoreSheet | `src/components/admin/print/ScoreSheet.tsx` | Blank score sheet template for manual score entry during bowling |
| SignatureBlock | `src/components/admin/print/SignatureBlock.tsx` | Signature lines for league officials to sign off on results |
| printStyles.css | `src/components/admin/print/printStyles.css` | Print-specific CSS — controls page breaks, margins, and print-only visibility |

---

## Data Loading

`PrintCombined` fetches all required data in parallel using `Promise.all` before rendering:

- Season configuration and schedule
- Team rosters and player assignments
- Completed game results for average calculations
- Current standings

Player averages are calculated dynamically from completed games in the current season. Handicaps are then computed from those averages using the season's handicap configuration (basis, percentage). This means the printed roster always reflects the current state of the season, not the initial averages captured at season start.

---

## Print Layout Notes

- `printStyles.css` controls `@media print` rules: screen-only elements (navigation, buttons) are hidden, page break hints are inserted between reports.
- The MatchDayReport is designed to fit on a standard A4/Letter sheet when each team pairing is printed separately.
- The ScoreSheet provides blank cells for all matches in a game day, with player names and handicaps pre-filled.

---

## Barrel Export Note

`src/components/admin/print/index.ts` exports only `PrintCombined`. The other print components are imported directly by file path in `SeasonDetail.tsx` and other consumers. This is a known structural inconsistency — it is not a bug.

---

See also: [Admin Dashboard](ADMIN_DASHBOARD.md) | [Season Overview](SEASON_OVERVIEW.md)
