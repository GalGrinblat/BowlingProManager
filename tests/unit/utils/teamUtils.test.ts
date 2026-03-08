/// <reference types="jest" />
import {
  TEAMS,
  forEachTeam,
  getTeamData,
  getOppositeTeam,
  processBothTeams,
  getTeamColor,
  getTeamPointsKey,
} from '../../../src/utils/teamUtils';
import type { Game } from '../../../src/types/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

const makePlayer = (playerId: string, name: string) => ({
  playerId,
  name,
  average: 150,
  handicap: 0,
  rank: 1,
  absent: false,
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
  team1: {
    name: 'Team A',
    players: [makePlayer('p1', 'Alice'), makePlayer('p2', 'Bob')],
  },
  team2: {
    name: 'Team B',
    players: [makePlayer('p3', 'Carol'), makePlayer('p4', 'Dave')],
  },
  matches: [],
  ...overrides,
});

// ── TEAMS constant ────────────────────────────────────────────────────────────

describe('TEAMS constant', () => {
  it('contains exactly team1 and team2', () => {
    expect(TEAMS).toEqual(['team1', 'team2']);
  });
});

// ── forEachTeam ───────────────────────────────────────────────────────────────

describe('forEachTeam', () => {
  it('calls callback for team1 and team2', () => {
    const called: string[] = [];
    forEachTeam((teamKey) => { called.push(teamKey); return null; });
    expect(called).toEqual(['team1', 'team2']);
  });

  it('returns a tuple with both results', () => {
    const [r1, r2] = forEachTeam((teamKey) => teamKey.toUpperCase());
    expect(r1).toBe('TEAM1');
    expect(r2).toBe('TEAM2');
  });

  it('provides correct index to callback', () => {
    const indices: number[] = [];
    forEachTeam((_, idx) => { indices.push(idx); return null; });
    expect(indices).toEqual([0, 1]);
  });
});

// ── getTeamData ───────────────────────────────────────────────────────────────

describe('getTeamData', () => {
  it('returns id, data, and players for team1', () => {
    const game = makeGame();
    const data = getTeamData(game, 'team1');
    expect(data.id).toBe('t1');
    expect(data.data?.name).toBe('Team A');
    expect(data.players).toHaveLength(2);
    expect(data.players[0].name).toBe('Alice');
  });

  it('returns id, data, and players for team2', () => {
    const game = makeGame();
    const data = getTeamData(game, 'team2');
    expect(data.id).toBe('t2');
    expect(data.data?.name).toBe('Team B');
    expect(data.players).toHaveLength(2);
    expect(data.players[0].name).toBe('Carol');
  });

  it('returns empty players array when team data is missing', () => {
    const game = makeGame({ team1: undefined });
    const data = getTeamData(game, 'team1');
    expect(data.players).toEqual([]);
    expect(data.data).toBeUndefined();
  });
});

// ── getOppositeTeam ───────────────────────────────────────────────────────────

describe('getOppositeTeam', () => {
  it('returns team2 when given team1', () => {
    expect(getOppositeTeam('team1')).toBe('team2');
  });

  it('returns team1 when given team2', () => {
    expect(getOppositeTeam('team2')).toBe('team1');
  });
});

// ── processBothTeams ──────────────────────────────────────────────────────────

describe('processBothTeams', () => {
  it('invokes handler for each team and returns their results', () => {
    const game = makeGame();
    const [r1, r2] = processBothTeams(game, (teamKey) => teamKey);
    expect(r1).toBe('team1');
    expect(r2).toBe('team2');
  });

  it('returns null for a team when team data is missing', () => {
    const game = makeGame({ team1: undefined });
    const [r1, r2] = processBothTeams(game, (teamKey) => teamKey);
    expect(r1).toBeNull();
    expect(r2).toBe('team2');
  });

  it('passes teamData with players to the handler', () => {
    const game = makeGame();
    const playerNames: string[][] = [];
    processBothTeams(game, (_, teamData) => {
      playerNames.push(teamData.players.map(p => p.name));
      return null;
    });
    expect(playerNames[0]).toEqual(['Alice', 'Bob']);
    expect(playerNames[1]).toEqual(['Carol', 'Dave']);
  });
});

// ── getTeamColor ──────────────────────────────────────────────────────────────

describe('getTeamColor', () => {
  it('returns orange for team1', () => {
    expect(getTeamColor('team1')).toBe('orange');
  });

  it('returns blue for team2', () => {
    expect(getTeamColor('team2')).toBe('blue');
  });
});

// ── getTeamPointsKey ──────────────────────────────────────────────────────────

describe('getTeamPointsKey', () => {
  it('returns team1Points for team1', () => {
    expect(getTeamPointsKey('team1')).toBe('team1Points');
  });

  it('returns team2Points for team2', () => {
    expect(getTeamPointsKey('team2')).toBe('team2Points');
  });
});
