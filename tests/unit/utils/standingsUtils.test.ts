/// <reference types="jest" />
import {
  calculateTeamStandings,
  calculatePlayerSeasonStats,
  calculateCurrentPlayerAverages,
  getTopPerformers,
} from '../../../src/utils/standingsUtils';
import type { Team, Game, PlayerStats } from '../../../src/types/index';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makeTeam = (id: string, name: string, playerIds: string[] = []): Team => ({
  id,
  seasonId: 's1',
  name,
  playerIds,
  rosterChanges: [],
  createdAt: '2024-01-01T00:00:00Z',
});

const makeGame = (
  team1Id: string,
  team2Id: string,
  status: 'pending' | 'in-progress' | 'completed' = 'completed',
  team1Points = 3,
  team2Points = 1
) => ({
  id: `g-${team1Id}-${team2Id}`,
  seasonId: 's1',
  round: 1,
  matchDay: 1,
  team1Id,
  team2Id,
  postponed: false,
  status,
  createdAt: '2024-01-01T00:00:00Z',
  matchesPerGame: 1,
  useHandicap: false,
  lineupStrategy: 'flexible' as const,
  lineupRule: 'standard' as const,
  playerMatchPointsPerWin: 1,
  teamMatchPointsPerWin: 1,
  teamGamePointsPerWin: 2,
  teamAllPresentBonusEnabled: false,
  teamAllPresentBonusPoints: 0,
  bonusRules: [],
  team1: {
    name: 'Team A',
    players: [{ playerId: 'p1', name: 'Alice', average: 150, handicap: 0, rank: 1, absent: false }],
  },
  team2: {
    name: 'Team B',
    players: [{ playerId: 'p2', name: 'Bob', average: 140, handicap: 0, rank: 1, absent: false }],
  },
  matches: [
    {
      matchNumber: 1,
      team1: {
        points: team1Points,
        totalPins: 180,
        totalWithHandicap: 180,
        bonusPoints: 0,
        players: [{ pins: '180', bonusPoints: 0 }],
      },
      team2: {
        points: team2Points,
        totalPins: 160,
        totalWithHandicap: 160,
        bonusPoints: 0,
        players: [{ pins: '160', bonusPoints: 0 }],
      },
      playerMatches: [{ player: 1, result: 'team1' as const, team1Points: 1, team2Points: 0 }],
    },
  ],
  grandTotalPoints: { team1: 0, team2: 0 },
});

// ── calculateTeamStandings ───────────────────────────────────────────────────

describe('calculateTeamStandings', () => {
  it('returns a standing entry for each team', () => {
    const teams = [makeTeam('t1', 'Team A'), makeTeam('t2', 'Team B')];
    const games: Game[] = [];
    const standings = calculateTeamStandings(teams, games);
    expect(standings).toHaveLength(2);
  });

  it('starts with all zeros when no games are completed', () => {
    const teams = [makeTeam('t1', 'Team A'), makeTeam('t2', 'Team B')];
    const standings = calculateTeamStandings(teams, []);
    standings.forEach(s => {
      expect(s.gamesPlayed).toBe(0);
      expect(s.points).toBe(0);
      expect(s.wins).toBe(0);
    });
  });

  it('only counts completed games', () => {
    const teams = [makeTeam('t1', 'Team A'), makeTeam('t2', 'Team B')];
    const game = makeGame('t1', 't2', 'pending');
    const standings = calculateTeamStandings(teams, [game as Game]);
    expect(standings[0]?.gamesPlayed).toBe(0);
  });

  it('records a win for the team with more points', () => {
    const teams = [makeTeam('t1', 'Team A'), makeTeam('t2', 'Team B')];
    const game = makeGame('t1', 't2', 'completed', 3, 1);
    const standings = calculateTeamStandings(teams, [game as Game]);
    const t1 = standings.find(s => s.teamId === 't1')!;
    const t2 = standings.find(s => s.teamId === 't2')!;
    expect(t1.wins).toBe(1);
    expect(t1.losses).toBe(0);
    expect(t2.wins).toBe(0);
    expect(t2.losses).toBe(1);
  });

  it('records a draw when both teams earn equal points', () => {
    const teams = [makeTeam('t1', 'Team A'), makeTeam('t2', 'Team B')];
    const game = makeGame('t1', 't2', 'completed', 2, 2);
    const standings = calculateTeamStandings(teams, [game as Game]);
    const t1 = standings.find(s => s.teamId === 't1')!;
    const t2 = standings.find(s => s.teamId === 't2')!;
    expect(t1.draws).toBe(1);
    expect(t2.draws).toBe(1);
    expect(t1.wins).toBe(0);
    expect(t2.wins).toBe(0);
  });

  it('accumulates total pins from matches', () => {
    const teams = [makeTeam('t1', 'Team A'), makeTeam('t2', 'Team B')];
    const game = makeGame('t1', 't2', 'completed', 3, 1);
    const standings = calculateTeamStandings(teams, [game as Game]);
    const t1 = standings.find(s => s.teamId === 't1')!;
    const t2 = standings.find(s => s.teamId === 't2')!;
    expect(t1.totalPins).toBe(180);
    expect(t2.totalPins).toBe(160);
  });

  it('sorts by points descending', () => {
    const teams = [makeTeam('t1', 'Team A'), makeTeam('t2', 'Team B')];
    const game = makeGame('t1', 't2', 'completed', 3, 1);
    const standings = calculateTeamStandings(teams, [game as Game]);
    // t1 has 3 points → should be first
    expect(standings[0]?.teamId).toBe('t1');
  });

  it('handles grand total points', () => {
    const teams = [makeTeam('t1', 'Team A'), makeTeam('t2', 'Team B')];
    const game = makeGame('t1', 't2', 'completed', 1, 1) as Game;
    game.grandTotalPoints = { team1: 2, team2: 0 };
    const standings = calculateTeamStandings(teams, [game]);
    const t1 = standings.find(s => s.teamId === 't1')!;
    expect(t1.points).toBe(3); // 1 match pt + 2 grand total
  });

  it('ignores games whose team IDs are not in teams list', () => {
    const teams = [makeTeam('t1', 'Team A')];
    const game = makeGame('t99', 't98', 'completed', 3, 1);
    const standings = calculateTeamStandings(teams, [game as Game]);
    expect(standings[0]?.gamesPlayed).toBe(0);
  });
});

// ── calculatePlayerSeasonStats ───────────────────────────────────────────────

describe('calculatePlayerSeasonStats', () => {
  it('returns empty array when no teams or games', () => {
    expect(calculatePlayerSeasonStats([], [])).toEqual([]);
  });

  it('excludes players with no games played', () => {
    const teams = [makeTeam('t1', 'Team A', ['p1'])];
    const stats = calculatePlayerSeasonStats(teams, []);
    expect(stats).toHaveLength(0);
  });

  it('calculates average from completed games', () => {
    const teams = [
      makeTeam('t1', 'Team A', ['p1']),
      makeTeam('t2', 'Team B', ['p2']),
    ];
    const game = makeGame('t1', 't2', 'completed', 3, 1);
    const stats = calculatePlayerSeasonStats(teams, [game as Game]);
    const alice = stats.find(s => s.playerName === 'Alice');
    expect(alice).toBeDefined();
    expect(alice?.gamesPlayed).toBe(1);
    expect(alice?.totalPins).toBe(180);
    expect(alice?.average).toBe(180);
  });

  it('tracks high game correctly', () => {
    const teams = [
      makeTeam('t1', 'Team A', ['p1']),
      makeTeam('t2', 'Team B', ['p2']),
    ];
    const game = makeGame('t1', 't2', 'completed', 3, 1);
    const stats = calculatePlayerSeasonStats(teams, [game as Game]);
    const alice = stats.find(s => s.playerName === 'Alice');
    expect(alice?.highGame).toBe(180);
  });

  it('sorts players by average descending', () => {
    const teams = [
      makeTeam('t1', 'Team A', ['p1']),
      makeTeam('t2', 'Team B', ['p2']),
    ];
    const game = makeGame('t1', 't2', 'completed', 3, 1);
    const stats = calculatePlayerSeasonStats(teams, [game as Game]);
    for (let i = 1; i < stats.length; i++) {
      expect(stats[i - 1]!.average).toBeGreaterThanOrEqual(stats[i]!.average);
    }
  });

  it('only counts completed games', () => {
    const teams = [
      makeTeam('t1', 'Team A', ['p1']),
      makeTeam('t2', 'Team B', ['p2']),
    ];
    const game = makeGame('t1', 't2', 'pending', 3, 1);
    const stats = calculatePlayerSeasonStats(teams, [game as Game]);
    expect(stats).toHaveLength(0);
  });
});

// ── calculateCurrentPlayerAverages ──────────────────────────────────────────

describe('calculateCurrentPlayerAverages', () => {
  it('returns empty object for no games', () => {
    expect(calculateCurrentPlayerAverages([])).toEqual({});
  });

  it('returns empty object when only non-completed games exist', () => {
    const game = makeGame('t1', 't2', 'pending', 3, 1);
    expect(calculateCurrentPlayerAverages([game as Game])).toEqual({});
  });

  it('calculates average for each player from completed games', () => {
    const game = makeGame('t1', 't2', 'completed', 3, 1);
    const averages = calculateCurrentPlayerAverages([game as Game]);
    // Alice (p1) bowled 180
    expect(averages['p1']).toBeDefined();
    expect(averages['p1']?.average).toBe(180);
    expect(averages['p1']?.gamesPlayed).toBe(1);
  });
});

// ── getTopPerformers ─────────────────────────────────────────────────────────

describe('getTopPerformers', () => {
  const makeStats = (name: string, avg: number, high: number, series: number): PlayerStats => ({
    playerId: name,
    playerName: name,
    teamId: 't1',
    teamName: 'Team A',
    gamesPlayed: 3,
    totalPins: avg * 3,
    average: avg,
    highGame: high,
    highSeries: series,
    seriesCount: 1,
    pointsScored: 0,
  });

  const playerStats = [
    makeStats('Alice', 200, 250, 600),
    makeStats('Bob', 180, 220, 540),
    makeStats('Carol', 160, 200, 480),
    makeStats('Dave', 150, 190, 460),
    makeStats('Eve', 140, 180, 440),
    makeStats('Frank', 130, 170, 400),
  ];

  it('returns top 5 by average', () => {
    const { topAverage } = getTopPerformers(playerStats);
    expect(topAverage).toHaveLength(5);
    expect(topAverage[0]?.playerName).toBe('Alice');
    expect(topAverage[4]?.playerName).toBe('Eve');
  });

  it('returns top 5 by high game', () => {
    const { topHighGame } = getTopPerformers(playerStats);
    expect(topHighGame[0]?.highGame).toBe(250);
    expect(topHighGame).toHaveLength(5);
  });

  it('returns top 5 by high series', () => {
    const { topHighSeries } = getTopPerformers(playerStats);
    expect(topHighSeries[0]?.highSeries).toBe(600);
    expect(topHighSeries).toHaveLength(5);
  });

  it('returns all players when fewer than 5 exist', () => {
    const small = playerStats.slice(0, 3);
    const { topAverage } = getTopPerformers(small);
    expect(topAverage).toHaveLength(3);
  });

  it('does not mutate the original array', () => {
    const copy = [...playerStats];
    getTopPerformers(playerStats);
    expect(playerStats).toEqual(copy);
  });
});
