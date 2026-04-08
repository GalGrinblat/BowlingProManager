/// <reference types="jest" />
import {
  calculateHeadToHead,
  getTeamHeadToHeadRecords,
  formatHeadToHead,
} from '../../../src/utils/headToHeadUtils';
import type { Game, Team } from '../../../src/types/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeTeam = (id: string, name: string): Team => ({
  id,
  seasonId: 's1',
  name,
  playerIds: ['p1'],
  rosterChanges: [],
  createdAt: '2024-01-01T00:00:00Z',
});

const makeCompletedGame = (
  team1Id: string,
  team2Id: string,
  team1Points: number,
  team2Points: number,
  completedAt = '2024-01-10T00:00:00Z'
): Game => ({
  id: `g-${team1Id}-${team2Id}`,
  seasonId: 's1',
  round: 1,
  matchDay: 1,
  team1Id,
  team2Id,
  postponed: false,
  status: 'completed',
  completedAt,
  createdAt: '2024-01-01T00:00:00Z',
  matchesPerGame: 1,
  useHandicap: false,
  lineupStrategy: 'flexible',
  lineupRule: 'standard',
  playerMatchPointsPerWin: 1,
  teamMatchPointsPerWin: 1,
  teamGamePointsPerWin: 2,
  teamAllPresentBonusEnabled: false,
  teamAllPresentBonusPoints: 0,
  bonusRules: [],
  matches: [
    {
      matchNumber: 1,
      team1: { points: team1Points, totalPins: 180, totalWithHandicap: 180, bonusPoints: 0, players: [] },
      team2: { points: team2Points, totalPins: 160, totalWithHandicap: 160, bonusPoints: 0, players: [] },
      playerMatches: [],
    },
  ],
  grandTotalPoints: { team1: 0, team2: 0 },
});

// ── calculateHeadToHead ───────────────────────────────────────────────────────

describe('calculateHeadToHead', () => {
  it('returns zeros and nulls when no games played', () => {
    const result = calculateHeadToHead('t1', 't2', []);
    expect(result.gamesPlayed).toBe(0);
    expect(result.team1Wins).toBe(0);
    expect(result.team2Wins).toBe(0);
    expect(result.ties).toBe(0);
    expect(result.lastMeetingDate).toBeNull();
    expect(result.winStreak).toBeNull();
  });

  it('ignores non-completed games', () => {
    const pendingGame: Game = { ...makeCompletedGame('t1', 't2', 3, 1), status: 'pending' };
    const result = calculateHeadToHead('t1', 't2', [pendingGame]);
    expect(result.gamesPlayed).toBe(0);
  });

  it('counts a win for team1 when team1 has more points', () => {
    const game = makeCompletedGame('t1', 't2', 3, 1);
    const result = calculateHeadToHead('t1', 't2', [game]);
    expect(result.gamesPlayed).toBe(1);
    expect(result.team1Wins).toBe(1);
    expect(result.team2Wins).toBe(0);
  });

  it('counts a win for team2 when team2 has more points', () => {
    const game = makeCompletedGame('t1', 't2', 1, 3);
    const result = calculateHeadToHead('t1', 't2', [game]);
    expect(result.team1Wins).toBe(0);
    expect(result.team2Wins).toBe(1);
  });

  it('counts a tie when points are equal', () => {
    const game = makeCompletedGame('t1', 't2', 2, 2);
    const result = calculateHeadToHead('t1', 't2', [game]);
    expect(result.ties).toBe(1);
    expect(result.team1Wins).toBe(0);
    expect(result.team2Wins).toBe(0);
  });

  it('handles reversed team order (team2Id === team1Id in game)', () => {
    // Game stored as t2 vs t1, but we query as t1 vs t2
    const game = makeCompletedGame('t2', 't1', 3, 1); // t2 wins
    const result = calculateHeadToHead('t1', 't2', [game]);
    // t2 is home team, t2 wins → from t1's perspective, team2 wins
    expect(result.team2Wins).toBe(1);
    expect(result.team1Wins).toBe(0);
  });

  it('tracks total points for each team', () => {
    const games = [
      makeCompletedGame('t1', 't2', 3, 1),
      makeCompletedGame('t1', 't2', 2, 2),
    ];
    const result = calculateHeadToHead('t1', 't2', games);
    expect(result.team1TotalPoints).toBe(5); // 3 + 2
    expect(result.team2TotalPoints).toBe(3); // 1 + 2
  });

  it('calculates average points per game', () => {
    const games = [
      makeCompletedGame('t1', 't2', 4, 0),
      makeCompletedGame('t1', 't2', 0, 4),
    ];
    const result = calculateHeadToHead('t1', 't2', games);
    expect(result.team1AvgPoints).toBe(2);
    expect(result.team2AvgPoints).toBe(2);
  });

  it('records the last meeting date', () => {
    const games = [
      makeCompletedGame('t1', 't2', 3, 1, '2024-01-05T00:00:00Z'),
      makeCompletedGame('t1', 't2', 1, 3, '2024-01-15T00:00:00Z'),
    ];
    const result = calculateHeadToHead('t1', 't2', games);
    expect(result.lastMeetingDate).toBe('2024-01-15T00:00:00Z');
  });

  it('detects current win streak', () => {
    const games = [
      makeCompletedGame('t1', 't2', 1, 3, '2024-01-05T00:00:00Z'), // t2 wins
      makeCompletedGame('t1', 't2', 3, 1, '2024-01-10T00:00:00Z'), // t1 wins
      makeCompletedGame('t1', 't2', 3, 1, '2024-01-15T00:00:00Z'), // t1 wins
    ];
    const result = calculateHeadToHead('t1', 't2', games);
    expect(result.winStreak).toEqual({ team: 'team1', count: 2 });
  });

  it('returns null winStreak when last game was a tie', () => {
    const games = [
      makeCompletedGame('t1', 't2', 3, 1, '2024-01-05T00:00:00Z'),
      makeCompletedGame('t1', 't2', 2, 2, '2024-01-10T00:00:00Z'), // tie
    ];
    const result = calculateHeadToHead('t1', 't2', games);
    expect(result.winStreak).toBeNull();
  });

  it('only includes games between the two specified teams', () => {
    const relevantGame = makeCompletedGame('t1', 't2', 3, 1);
    const otherGame = makeCompletedGame('t1', 't3', 3, 1);
    const result = calculateHeadToHead('t1', 't2', [relevantGame, otherGame]);
    expect(result.gamesPlayed).toBe(1);
  });
});

// ── getTeamHeadToHeadRecords ──────────────────────────────────────────────────

describe('getTeamHeadToHeadRecords', () => {
  const teams = [
    makeTeam('t1', 'Eagles'),
    makeTeam('t2', 'Hawks'),
    makeTeam('t3', 'Falcons'),
  ];

  it('returns one record per opponent with completed games', () => {
    const games = [
      makeCompletedGame('t1', 't2', 3, 1),
      makeCompletedGame('t1', 't3', 1, 3),
    ];
    const records = getTeamHeadToHeadRecords('t1', teams, games);
    expect(records).toHaveLength(2);
  });

  it('excludes opponents with no completed games', () => {
    const games = [makeCompletedGame('t1', 't2', 3, 1)];
    const records = getTeamHeadToHeadRecords('t1', teams, games);
    // t3 has no games → excluded
    expect(records).toHaveLength(1);
    expect(records[0].teamId).toBe('t2');
    expect(records[0].teamName).toBe('Hawks');
  });

  it('returns empty array when team has played no games', () => {
    const records = getTeamHeadToHeadRecords('t1', teams, []);
    expect(records).toHaveLength(0);
  });

  it('does not include the queried team itself in results', () => {
    const games = [makeCompletedGame('t1', 't2', 3, 1)];
    const records = getTeamHeadToHeadRecords('t1', teams, games);
    const ids = records.map(r => r.teamId);
    expect(ids).not.toContain('t1');
  });
});

// ── formatHeadToHead ──────────────────────────────────────────────────────────

describe('formatHeadToHead', () => {
  it('returns "No previous matchups" when gamesPlayed is 0', () => {
    const h2h = {
      gamesPlayed: 0,
      team1Wins: 0,
      team2Wins: 0,
      ties: 0,
      team1TotalPoints: 0,
      team2TotalPoints: 0,
      team1AvgPoints: 0,
      team2AvgPoints: 0,
      lastMeetingDate: null,
      winStreak: null,
    };
    expect(formatHeadToHead(h2h, 'Eagles', 'Hawks')).toBe('No previous matchups');
  });

  it('formats win-loss record without ties', () => {
    const h2h = {
      gamesPlayed: 2,
      team1Wins: 2,
      team2Wins: 0,
      ties: 0,
      team1TotalPoints: 6,
      team2TotalPoints: 2,
      team1AvgPoints: 3,
      team2AvgPoints: 1,
      lastMeetingDate: '2024-01-15T00:00:00Z',
      winStreak: null,
    };
    const result = formatHeadToHead(h2h, 'Eagles', 'Hawks');
    expect(result).toContain('Eagles 2-0');
    expect(result).toContain('vs Hawks');
    expect(result).not.toContain('-0-'); // no ties segment
  });

  it('includes tie count in the record when ties > 0', () => {
    const h2h = {
      gamesPlayed: 3,
      team1Wins: 1,
      team2Wins: 1,
      ties: 1,
      team1TotalPoints: 4,
      team2TotalPoints: 4,
      team1AvgPoints: 2,
      team2AvgPoints: 2,
      lastMeetingDate: '2024-01-15T00:00:00Z',
      winStreak: null,
    };
    const result = formatHeadToHead(h2h, 'Eagles', 'Hawks');
    expect(result).toContain('1-1-1');
  });

  it('appends streak info for a 2+ game win streak', () => {
    const h2h = {
      gamesPlayed: 3,
      team1Wins: 3,
      team2Wins: 0,
      ties: 0,
      team1TotalPoints: 9,
      team2TotalPoints: 0,
      team1AvgPoints: 3,
      team2AvgPoints: 0,
      lastMeetingDate: '2024-01-15T00:00:00Z',
      winStreak: { team: 'team1', count: 3 },
    };
    const result = formatHeadToHead(h2h, 'Eagles', 'Hawks');
    expect(result).toContain('Eagles');
    expect(result).toContain('3-game win streak');
  });

  it('does not append streak info for a single-game streak', () => {
    const h2h = {
      gamesPlayed: 1,
      team1Wins: 1,
      team2Wins: 0,
      ties: 0,
      team1TotalPoints: 3,
      team2TotalPoints: 1,
      team1AvgPoints: 3,
      team2AvgPoints: 1,
      lastMeetingDate: '2024-01-15T00:00:00Z',
      winStreak: { team: 'team1', count: 1 },
    };
    const result = formatHeadToHead(h2h, 'Eagles', 'Hawks');
    expect(result).not.toContain('win streak');
  });
});
