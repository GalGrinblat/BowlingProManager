# Public Section — General Guide / מדריך כללי לאזור הציבורי

| English | עברית |
|---------|------:|
| The Public area of Bowling Pro Manager is accessible to anyone — no login required. It provides a live scoreboard for all active leagues and a dedicated score entry page for players to submit game results. | האזור הציבורי של Bowling Pro Manager נגיש לכולם — ללא צורך בהתחברות. הוא מספק לוח תוצאות חי לכל הליגות הפעילות ודף הזנת תוצאות ייעודי לשחקנים. |

---

## User Flows / זרימות עבודה

### 1. Browse League Standings — עיון בדירוגי הליגה

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | Open `/board` (or navigate to the app URL and select the board view). | פתח `/board` (או נווט לכתובת ה-URL של האפליקציה ובחר בתצוגת הלוח). | 1 |
| 2 | See all active leagues listed with their current status. | ראה את כל הליגות הפעילות עם הסטטוס הנוכחי שלהן. | 2 |
| 3 | Click a league to view its seasons. | לחץ על ליגה כדי לצפות בעונות שלה. | 3 |
| 4 | Click a season to view team and player standings in real time. | לחץ על עונה כדי לצפות בדירוגי קבוצות ושחקנים בזמן אמת. | 4 |

### 2. View Game Results — צפייה בתוצאות משחק

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | From the board, drill into a season. | מהלוח, היכנס לפרטי עונה. | 1 |
| 2 | Select a completed game from the schedule. | בחר משחק שהושלם מלוח המשחקים. | 2 |
| 3 | See the full match-by-match results with scores, handicaps, and points breakdown for each player and team. | ראה את התוצאות המלאות משחק אחר משחק עם ניקוד, הנדיקאפ ופירוט הנקודות לכל שחקן וקבוצה. | 3 |

### 3. Submit Game Scores — הזנת תוצאות משחק

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | Receive the game link from your admin, or scan the QR code displayed at the venue. | קבל את קישור המשחק מהמנהל שלך, או סרוק את קוד ה-QR המוצג במגרש. | 1 |
| 2 | Open `/score/:gameId` — no login is needed. | פתח `/score/:gameId` — לא נדרשת התחברות. | 2 |
| 3 | **Step 1**: Confirm the lineup and mark any absent players. | **שלב 1**: אשר את ההרכב וסמן שחקנים נעדרים. | 3 |
| 4 | **Step 2**: Enter the pin total for each player, match by match. | **שלב 2**: הזן את סך הפינים לכל שחקן, משחק אחר משחק. | 4 |
| 5 | **Step 3**: Review all scores and click Submit. | **שלב 3**: סקור את כל הניקוד ולחץ **שלח**. | 5 |
| 6 | Your admin reviews the submission in the admin panel and applies it to the official game record. | המנהל סוקר את ההגשה בלוח הניהול ומאשר אותה. | 6 |

### 4. Draft Recovery — שחזור טיוטה

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | If you accidentally close the score entry page, reopen the same link in the same browser. | אם סגרת בטעות את דף הזנת הניקוד, פתח מחדש את אותו קישור באותו דפדפן. | 1 |
| 2 | A "Draft recovered" notification appears at the top of the page. | הודעת "טיוטה שוחזרה" מופיעה בחלק העליון של הדף. | 2 |
| 3 | Your previously entered scores are restored — continue from where you left off without re-entering anything. | הניקוד שהזנת קודם לכן משוחזר — המשך מהמקום שבו הפסקת ללא צורך בהזנה מחדש. | 3 |

---

## Pages in this Section

| Page | Description |
|------|-------------|
| [Public Board](PUBLIC_BOARD.md) | Live scoreboard, routes, API details, caching |
| [Score Entry](SCORE_ENTRY.md) | Player score submission, 3-step flow, draft persistence |
