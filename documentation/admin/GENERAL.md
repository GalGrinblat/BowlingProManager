# Admin Section — General Guide

The Admin area provides full control over the bowling organization — leagues, seasons, teams, players, scoring, scheduling, and user access.

---

## עברית / Hebrew

אזור הניהול מספק שליטה מלאה על ארגון הבולינג — ליגות, עונות, קבוצות, שחקנים, ניקוד, לוח משחקים וניהול משתמשים.

---

## User Flows

### 1. Onboarding / First Setup

1. Sign in with Google (the first user to sign in automatically becomes admin).
2. Go to **Settings** → find the **Getting Started Guide** section → click **Seed Demo Data** to explore with sample data, or begin building your own organization from scratch.
3. Navigate to **User Management** → add allowed email addresses for any other users who will join.

### 2. Create a League

1. Navigate to **League Management** from the Admin Dashboard.
2. Click **Create League**.
3. Set the league name, handicap basis and percentage, scoring rules (points per win), and team size.
4. Save — the league is now ready for seasons.

### 3. Create a Season

1. Open the league → click **Create Season**.
2. Step through the season creator wizard: enter a name, select the number of rounds and teams.
3. Assign players from the player registry to each team slot.
4. Generate the round-robin schedule.
5. Activate the season to begin play.

### 4. Build Teams & Assign Players

1. During season creation or via **Team Management** (Season Detail → Teams tab).
2. Select players from the player registry for each team slot.
3. Handle roster changes mid-season — substitutions are tracked in change history with player name, date, and reason.

### 5. Generate & View Schedule

1. The schedule auto-generates when the season is created using a round-robin algorithm.
2. View all match days from **Season Detail → Schedule** tab.
3. Postpone a match day if needed — all subsequent dates shift forward automatically.

### 6. Record a Game

1. Open a pending game from the season schedule.
2. Set the lineup (or confirm the auto-generated lineup).
3. Enter pin scores for each match.
4. Mark absent players — they are auto-scored as average − 10.
5. Points calculate in real time; save when all matches are complete.

### 7. Review Pending Player Submissions

1. When players submit scores via the public score entry link, a **Pending Submission Panel** appears on the game view.
2. Review submitted pin scores and absent flags.
3. Click **Apply** to write the scores to the game, or **Discard** to remove the submission.

### 8. View & Print Standings

1. Open **Season Detail → Standings** tab.
2. View team or player standings.
3. Click **Print Match Day** to open print options.
4. Select which reports to include and print.

### 9. Manage Players (Registry)

1. Navigate to **Player Registry** from the Admin Dashboard.
2. Add, edit, or deactivate players.
3. Import a player list from CSV or JSON, or export the full registry.

### 10. Manage Users & Access

1. Navigate to **User Management** from the Admin Dashboard.
2. Add email addresses to the whitelist so other users can sign in.
3. Promote a user to admin or link their account to a player profile in the registry.

### 11. Complete a Season

1. When all games have been played, open **Season Detail**.
2. Mark the season as **Completed** — final standings are locked.
3. The season remains available for historical statistics.

---

## זרימות עבודה / User Flows (עברית)

### 1. כניסה ראשונית / הגדרה ראשונה

1. התחבר עם Google (המשתמש הראשון שנכנס הופך אוטומטית למנהל).
2. עבור ל**הגדרות** → מצא את חלק **מדריך למתחילים** → לחץ **Seed Demo Data** כדי לחקור עם נתוני דוגמה, או התחל לבנות את הארגון שלך מאפס.
3. עבור ל**ניהול משתמשים** → הוסף כתובות דוא"ל מורשות עבור כל משתמש אחר שיצטרף.

### 2. יצירת ליגה

1. נווט ל**ניהול ליגות** מלוח הניהול.
2. לחץ **צור ליגה**.
3. הגדר שם ליגה, בסיס אחוז הנדיקאפ, כללי ניקוד (נקודות לניצחון) וגודל קבוצה.
4. שמור — הליגה מוכנה עכשיו לעונות.

### 3. יצירת עונה

1. פתח את הליגה → לחץ **צור עונה**.
2. עבור שלב אחר שלב באשף יצירת העונה: הזן שם, בחר מספר סיבובים וקבוצות.
3. שייך שחקנים מרשימת השחקנים לכל מקום בקבוצה.
4. צור את לוח המשחקים round-robin.
5. הפעל את העונה כדי להתחיל לשחק.

### 4. בניית קבוצות ושיבוץ שחקנים

1. במהלך יצירת העונה או דרך **ניהול קבוצות** (פרטי עונה → לשונית קבוצות).
2. בחר שחקנים מרשימת השחקנים לכל מקום בקבוצה.
3. טפל בשינויי הרכב במהלך העונה — החלפות מתועדות בהיסטוריית השינויים עם שם שחקן, תאריך וסיבה.

### 5. יצירה וצפייה בלוח המשחקים

1. לוח המשחקים נוצר אוטומטית כשהעונה נוצרת באמצעות אלגוריתם round-robin.
2. צפה בכל ימי המשחק מ**פרטי עונה → לשונית לוח משחקים**.
3. דחה יום משחק אם צריך — כל התאריכים הבאים מתקדמים אוטומטית.

### 6. תיעוד משחק

1. פתח משחק ממתין מלוח המשחקים של העונה.
2. הגדר סדר שחקנים (או אשר את הסדר שנוצר אוטומטית).
3. הזן תוצאות פינות לכל מאצ'.
4. סמן שחקנים נעדרים — הם מקבלים אוטומטית ממוצע פחות 10.
5. הנקודות מחושבות בזמן אמת; שמור כשכל המאצ'ים מלאים.

### 7. סקירת הגשות שחקנים ממתינות

1. כשהשחקנים שולחים תוצאות דרך קישור ציבורי, מופיע **פאנל הגשה ממתינה** בתצוגת המשחק.
2. סקור תוצאות פינות והסימונים של שחקנים נעדרים.
3. לחץ **אשר** כדי לכתוב את הניקוד למשחק, או **בטל** להסרת ההגשה.

### 8. צפייה בדירוגים והדפסה

1. פתח **פרטי עונה → לשונית דירוגים**.
2. צפה בדירוגי קבוצות או שחקנים.
3. לחץ **הדפס יום משחק** לפתיחת אפשרויות הדפסה.
4. בחר אילו דוחות לכלול והדפס.

### 9. ניהול שחקנים (רשימה)

1. נווט ל**רשימת שחקנים** מלוח הניהול.
2. הוסף, ערוך או השבת שחקנים.
3. ייבא רשימת שחקנים מ-CSV או JSON, או ייצא את הרשימה המלאה.

### 10. ניהול משתמשים וגישה

1. נווט ל**ניהול משתמשים** מלוח הניהול.
2. הוסף כתובות דוא"ל לרשימה המורשית כדי שמשתמשים אחרים יוכלו להתחבר.
3. קדם משתמש למנהל או קשר את החשבון שלו לפרופיל שחקן ברשימה.

### 11. סיום עונה

1. כשכל המשחקים שוחקו, פתח **פרטי עונה**.
2. סמן את העונה כ**הושלמה** — הדירוגים הסופיים נעולים.
3. העונה נשמרת לצורך סטטיסטיקות היסטוריות.

---

## Pages in this Section

| Page | Description |
|------|-------------|
| [Admin Dashboard](ADMIN_DASHBOARD.md) | Component overview and feature list |
| [League Overview](LEAGUE_OVERVIEW.md) | League configuration, scoring rules, handicap |
| [Season Overview](SEASON_OVERVIEW.md) | Season lifecycle, schedule generation, configuration |
| [Player Registry](PLAYER_REGISTRY.md) | Player management, import/export, CSV/JSON |
| [User Management](USER_MANAGEMENT.md) | Email whitelist, roles, player linking |
| [Settings](SETTINGS.md) | Organization name, language, danger zone |
| [Print Module](PRINT_MODULE.md) | Print reports, components, and usage |
