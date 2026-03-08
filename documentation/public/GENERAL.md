# Public Section — General Guide

The Public area of Bowling Pro Manager is accessible to anyone — no login required. It provides a live scoreboard for all active leagues and a dedicated score entry page for players to submit game results.

---

## עברית / Hebrew

האזור הציבורי של Bowling Pro Manager נגיש לכולם — ללא צורך בהתחברות. הוא מספק לוח תוצאות חי לכל הליגות הפעילות ודף הזנת תוצאות ייעודי לשחקנים.

---

## User Flows

### 1. Browse League Standings

1. Open `/board` (or navigate to the app URL and select the board view).
2. See all active leagues listed with their current status.
3. Click a league to view its seasons.
4. Click a season to view team and player standings in real time.

### 2. View Game Results

1. From the board, drill into a season.
2. Select a completed game from the schedule.
3. See the full match-by-match results with scores, handicaps, and points breakdown for each player and team.

### 3. Submit Game Scores

1. Receive the game link from your admin, or scan the QR code displayed at the venue.
2. Open `/score/:gameId` — no login is needed.
3. **Step 1**: Confirm the lineup and mark any absent players.
4. **Step 2**: Enter the pin total for each player, match by match.
5. **Step 3**: Review all scores and click Submit.
6. Your admin reviews the submission in the admin panel and applies it to the official game record.

### 4. Draft Recovery

1. If you accidentally close the score entry page, reopen the same link in the same browser.
2. A "Draft recovered" notification appears at the top of the page.
3. Your previously entered scores are restored — continue from where you left off without re-entering anything.

---

## זרימות עבודה / User Flows (עברית)

### 1. עיון בדירוגי הליגה

1. פתח `/board` (או נווט לכתובת ה-URL של האפליקציה ובחר בתצוגת הלוח).
2. ראה את כל הליגות הפעילות עם הסטטוס הנוכחי שלהן.
3. לחץ על ליגה כדי לצפות בעונות שלה.
4. לחץ על עונה כדי לצפות בדירוגי קבוצות ושחקנים בזמן אמת.

### 2. צפייה בתוצאות משחק

1. מהלוח, היכנס לפרטי עונה.
2. בחר משחק שהושלם מלוח המשחקים.
3. ראה את התוצאות המלאות מאצ' אחר מאצ' עם ניקוד, הנדיקאפ ופירוט הנקודות לכל שחקן וקבוצה.

### 3. הגשת תוצאות משחק

1. קבל את קישור המשחק מהמנהל שלך, או סרוק את קוד ה-QR המוצג במגרש.
2. פתח `/score/:gameId` — לא נדרשת התחברות.
3. **שלב 1**: אשר את ההרכב וסמן שחקנים נעדרים.
4. **שלב 2**: הזן את סך הפינות לכל שחקן, מאצ' אחר מאצ'.
5. **שלב 3**: סקור את כל הניקוד ולחץ **שלח**.
6. המנהל סוקר את ההגשה בלוח הניהול ומחיל אותה על רשומת המשחק הרשמית.

### 4. שחזור טיוטה

1. אם סגרת בטעות את דף הזנת הניקוד, פתח מחדש את אותו קישור באותו דפדפן.
2. הודעת "טיוטה שוחזרה" מופיעה בחלק העליון של הדף.
3. הניקוד שהזנת קודם לכן משוחזר — המשך מהמקום שבו הפסקת ללא צורך בהזנה מחדש.

---

## Pages in this Section

| Page | Description |
|------|-------------|
| [Public Board](PUBLIC_BOARD.md) | Live scoreboard, routes, API details, caching |
| [Score Entry](SCORE_ENTRY.md) | Player score submission, 3-step flow, draft persistence |
