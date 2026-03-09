# Admin Section — General Guide / מדריך כללי לאזור הניהול

| English | עברית |
|---------|------:|
| The Admin area provides full control over the bowling organization — leagues, seasons, teams, players, scoring, scheduling, and user access. | אזור הניהול מספק שליטה מלאה על ארגון הבאולינג — ליגות, עונות, קבוצות, שחקנים, ניקוד, לוח משחקים וניהול משתמשים. |

---

## User Flows / זרימות עבודה

### 1. Onboarding / First Setup — כניסה ראשונית / הגדרה ראשונה

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | Sign in with Google (the first user to sign in automatically becomes admin). | התחבר עם Google (המשתמש הראשון שנכנס הופך אוטומטית למנהל). | 1 |
| 2 | Go to **Settings** → find the **Getting Started Guide** section → click **Seed Demo Data** to explore with sample data, or begin building your own organization from scratch. | עבור ל**הגדרות** → מצא את חלק **מדריך למתחילים** → לחץ **Seed Demo Data** כדי לחקור עם נתוני דוגמה, או התחל לבנות את הארגון שלך מאפס. | 2 |
| 3 | Navigate to **User Management** → add allowed email addresses for any other users who will join. | עבור ל**ניהול משתמשים** → הוסף כתובות דוא"ל מורשות עבור כל משתמש אחר שיצטרף. | 3 |

### 2. Create a League — יצירת ליגה

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | Navigate to **League Management** from the Admin Dashboard. | נווט ל**ניהול ליגות** מלוח הניהול. | 1 |
| 2 | Click **Create League**. | לחץ **צור ליגה**. | 2 |
| 3 | Set the league name, handicap basis and percentage, scoring rules (points per win), and team size. | הגדר שם ליגה, בסיס אחוז הנדיקאפ, כללי ניקוד (נקודות לניצחון) וגודל קבוצה. | 3 |
| 4 | Save — the league is now ready for seasons. | שמור — הליגה מוכנה עכשיו לעונות. | 4 |

### 3. Create a Season — יצירת עונה

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | Open the league → click **Create Season**. | פתח את הליגה → לחץ **צור עונה**. | 1 |
| 2 | Step through the season creator wizard: enter a name, select the number of rounds and teams. | עבור שלב אחר שלב באשף יצירת העונה: הזן שם, בחר מספר סיבובים וקבוצות. | 2 |
| 3 | Assign players from the player registry to each team slot. | שייך שחקנים מרשימת השחקנים לכל מקום בקבוצה. | 3 |
| 4 | Generate the round-robin schedule. | צור את לוח המשחקים round-robin. | 4 |
| 5 | Activate the season to begin play. | הפעל את העונה כדי להתחיל לשחק. | 5 |

### 4. Build Teams & Assign Players — בניית קבוצות ושיבוץ שחקנים

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | During season creation or via **Team Management** (Season Detail → Teams tab). | במהלך יצירת העונה או דרך **ניהול קבוצות** (פרטי עונה → לשונית קבוצות). | 1 |
| 2 | Select players from the player registry for each team slot. | בחר שחקנים מרשימת השחקנים לכל מקום בקבוצה. | 2 |
| 3 | Handle roster changes mid-season — substitutions are tracked in change history with player name, date, and reason. | טפל בשינויי הרכב במהלך העונה — החלפות מתועדות בהיסטוריית השינויים עם שם שחקן, תאריך וסיבה. | 3 |

### 5. Generate & View Schedule — יצירה וצפייה בלוח המשחקים

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | The schedule auto-generates when the season is created using a round-robin algorithm. | לוח המשחקים נוצר אוטומטית כשהעונה נוצרת באמצעות אלגוריתם round-robin. | 1 |
| 2 | View all match days from **Season Detail → Schedule** tab. | צפה בכל ימי המשחק מ**פרטי עונה → לשונית לוח משחקים**. | 2 |
| 3 | Postpone a match day if needed — all subsequent dates shift forward automatically. | דחה יום משחק אם צריך — כל התאריכים הבאים מתקדמים אוטומטית. | 3 |

### 6. Record a Game — תיעוד משחק

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | Open a pending game from the season schedule. | פתח משחק ממתין מלוח המשחקים של העונה. | 1 |
| 2 | Set the lineup (or confirm the auto-generated lineup). | הגדר סדר שחקנים (או אשר את הסדר שנוצר אוטומטית). | 2 |
| 3 | Enter pin scores for each match. | הזן תוצאות פינים לכל משחק. | 3 |
| 4 | Mark absent players — they are auto-scored as average − 10. | סמן שחקנים נעדרים — הם מקבלים אוטומטית ממוצע פחות 10. | 4 |
| 5 | Points calculate in real time; save when all matches are complete. | הנקודות מחושבות בזמן אמת; שמור כשכל המשחקים מלאים. | 5 |

### 7. Review Pending Player Submissions — סקירת הגשות שחקנים ממתינות

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | When players submit scores via the public score entry link, a **Pending Submission Panel** appears on the game view. | כשהשחקנים שולחים תוצאות דרך קישור ציבורי, מופיע **פאנל הגשה ממתינה** בתצוגת המשחק. | 1 |
| 2 | Review submitted pin scores and absent flags. | סקור תוצאות פינים והסימונים של שחקנים נעדרים. | 2 |
| 3 | Click **Apply** to write the scores to the game, or **Discard** to remove the submission. | לחץ **אשר** כדי לכתוב את הניקוד למשחק, או **בטל** להסרת ההגשה. | 3 |

### 8. View & Print Standings — צפייה בדירוגים והדפסה

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | Open **Season Detail → Standings** tab. | פתח **פרטי עונה → לשונית דירוגים**. | 1 |
| 2 | View team or player standings. | צפה בדירוגי קבוצות או שחקנים. | 2 |
| 3 | Click **Print Match Day** to open print options. | לחץ **הדפס יום משחק** לפתיחת אפשרויות הדפסה. | 3 |
| 4 | Select which reports to include and print. | בחר אילו דוחות לכלול והדפס. | 4 |

### 9. Manage Players (Registry) — ניהול שחקנים (רשימה)

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | Navigate to **Player Registry** from the Admin Dashboard. | נווט ל**רשימת שחקנים** מלוח הניהול. | 1 |
| 2 | Add, edit, or deactivate players. | הוסף, ערוך או השבת שחקנים. | 2 |
| 3 | Import a player list from CSV or JSON, or export the full registry. | ייבא רשימת שחקנים מ-CSV או JSON, או ייצא את הרשימה המלאה. | 3 |

### 10. Manage Users & Access — ניהול משתמשים וגישה

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | Navigate to **User Management** from the Admin Dashboard. | נווט ל**ניהול משתמשים** מלוח הניהול. | 1 |
| 2 | Add email addresses to the whitelist so other users can sign in. | הוסף כתובות דוא"ל לרשימה המורשית כדי שמשתמשים אחרים יוכלו להתחבר. | 2 |
| 3 | Promote a user to admin or link their account to a player profile in the registry. | קדם משתמש למנהל או קשר את החשבון שלו לפרופיל שחקן ברשימה. | 3 |

### 11. Complete a Season — סיום עונה

| # | English | עברית | # |
|---|---------|------:|--:|
| 1 | When all games have been played, open **Season Detail**. | כשכל המשחקים שוחקו, פתח **פרטי עונה**. | 1 |
| 2 | Mark the season as **Completed** — final standings are locked. | סמן את העונה כ**הושלמה** — הדירוגים הסופיים נעולים. | 2 |
| 3 | The season remains available for historical statistics. | העונה נשמרת לצורך סטטיסטיקות היסטוריות. | 3 |

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
