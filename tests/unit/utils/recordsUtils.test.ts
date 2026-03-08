/// <reference types="jest" />
import {
  calculateSeasonRecords,
  formatRecordDate,
} from '../../../src/utils/recordsUtils';
import type { Game, Team } from '../../../src/types/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeTeam = (id: string, name: string, playerIds: string[] = ['p1']): Team => ({
  id,
  seasonId: 's1',
  name,
  playerIds,
  rosterChanges: [],
  createdAt: '2024-01-01T00:00:00Z',
});

const makeGamePlayer = (playerId: string, name: string, average = 150, absent = false) => ({
  playerId,
  name,
  average,
  handicap: 0,
  rank: 1,
  absent,
});

const makeMatchPlayer = (pins: string) => ({ pins, bonusPoints: 0 });

const makeCompletedGame = (
  id: string,
  team1Id: string,
  team2Id: string,
  team1Pins: string[][],
  team2Pins: string[][],
  playerIds1: string[] = ['p1'],
  playerIds2: string[] = ['p2'],
  scheduledDate = '2024-01-10'
): Game => {
  const matchesPerGame = team1Pins.length;
  return {
    id,
    seasonId: 's1',
    round: 1,
    matchDay: 1,
    team1Id,
    team2Id,
    postponed: false,
    status: 'completed',
    scheduledDate,
    createdAt: '2024-01-01T00:00:00Z',
    matchesPerGame,
    useHandicap: false,
    lineupStrategy: 'flexible',
    lineupRule: 'standard',
    playerMatchPointsPerWin: 1,
    teamMatchPointsPerWin: 1,
    teamGamePointsPerWin: 2,
    teamAllPresentBonusEnabled: false,
    teamAllPresentBonusPoints: 0,
    bonusRules: [],
    team1: {
      name: 'Team A',
      players: playerIds1.map((pid, i) => makeGamePlayer(pid, `Player ${pid}`, 150)),
    },
    team2: {
      name: 'Team B',
      players: playerIds2.map((pid, i) => makeGamePlayer(pid, `Player ${pid}`, 140)),
    },
    matches: team1Pins.map((t1MatchPins, matchIdx) => ({
      matchNumber: matchIdx + 1,
      team1: {
        points: 0,
        totalPins: t1MatchPins.reduce((s, p) => s + (Number(p) || 0), 0),
        totalWithHandicap: t1MatchPins.reduce((s, p) => s + (Number(p) || 0), 0),
        bonusPoints: 0,
        players: t1MatchPins.map(makeMatchPlayer),
      },
      team2: {
        points: 0,
        totalPins: team2Pins[matchIdx].reduce((s, p) => s + (Number(p) || 0), 0),
        totalWithHandicap: team2Pins[matchIdx].reduce((s, p) => s + (Number(p) || 0), 0),
        bonusPoints: 0,
        players: team2Pins[matchIdx].map(makeMatchPlayer),
      },
      playerMatches: [],
    })),
  };
};

// ── calculateSeasonRecords ────────────────────────────────────────────────────

describe('calculateSeasonRecords', () => {
  const teams = [makeTeam('t1', 'Eagles', ['p1']), makeTeam('t2', 'Hawks', ['p2'])];

  it('returns empty arrays when no games provided', () => {
    const result = calculateSeasonRecords(teams, []);
    expect(result.highestPlayerMatchScores).toHaveLength(0);
    expect(result.highestPlayerSeries).toHaveLength(0);
    expect(result.highestTeamMatchScores).toHaveLength(0);
    expect(result.highestTeamGameTotals).toHaveLength(0);
  });

  it('ignores non-completed games', () => {
    const pendingGame: Game = {
      ...makeCompletedGame('g1', 't1', 't2', [['180']], [['160']]),
      status: 'pending',
    };
    const result = calculateSeasonRecords(teams, [pendingGame]);
    expect(result.highestPlayerMatchScores).toHaveLength(0);
  });

  it('records highest player match score from a completed game', () => {
    const game = makeCompletedGame('g1', 't1', 't2', [['180']], [['200']]);
    const result = calculateSeasonRecords(teams, [game]);
    // Highest single-match score is 200 (p2 from t2)
    expect(result.highestPlayerMatchScores[0].playerRecordEntry.value).toBe(200);
    expect(result.highestPlayerMatchScores[0].playerRecordEntry.playerId).toBe('p2');
  });

  it('records player series (sum across all matches)', () => {
    // 3 matches for p1: 180 + 190 + 200 = 570
    const game = makeCompletedGame(
      'g1', 't1', 't2',
      [['180'], ['190'], ['200']],
      [['150'], ['155'], ['160']]
    );
    const result = calculateSeasonRecords(teams, [game]);
    const p1Series = result.highestPlayerSeries.find(
      e => e.playerRecordEntry.playerId === 'p1'
    );
    expect(p1Series).toBeDefined();
    expect(p1Series?.playerRecordEntry.value).toBe(570);
    expect(p1Series?.playerRecordEntry.numberOfGames).toBe(3);
  });

  it('returns at most 3 entries per record category', () => {
    // Create 5 games so we have more than 3 entries
    const games = Array.from({ length: 5 }, (_, i) =>
      makeCompletedGame(`g${i}`, 't1', 't2', [['180']], [['160']])
    );
    const result = calculateSeasonRecords(teams, games);
    expect(result.highestPlayerMatchScores.length).toBeLessThanOrEqual(3);
    expect(result.highestPlayerSeries.length).toBeLessThanOrEqual(3);
    expect(result.highestTeamMatchScores.length).toBeLessThanOrEqual(3);
    expect(result.highestTeamGameTotals.length).toBeLessThanOrEqual(3);
  });

  it('sorts records in descending order (highest first)', () => {
    const games = [
      makeCompletedGame('g1', 't1', 't2', [['180']], [['150']]),
      makeCompletedGame('g2', 't1', 't2', [['220']], [['170']]),
      makeCompletedGame('g3', 't1', 't2', [['200']], [['160']]),
    ];
    const result = calculateSeasonRecords(teams, games);
    const scores = result.highestPlayerMatchScores.map(e => e.playerRecordEntry.value);
    expect(scores[0]).toBeGreaterThanOrEqual(scores[1] ?? 0);
    if (scores.length > 2) {
      expect(scores[1]).toBeGreaterThanOrEqual(scores[2]);
    }
  });

  it('tracks team game total records', () => {
    const game = makeCompletedGame(
      'g1', 't1', 't2',
      [['180'], ['200'], ['190']], // t1 total = 570
      [['150'], ['155'], ['160']]  // t2 total = 465
    );
    const result = calculateSeasonRecords(teams, [game]);
    const t1Record = result.highestTeamGameTotals.find(e => e.teamRecordEntry.teamId === 't1');
    expect(t1Record?.teamRecordEntry.value).toBe(570);
  });

  it('tracks team match (single-game) records', () => {
    const game = makeCompletedGame(
      'g1', 't1', 't2',
      [['200']], // single match, t1 total = 200
      [['150']]
    );
    const result = calculateSeasonRecords(teams, [game]);
    const t1Match = result.highestTeamMatchScores.find(e => e.teamRecordEntry.teamId === 't1');
    expect(t1Match?.teamRecordEntry.value).toBe(200);
  });

  it('skips absent players when calculating records', () => {
    const game: Game = {
      ...makeCompletedGame('g1', 't1', 't2', [['180']], [['200']]),
      team1: {
        name: 'Team A',
        players: [makeGamePlayer('p1', 'Player p1', 150, true)], // absent
      },
    };
    const result = calculateSeasonRecords(teams, [game]);
    // p1 is absent — should not appear in records
    const p1Record = result.highestPlayerMatchScores.find(
      e => e.playerRecordEntry.playerId === 'p1'
    );
    expect(p1Record).toBeUndefined();
  });

  it('attaches matchDay and round info to records', () => {
    const game: Game = {
      ...makeCompletedGame('g1', 't1', 't2', [['200']], [['150']]),
      matchDay: 3,
      round: 2,
    };
    const result = calculateSeasonRecords(teams, [game]);
    expect(result.highestPlayerMatchScores[0].matchDay).toBe(3);
    expect(result.highestPlayerMatchScores[0].round).toBe(2);
  });
});

// ── formatRecordDate ──────────────────────────────────────────────────────────

describe('formatRecordDate', () => {
  it('returns "N/A" for an empty string', () => {
    expect(formatRecordDate('')).toBe('N/A');
  });

  it('formats a valid date string', () => {
    // '2024-01-15' should produce a human-readable date
    const result = formatRecordDate('2024-01-15');
    expect(result).toMatch(/Jan/i);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });

  it('uses the provided locale for formatting', () => {
    const en = formatRecordDate('2024-06-20', 'en-US');
    const he = formatRecordDate('2024-06-20', 'he-IL');
    // Both should be non-empty strings; Hebrew locale may format differently
    expect(typeof en).toBe('string');
    expect(en.length).toBeGreaterThan(0);
    expect(typeof he).toBe('string');
    expect(he.length).toBeGreaterThan(0);
  });
});
