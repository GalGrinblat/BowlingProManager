# Player Registry - Component Documentation

## Overview

The **Player Registry** is the central hub for managing all players in the bowling organization. It serves as the single source of truth for player data across all leagues and seasons. Players created here can participate in multiple leagues simultaneously while maintaining consistent identity and data.

## Purpose & Architecture

### Core Concept
The Player Registry implements a **centralized player management system** where:
- Each player has a unique ID that persists across their entire history
- Players can participate in multiple leagues and seasons simultaneously
- Player data (name, status) is stored once and referenced everywhere
- Teams link to players by ID, displaying current player data dynamically

### Position in System Hierarchy
```
Organization
└── Player Registry (shared resource)
    ├── Used by: League Management
    ├── Referenced by: Season Setup
    ├── Linked in: Team Management
    └── Displayed in: Games & Standings
```

## Current Features

### 1. **Player CRUD Operations**
- ✅ **Create Player**: Add new players with name
- ✅ **Edit Player**: Update player information (name, active status)
- ✅ **Delete Player**: Remove players with safety checks
- ✅ **Active/Inactive Status**: Mark players as active or inactive

### 2. **Import/Export** 🆕
- ✅ **Export to CSV**: Download all players as CSV file
- ✅ **Export to JSON**: Download all players as JSON file
- ✅ **Import from CSV**: Bulk add players from CSV file
- ✅ **Import from JSON**: Bulk add players from JSON file
- ✅ **Import Validation**: Preview and validate before importing
- ✅ **Duplicate Detection**: Automatically skip duplicate players
- ✅ **Error Reporting**: See detailed errors for invalid rows
- ✅ **Future-Proof**: Automatically handles new fields as they're added

### 3. **Search & Filter**
- ✅ **Real-time Search**: Search players by name (case-insensitive)
- ✅ **Status Filtering**: Separate lists for active and inactive players
- ✅ **Pagination**: 20 players per page for both active and inactive lists

### 4. **Data Validation**
- ✅ **Name Validation**: First name and last name required, non-empty
- ✅ **Duplicate Prevention**: Case-insensitive duplicate full name detection
- ✅ **Referential Integrity**: Cannot delete players assigned to teams

### 5. **Safety Features**
- ✅ **Assignment Checking**: Prevents deletion of players assigned to teams
- ✅ **Detailed Warnings**: Shows which seasons/teams the player is assigned to
- ✅ **Inactive Alternative**: Suggests marking inactive instead of deleting
- ✅ **Confirmation Dialogs**: Requires explicit confirmation for destructive actions

### 6. **UI/UX Features**
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Inline Editing**: Edit form appears in same view
- ✅ **Visual Status**: Different styling for active vs inactive players
- ✅ **Player Count**: Real-time count of total players
- ✅ **Internationalization**: Full Hebrew (RTL) and English support

### 7. **Integration Points**
- ✅ **Login System**: Players can be selected as users for player portal
- ✅ **Season Setup**: Active players available for team assignment
- ✅ **Team Management**: Used for roster substitutions
- ✅ **Game Scoring**: Player data displayed during score entry
- ✅ **Standings**: Player statistics calculated from registry data

## Data Model

### Player Schema
```typescript
interface Player {
  id: string;                    // Unique identifier (auto-generated)
  firstName: string;             // Player's first name (required)
  middleName?: string;           // Player's middle name (optional)
  lastName: string;              // Player's last name (required)
  active: boolean;               // Active status (default: true)
  createdAt: string;            // ISO timestamp of creation
}
```

### Storage Layer
- **API**: `src/services/api.ts` → `playersApi`
- **Model**: `src/models/index.ts` → `createPlayer`, `validatePlayer`
- **Storage**: Supabase PostgreSQL database (`players` table)
- **Name Utilities**: `src/utils/playerUtils.ts` → `getPlayerDisplayName`, `getPlayerFullName`

### API Methods
```typescript
playersApi.getAll(): Player[]                              // Get all players
playersApi.getById(id: string): Player | undefined        // Get by ID
playersApi.create(data: Omit<Player, 'id' | 'createdAt'>): Player  // Create new
playersApi.update(id: string, updates: Partial<Player>): Player    // Update existing
playersApi.delete(id: string): boolean                     // Delete player
```

## Business Rules

### 1. **Name Uniqueness**
- Player full names (firstName + lastName combination) must be unique (case-insensitive)
- Duplicate detection runs on both create and update
- Excludes current player when editing (allows keeping same name)

### 2. **Deletion Constraints**
- Cannot delete players assigned to any team
- System checks all teams across all seasons
- Shows specific seasons where player is assigned
- Suggests marking as inactive as alternative

### 3. **Active Status**
- Active players: Available for team assignment in season setup
- Inactive players: Not shown in season setup, but retain all historical data
- Inactive players can be reactivated by editing
- Deletion is permanent; inactivation is reversible

## Usage Patterns

### Creating a Player
1. Click "Add Player" button
2. Enter player first name (required), optional middle name, and last name (required)
3. Click "Add Player" to save
4. System validates and creates player
5. Player appears in Active Players list

### Editing a Player
1. Click "Edit" button on player card
2. Form appears with current data pre-filled
3. Modify name fields or active status
4. Click "Update Player" to save
5. Changes apply immediately across all references

### Deleting a Player
1. Click "Delete" button on player card
2. System checks for team assignments
3. If assigned: Shows error with season details
4. If not assigned: Confirmation dialog appears
5. Confirm deletion to permanently remove

### Managing Active Status
1. Edit the player
2. Toggle the "Active" checkbox
3. Save changes
4. Inactive players move to "Inactive Players" section
5. Inactive players hidden from season setup

### Exporting Players
1. Click "Export CSV" or "Export JSON" button
2. File downloads automatically with timestamp
3. CSV format: Compatible with Excel and spreadsheet applications
4. JSON format: Machine-readable, includes all fields

### Importing Players
1. Click "Import File" button
2. Select a CSV or JSON file
3. Review the import preview modal:
   - See valid players that will be imported
   - View errors for invalid rows
   - Duplicates are highlighted (will be skipped)
4. Click "Import X Players" to confirm
5. System creates all valid, non-duplicate players

**CSV Format Example:**
```csv
firstName,lastName,middleName,active
John,Doe,,true
Jane,Smith,,true
Bob,Johnson,A,false
```

**JSON Format Example:**
```json
[
  { "firstName": "John", "lastName": "Doe", "active": true },
  { "firstName": "Jane", "lastName": "Smith", "active": true },
  { "firstName": "Bob", "middleName": "A", "lastName": "Johnson", "active": false }
]
```

## Component Architecture

### File Location
- **Path**: `src/components/admin/PlayerRegistry.tsx`
- **Type**: React functional component
- **Access**: Admin portal only

### Dependencies
```typescript
// API & Models
import { playersApi, teamsApi, seasonsApi } from '../../services/api';
import { createPlayer, validatePlayer } from '../../models';

// Common Components
import { Pagination, usePagination } from '../common/Pagination';

// Contexts
import { useTranslation } from '../../contexts/LanguageContext';

// Constants
import { MAX_BOWLING_SCORE } from '../../constants/bowling';
```

### State Management
```typescript
const [players, setPlayers] = useState<Player[]>([]);        // All players
const [isAdding, setIsAdding] = useState(false);             // Form visibility
const [editingId, setEditingId] = useState<string | null>(); // Editing mode
const [formData, setFormData] = useState({...});             // Form state (firstName, middleName, lastName, active)
const [searchTerm, setSearchTerm] = useState('');            // Search filter

// Pagination hooks
const activePagination = usePagination(20);
const inactivePagination = usePagination(20);
```

### Key Functions
- `loadPlayers()`: Fetches all players from API
- `handleSubmit()`: Validates and saves player (create/update)
- `handleEdit()`: Loads player data into edit form
- `handleDelete()`: Checks constraints and deletes player
- `handleCancel()`: Resets form and exits edit mode

## Internationalization

### Supported Languages
- **English** (en): Left-to-right layout
- **Hebrew** (he): Right-to-left layout with text reversal

### Translation Keys
```typescript
t('players.title')                  // "Player Registry"
t('players.addPlayer')              // "Add Player"
t('players.editPlayer')             // "Edit Player"
t('players.activePlayers')          // "Active Players"
t('players.inactivePlayers')        // "Inactive Players"
t('players.duplicateName')          // Duplicate error message
t('players.cannotDeleteAssigned')   // Assignment constraint error
t('players.created')                // Success message
// ... and more
```

### RTL Support
- Layout automatically reverses for Hebrew
- Numbers remain LTR (using `ltr-content` class)
- Search bar and buttons maintain proper positioning

## Testing & Validation

### Manual Test Cases
1. **Create player with name**: ✅
2. **Create duplicate name**: ❌ Shows error
3. **Edit player name**: ✅
4. **Mark player inactive**: ✅
5. **Delete unassigned player**: ✅ With confirmation
6. **Delete assigned player**: ❌ Shows constraint error
7. **Search players**: ✅ Real-time filtering
8. **Pagination**: ✅ 20 per page

### Validation Tests
Located in: `tests/test-validation.js`
- First name and last name required validation
- Duplicate full name detection
- Empty string handling

## Known Limitations & Edge Cases

### Current Limitations
1. **No Player Statistics**: Registry shows player name only, not calculated stats
2. **No Historical View**: Cannot see player's past league participation from registry
3. **Import Duplicates**: Import skips duplicates but doesn't offer update option
4. **No Contact Info**: No email, phone, or other contact fields
5. **No Player Notes**: Cannot add notes or comments about players
6. **No Profile Pictures**: No avatar or photo support
7. **No Middle Name Search**: Search may not include middle name in filtering

### Edge Cases Handled
- ✅ Empty player list (shows appropriate message)
- ✅ All players inactive (shows appropriate message)
- ✅ Player assigned to multiple teams (lists all seasons)
- ✅ Search with no results (shows empty state)
- ✅ Editing then canceling (resets form properly)

### Edge Cases NOT Handled
- ⚠️ Player name changes affect standings history display (shows current name)
- ⚠️ Very long player names may overflow in some views
- ⚠️ No handling for special characters or emojis in names
- ⚠️ No duplicate detection across similar names (John Smith vs. J. Smith vs. Jon Smith)

## Suggested Next Steps

### High Priority Enhancements

#### 1. **Player Profile View** ⭐⭐⭐
**Goal**: Dedicated view showing comprehensive player information and statistics

**Features**:
- Career statistics across all leagues/seasons
- Current league participation
- Historical performance trends
- Game-by-game history
- Personal records (high game, high series)
- League-specific averages

**Implementation**:
- New component: `PlayerProfile.tsx`
- Click player name/card to open profile
- Reuse calculation functions from `statsUtils.ts`
- Add "View Profile" button to player cards
- Show statistics from all completed games

**Estimated Effort**: Medium (2-3 days)

#### 2. **Player Statistics in Registry** ⭐⭐
**Goal**: Show calculated averages and game counts in the player list

**Features**:
- Current season average (per league)
- Total games played
- Active league count
- Last game date
- Performance trend indicator

**Implementation**:
- Calculate on component load
- Add columns to player cards
- Use `calculatePlayerSeasonStats` from standingsUtils
- Add filtering by statistics (e.g., show players with avg > 180)

**Estimated Effort**: Small (1 day)

#### 3. **Contact Information Fields** ⭐⭐
**Goal**: Store and display player contact information

**Features**:
- Email address
- Phone number
- Emergency contact
- Optional notes field
- Privacy toggle (show/hide contact info)

**Implementation**:
- Update Player model in `models/index.ts`
- Add form fields in PlayerRegistry
- Update validation rules
- Add privacy settings
- Display in player profile view

**Estimated Effort**: Small (1-2 days)

#### 4. **Advanced Search & Filtering** ⭐⭐
**Goal**: More powerful player discovery and filtering

**Features**:
- Filter by average range (e.g., 150-180)
- Filter by league participation
- Filter by last activity date
- Sort by name, average, games played
- Multi-criteria search
- Save search filters

**Implementation**:
- Add filter UI components
- Create filter state management
- Apply filters to player list
- Persist filter preferences in localStorage
- Add "Clear Filters" button

**Estimated Effort**: Medium (2 days)

### Medium Priority Enhancements

#### 5. **Player Merging** ⭐
**Goal**: Combine duplicate player records

**Features**:
- Detect potential duplicates
- Preview merge operation
- Choose which data to keep
- Update all references (teams, games)
- Maintain game history
- Audit log of merge operations

**Implementation**:
- Create duplicate detection algorithm
- Build merge UI
- Update all FK references
- Test thoroughly (data integrity critical)
- Add rollback capability

**Estimated Effort**: Large (4-5 days)
**Risk**: High - affects data integrity

#### 6. **Player Groups/Tags** ⭐
**Goal**: Categorize players for easier management

**Features**:
- Create custom tags (e.g., "Beginners", "Veterans")
- Assign multiple tags per player
- Filter by tags
- Bulk tag assignment
- Tag-based team creation
- Tag colors for visual distinction

**Implementation**:
- Add tags field to Player model
- Create tag management UI
- Add tag filter to registry
- Display tags on player cards
- Enable tag-based team assignment in season setup

**Estimated Effort**: Medium (2-3 days)

### Low Priority / Nice-to-Have

#### 7. **Player Avatar/Photo**
**Goal**: Visual identification of players

**Features**:
- Upload profile photo
- Default avatar generation (initials)
- Photo displayed in all player references
- Photo cropping/resizing
- Remove photo option

**Estimated Effort**: Medium (2-3 days)
**Dependencies**: File upload system

#### 8. **Player Activity Timeline**
**Goal**: Visual history of player activities

**Features**:
- Timeline of all games played
- League joins/leaves
- Award achievements
- Notable games (high scores)
- Chronological view
- Filter by date range

**Estimated Effort**: Large (4-5 days)

#### 9. **Player Comparison Tool**
**Goal**: Compare multiple players side-by-side

**Features**:
- Select 2-4 players to compare
- Show statistics side by side
- Head-to-head record
- Visual charts (radar, bar)
- Export comparison report
- Share comparison link

**Estimated Effort**: Medium (3 days)
**Note**: Partial implementation exists in PlayerSeasonComparison component

#### 10. **Player Notes & History**
**Goal**: Track player-specific information

**Features**:
- Free-form notes about player
- Admin-only notes
- Injury/absence tracking
- Special accommodations
- Change history log
- Note timestamps

**Estimated Effort**: Small (1-2 days)

## Integration Considerations

### When Adding Features, Consider:

1. **Data Model Changes**
   - Update `src/types/index.ts` (Player type)
   - Update `createPlayer()` factory in `src/models/index.ts`
   - Update `validatePlayer()` rules
   - Update Supabase schema if needed (`supabase-schema.sql`)

2. **API Changes**
   - Add new methods to `playersApi` if needed
   - Update Supabase queries in `src/services/api.ts`
   - Test all CRUD operations

3. **Component Updates**
   - PlayerRegistry (main view)
   - SeasonSetup (player selection)
   - TeamManagement (roster changes)
   - SeasonGame (player display)
   - LoginView (player selection)

4. **Translation Updates**
   - Add keys to `src/translations/en.ts`
   - Add keys to `src/translations/he.ts`
   - Test RTL layout for Hebrew

5. **Testing**
   - Update `tests/test-validation.js`
   - Add new test files if needed
   - Test data migration path
   - Test referential integrity

## Database

The Player Registry uses Supabase PostgreSQL as its backend:

- **Table**: `players` (columns: `id`, `first_name`, `last_name`, `middle_name`, `active`, `created_at`)
- **Row Level Security**: Enabled, admin-only write access
- **API**: All CRUD operations go through `playersApi` in `src/services/api.ts`

## Performance Notes

### Current Performance
- **Load Time**: Fast (Supabase query)
- **Search**: Real-time client-side filtering
- **Pagination**: Efficient, only renders 20 players per page
- **Updates**: Near-immediate via Supabase

### Potential Optimizations
- Virtual scrolling for 1000+ players
- Server-side search for large datasets
- Lazy loading of player statistics
- Indexed search for faster filtering

## Related Documentation
- [TESTING.md](../tech/TESTING.md) - Test suite including validation tests
- [SUPABASE_SETUP_GUIDE.md](../tech/SUPABASE_SETUP_GUIDE.md) - Database setup
- [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md) - Admin portal overview

## Summary

The Player Registry is a **mature, well-tested component** with solid CRUD operations, validation, and safety features. It serves as the foundation for the entire player management system.

**Recent Changes**:
- ✅ **Migrated to Supabase** (February 2026): Moved from localStorage to Supabase PostgreSQL with OAuth authentication and Row Level Security.
- ✅ **Split Name Fields** (February 2026): Changed from single `name` field to `firstName`, `middleName` (optional), and `lastName` fields for better data structure.
- ✅ **Removed Starting Average Field** (February 2026): Simplified player model by removing the starting average field. Player averages are now calculated dynamically from actual game performance.
- ✅ **Added Import/Export Feature** (February 2026): Added CSV and JSON import/export functionality with validation, preview, and duplicate detection. Import/export utilities in `src/utils/importExportUtils.ts`.

**Strengths**:
- ✅ Robust validation and error handling
- ✅ Excellent referential integrity checks
- ✅ Clean, user-friendly interface
- ✅ Full internationalization support
- ✅ Proper pagination for scalability
- ✅ Structured data model (firstName, middleName, lastName, status)

**Areas for Growth**:
- 📊 Enhanced player statistics and analytics
- 📇 Additional player metadata (contact, notes)
- 🔄 Bulk operations beyond import/export
- 📷 Visual enhancements (photos, tags)
- 🔗 Deeper integration with game history

The suggested enhancements prioritize **player profile views** and **in-registry statistics** as these would provide the most immediate value to users while building on the solid foundation already in place.
