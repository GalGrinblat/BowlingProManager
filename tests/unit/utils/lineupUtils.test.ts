/// <reference types="jest" />
import {
  sortPlayersByAverage,
  applyLineupRule,
  orderPlayersByRank,
  canModifyLineup,
  updatePlayerRanks,
} from '../../../src/utils/lineupUtils';
import type { GamePlayer } from '../../../src/types/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

const makePlayer = (
  playerId: string,
  average: number,
  rank = 1,
  overrides: Partial<GamePlayer> = {}
): GamePlayer => ({
  playerId,
  name: `Player ${playerId}`,
  average,
  handicap: 0,
  rank,
  absent: false,
  ...overrides,
});

// ── sortPlayersByAverage ─────────────────────────────────────────────────────

describe('sortPlayersByAverage', () => {
  it('sorts players in descending order of average', () => {
    const players = [
      makePlayer('p1', 130),
      makePlayer('p2', 180),
      makePlayer('p3', 150),
    ];
    const sorted = sortPlayersByAverage(players);
    expect(sorted[0].average).toBe(180);
    expect(sorted[1].average).toBe(150);
    expect(sorted[2].average).toBe(130);
  });

  it('does not mutate the original array', () => {
    const players = [makePlayer('p1', 130), makePlayer('p2', 180)];
    sortPlayersByAverage(players);
    expect(players[0].average).toBe(130);
  });

  it('returns empty array unchanged', () => {
    expect(sortPlayersByAverage([])).toEqual([]);
  });

  it('handles a single player', () => {
    const players = [makePlayer('p1', 160)];
    expect(sortPlayersByAverage(players)).toHaveLength(1);
    expect(sortPlayersByAverage(players)[0].average).toBe(160);
  });

  it('preserves order for players with equal averages', () => {
    const players = [makePlayer('p1', 150), makePlayer('p2', 150)];
    const sorted = sortPlayersByAverage(players);
    expect(sorted).toHaveLength(2);
  });
});

// ── applyLineupRule ──────────────────────────────────────────────────────────

describe('applyLineupRule — standard', () => {
  const team1 = [makePlayer('a', 180), makePlayer('b', 150), makePlayer('c', 130)];
  const team2 = [makePlayer('x', 170), makePlayer('y', 160), makePlayer('z', 140)];

  it('places the highest-average player at rank 1 for both teams', () => {
    const { team1: t1, team2: t2 } = applyLineupRule(team1, team2, 'standard');
    expect(t1[0].average).toBe(180);
    expect(t2[0].average).toBe(170);
  });

  it('assigns rank equal to position (1-indexed)', () => {
    const { team1: t1 } = applyLineupRule(team1, team2, 'standard');
    expect(t1[0].rank).toBe(1);
    expect(t1[1].rank).toBe(2);
    expect(t1[2].rank).toBe(3);
  });

  it('does not mutate original arrays', () => {
    applyLineupRule(team1, team2, 'standard');
    expect(team1[0].rank).toBe(1); // original rank unchanged
  });
});

describe('applyLineupRule — balanced', () => {
  const team1 = [makePlayer('a', 180), makePlayer('b', 150), makePlayer('c', 130)];
  const team2 = [makePlayer('x', 170), makePlayer('y', 160), makePlayer('z', 140)];

  it('reverses team2 so highest average faces lowest average', () => {
    const { team1: t1, team2: t2 } = applyLineupRule(team1, team2, 'balanced');
    // team1[0] (avg 180) should face team2[2] (avg 140, now rank 1 after reversal)
    expect(t1[0].average).toBe(180);
    expect(t2[0].average).toBe(140);
  });

  it('assigns sequential ranks in the returned order', () => {
    const { team2: t2 } = applyLineupRule(team1, team2, 'balanced');
    expect(t2[0].rank).toBe(1);
    expect(t2[1].rank).toBe(2);
    expect(t2[2].rank).toBe(3);
  });
});

// ── orderPlayersByRank ───────────────────────────────────────────────────────

describe('orderPlayersByRank', () => {
  it('orders players by their rank property ascending', () => {
    const players = [
      makePlayer('p1', 150, 3),
      makePlayer('p2', 160, 1),
      makePlayer('p3', 140, 2),
    ];
    const ordered = orderPlayersByRank(players);
    expect(ordered[0].rank).toBe(1);
    expect(ordered[1].rank).toBe(2);
    expect(ordered[2].rank).toBe(3);
  });

  it('does not mutate the original array', () => {
    const players = [makePlayer('p1', 150, 3), makePlayer('p2', 160, 1)];
    orderPlayersByRank(players);
    expect(players[0].rank).toBe(3);
  });
});

// ── canModifyLineup ──────────────────────────────────────────────────────────

describe('canModifyLineup', () => {
  it('always allows modification for flexible strategy', () => {
    expect(canModifyLineup('flexible', false)).toBe(true);
    expect(canModifyLineup('flexible', true)).toBe(true);
  });

  it('allows modification for fixed strategy only before matches start', () => {
    expect(canModifyLineup('fixed', false)).toBe(true);
    expect(canModifyLineup('fixed', true)).toBe(false);
  });

  it('never allows modification for rule-based strategy', () => {
    expect(canModifyLineup('rule-based', false)).toBe(false);
    expect(canModifyLineup('rule-based', true)).toBe(false);
  });
});

// ── updatePlayerRanks ────────────────────────────────────────────────────────

describe('updatePlayerRanks', () => {
  it('sets rank to array index + 1 for each player', () => {
    const players = [
      makePlayer('p1', 180, 99),
      makePlayer('p2', 150, 99),
      makePlayer('p3', 130, 99),
    ];
    const updated = updatePlayerRanks(players);
    expect(updated[0].rank).toBe(1);
    expect(updated[1].rank).toBe(2);
    expect(updated[2].rank).toBe(3);
  });

  it('does not mutate the original objects', () => {
    const players = [makePlayer('p1', 180, 99)];
    const updated = updatePlayerRanks(players);
    expect(players[0].rank).toBe(99);
    expect(updated[0].rank).toBe(1);
  });

  it('returns empty array when given empty input', () => {
    expect(updatePlayerRanks([])).toEqual([]);
  });
});
