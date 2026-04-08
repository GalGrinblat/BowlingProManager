/// <reference types="jest" />
import {
  calculatePlayerStats,
  calculateGameTotals,
  calculateGrandTotalPoints,
} from '../../../src/utils/statsUtils';
import type { Game, GameMatch } from '../../../src/types/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

const makePlayer = (
  playerId: string,
  name: string,
  average = 150,
  absent = false
) => ({ playerId, name, average, handicap: 0, rank: 1, absent });

const makeMatch = (
  matchNumber: number,
  team1Pins: string[],
  team2Pins: string[],
  team1Points = 0,
  team2Points = 0
): GameMatch => ({
  matchNumber,
  team1: {
    points: team1Points,
    totalPins: team1Pins.reduce((s, p) => s + (p !== '' ? Number(p) : 0), 0),
    totalWithHandicap: team1Pins.reduce((s, p) => s + (p !== '' ? Number(p) : 0), 0),
    bonusPoints: 0,
    players: team1Pins.map(pins => ({ pins, bonusPoints: 0 })),
  },
  team2: {
    points: team2Points,
    totalPins: team2Pins.reduce((s, p) => s + (p !== '' ? Number(p) : 0), 0),
    totalWithHandicap: team2Pins.reduce((s, p) => s + (p !== '' ? Number(p) : 0), 0),
    bonusPoints: 0,
    players: team2Pins.map(pins => ({ pins, bonusPoints: 0 })),
  },
  playerMatches: [{ player: 1, result: null, team1Points: team1Points, team2Points: team2Points }],
});

const makeGame = (overrides: Partial<Game> = {}): Game => ({
  id: 'g1',
  seasonId: 's1',
  round: 1,
  matchDay: 1,
  team1Id: 't1',
  team2Id: 't2',
  postponed: false,
  status: 'in-progress',
  createdAt: '2024-01-01T00:00:00Z',
  matchesPerGame: 3,
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
    players: [
      makePlayer('p1', 'Alice', 150),
      makePlayer('p2', 'Bob', 140),
    ],
  },
  team2: {
    name: 'Team B',
    players: [
      makePlayer('p3', 'Carol', 160),
      makePlayer('p4', 'Dave', 130),
    ],
  },
  matches: [
    makeMatch(1, ['180', '170'], ['190', '150']),
    makeMatch(2, ['200', '160'], ['175', '155']),
    makeMatch(3, ['175', '185'], ['165', '160']),
  ],
  ...overrides,
});

// ── calculatePlayerStats ─────────────────────────────────────────────────────

describe('calculatePlayerStats', () => {
  it('returns empty stats when team1/team2 are missing', () => {
    const game = makeGame({ team1: undefined, team2: undefined });
    const stats = calculatePlayerStats(game);
    expect(stats.team1Stats).toHaveLength(0);
    expect(stats.team2Stats).toHaveLength(0);
    expect(stats.team1TotalPins).toBe(0);
    expect(stats.team2TotalPins).toBe(0);
  });

  it('calculates total pins for each player across matches', () => {
    const game = makeGame();
    const stats = calculatePlayerStats(game);
    // Alice: 180 + 200 + 175 = 555
    expect(stats.team1Stats[0].totalPins).toBe(555);
    // Bob: 170 + 160 + 185 = 515
    expect(stats.team1Stats[1].totalPins).toBe(515);
    // Carol: 190 + 175 + 165 = 530
    expect(stats.team2Stats[0].totalPins).toBe(530);
    // Dave: 150 + 155 + 160 = 465
    expect(stats.team2Stats[1].totalPins).toBe(465);
  });

  it('calculates game average as totalPins / matchesPerGame', () => {
    const game = makeGame();
    const stats = calculatePlayerStats(game);
    // Alice: 555 / 3 = 185
    expect(stats.team1Stats[0].gameAverage).toBeCloseTo(185);
    // Bob: 515 / 3 ≈ 171.67
    expect(stats.team1Stats[1].gameAverage).toBeCloseTo(515 / 3);
  });

  it('calculates team total pins (non-absent only)', () => {
    const game = makeGame();
    const stats = calculatePlayerStats(game);
    // Team A total: 555 + 515 = 1070
    expect(stats.team1TotalPins).toBe(1070);
    // Team B total: 530 + 465 = 995
    expect(stats.team2TotalPins).toBe(995);
  });

  it('calculates team average (non-absent players only)', () => {
    const game = makeGame();
    const stats = calculatePlayerStats(game);
    // Team A: 1070 / (2 players * 3 matches) = 1070 / 6 ≈ 178.33
    expect(stats.team1Average).toBeCloseTo(1070 / 6);
  });

  it('treats absent player with average - 10 penalty and flags as absent', () => {
    const game = makeGame({
      team1: {
        name: 'Team A',
        players: [
          makePlayer('p1', 'Alice', 150, true), // absent
          makePlayer('p2', 'Bob', 140),
        ],
      },
      matchesPerGame: 3,
    });
    const stats = calculatePlayerStats(game);
    const aliceStats = stats.team1Stats[0];
    expect(aliceStats.isAbsent).toBe(true);
    // absence score = 150 - 10 = 140; totalPins = 140 * 3 = 420
    expect(aliceStats.totalPins).toBe(420);
    expect(aliceStats.gameAverage).toBe(140);
  });

  it('excludes absent players from team total pins', () => {
    const game = makeGame({
      team1: {
        name: 'Team A',
        players: [
          makePlayer('p1', 'Alice', 150, true), // absent — excluded from total
          makePlayer('p2', 'Bob', 140),
        ],
      },
    });
    const stats = calculatePlayerStats(game);
    // Only Bob's pins count: 170 + 160 + 185 = 515
    expect(stats.team1TotalPins).toBe(515);
  });

  it('handles empty pins string as 0', () => {
    const game = makeGame({
      matches: [makeMatch(1, ['', '150'], ['160', ''])],
      matchesPerGame: 1,
    });
    const stats = calculatePlayerStats(game);
    expect(stats.team1Stats[0].totalPins).toBe(0);
    expect(stats.team1Stats[1].totalPins).toBe(150);
  });
});

// ── calculateGameTotals ──────────────────────────────────────────────────────

describe('calculateGameTotals', () => {
  it('sums match points and grand total points for each team', () => {
    const game = makeGame({
      matches: [
        makeMatch(1, ['180'], ['160'], 1, 0),
        makeMatch(2, ['200'], ['175'], 1, 0),
      ],
      grandTotalPoints: { team1: 2, team2: 0 },
    });
    const totals = calculateGameTotals(game);
    expect(totals.team1Points).toBe(4); // 1 + 1 + 2 grand total
    expect(totals.team2Points).toBe(0);
  });

  it('returns zeros when game has no matches', () => {
    const game = makeGame({ matches: undefined, grandTotalPoints: undefined });
    const totals = calculateGameTotals(game);
    expect(totals.team1Points).toBe(0);
    expect(totals.team2Points).toBe(0);
    expect(totals.team1TotalPinsWithHandicap).toBe(0);
    expect(totals.team2TotalPinsWithHandicap).toBe(0);
  });

  it('sums totalWithHandicap pins for each team across matches', () => {
    const game = makeGame();
    const totals = calculateGameTotals(game);
    // Team A: match totals from makeMatch helper (pins sum per match)
    // Match 1 team1: 180+170=350, Match 2: 200+160=360, Match 3: 175+185=360 → 1070
    expect(totals.team1TotalPinsWithHandicap).toBe(1070);
    // Team B: Match 1: 190+150=340, Match 2: 175+155=330, Match 3: 165+160=325 → 995
    expect(totals.team2TotalPinsWithHandicap).toBe(995);
  });

  it('treats missing grandTotalPoints as 0', () => {
    const game = makeGame({ grandTotalPoints: undefined });
    const totals = calculateGameTotals(game);
    // points come only from matches (all 0 in default makeMatch)
    expect(totals.team1Points).toBe(0);
    expect(totals.team2Points).toBe(0);
  });
});

// ── calculateGrandTotalPoints ────────────────────────────────────────────────

describe('calculateGrandTotalPoints', () => {
  it('returns zeros when teams are missing', () => {
    const game = makeGame({ team1: undefined, team2: undefined });
    expect(calculateGrandTotalPoints(game)).toEqual({ team1: 0, team2: 0 });
  });

  it('awards teamGamePointsPerWin to team1 when team1 grand total is higher', () => {
    const game = makeGame({
      teamGamePointsPerWin: 2,
      matches: [
        {
          matchNumber: 1,
          team1: { points: 0, totalPins: 200, totalWithHandicap: 200, bonusPoints: 0, players: [{ pins: '200', bonusPoints: 0 }] },
          team2: { points: 0, totalPins: 150, totalWithHandicap: 150, bonusPoints: 0, players: [{ pins: '150', bonusPoints: 0 }] },
          playerMatches: [{ player: 1, result: null, team1Points: 0, team2Points: 0 }],
        },
      ],
      team1: { name: 'Team A', players: [makePlayer('p1', 'Alice', 150)] },
      team2: { name: 'Team B', players: [makePlayer('p3', 'Carol', 160)] },
    });
    expect(calculateGrandTotalPoints(game)).toEqual({ team1: 2, team2: 0 });
  });

  it('awards teamGamePointsPerWin to team2 when team2 grand total is higher', () => {
    const game = makeGame({
      teamGamePointsPerWin: 2,
      matches: [
        {
          matchNumber: 1,
          team1: { points: 0, totalPins: 150, totalWithHandicap: 150, bonusPoints: 0, players: [{ pins: '150', bonusPoints: 0 }] },
          team2: { points: 0, totalPins: 200, totalWithHandicap: 200, bonusPoints: 0, players: [{ pins: '200', bonusPoints: 0 }] },
          playerMatches: [{ player: 1, result: null, team1Points: 0, team2Points: 0 }],
        },
      ],
      team1: { name: 'Team A', players: [makePlayer('p1', 'Alice', 150)] },
      team2: { name: 'Team B', players: [makePlayer('p3', 'Carol', 160)] },
    });
    expect(calculateGrandTotalPoints(game)).toEqual({ team1: 0, team2: 2 });
  });

  it('splits points evenly on a tie', () => {
    const game = makeGame({
      teamGamePointsPerWin: 2,
      matches: [
        {
          matchNumber: 1,
          team1: { points: 0, totalPins: 180, totalWithHandicap: 180, bonusPoints: 0, players: [{ pins: '180', bonusPoints: 0 }] },
          team2: { points: 0, totalPins: 180, totalWithHandicap: 180, bonusPoints: 0, players: [{ pins: '180', bonusPoints: 0 }] },
          playerMatches: [{ player: 1, result: null, team1Points: 0, team2Points: 0 }],
        },
      ],
      team1: { name: 'Team A', players: [makePlayer('p1', 'Alice', 150)] },
      team2: { name: 'Team B', players: [makePlayer('p3', 'Carol', 160)] },
    });
    expect(calculateGrandTotalPoints(game)).toEqual({ team1: 1, team2: 1 });
  });

  it('returns zeros when not all scores are entered', () => {
    const game = makeGame({
      matches: [
        {
          matchNumber: 1,
          // '' pins means incomplete
          team1: { points: 0, totalPins: 0, totalWithHandicap: 0, bonusPoints: 0, players: [{ pins: '', bonusPoints: 0 }] },
          team2: { points: 0, totalPins: 180, totalWithHandicap: 180, bonusPoints: 0, players: [{ pins: '180', bonusPoints: 0 }] },
          playerMatches: [{ player: 1, result: null, team1Points: 0, team2Points: 0 }],
        },
      ],
      team1: { name: 'Team A', players: [makePlayer('p1', 'Alice', 150)] },
      team2: { name: 'Team B', players: [makePlayer('p3', 'Carol', 160)] },
    });
    expect(calculateGrandTotalPoints(game)).toEqual({ team1: 0, team2: 0 });
  });

  it('uses teamGamePointsPerWin value of 4 if configured', () => {
    const game = makeGame({
      teamGamePointsPerWin: 4,
      matches: [
        {
          matchNumber: 1,
          team1: { points: 0, totalPins: 250, totalWithHandicap: 250, bonusPoints: 0, players: [{ pins: '250', bonusPoints: 0 }] },
          team2: { points: 0, totalPins: 150, totalWithHandicap: 150, bonusPoints: 0, players: [{ pins: '150', bonusPoints: 0 }] },
          playerMatches: [{ player: 1, result: null, team1Points: 0, team2Points: 0 }],
        },
      ],
      team1: { name: 'Team A', players: [makePlayer('p1', 'Alice', 150)] },
      team2: { name: 'Team B', players: [makePlayer('p3', 'Carol', 160)] },
    });
    expect(calculateGrandTotalPoints(game)).toEqual({ team1: 4, team2: 0 });
  });
});
