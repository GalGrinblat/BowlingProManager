import {
  generateRoundRobinSchedule,
  getMatchDaysForRound,
  getMatchupsForMatchDay,
  getTotalMatchDays,
  getTotalGames,
  validateSchedule,
  getTeamSchedule,
  postponeMatchDay,
  formatMatchDate,
} from '../../../src/utils/scheduleUtils';

// ── generateRoundRobinSchedule ───────────────────────────────────────────────

describe('generateRoundRobinSchedule', () => {
  it('throws when fewer than 2 teams are provided', () => {
    expect(() => generateRoundRobinSchedule(['t1'])).toThrow('At least 2 teams are required');
    expect(() => generateRoundRobinSchedule([])).toThrow('At least 2 teams are required');
  });

  it('generates correct number of match days for 4 teams, 1 round', () => {
    // 4 teams → 3 match days per round
    const schedule = generateRoundRobinSchedule(['t1', 't2', 't3', 't4'], 1);
    expect(schedule).toHaveLength(3);
  });

  it('generates correct number of match days for 3 teams (odd, 1 round)', () => {
    // 3 teams → padded to 4 → 3 match days but 1 bye per day → 1 match per day × 3 days
    const schedule = generateRoundRobinSchedule(['t1', 't2', 't3'], 1);
    expect(schedule).toHaveLength(3);
  });

  it('each team plays every other team exactly once in a single round (4 teams)', () => {
    const teamIds = ['t1', 't2', 't3', 't4'];
    const schedule = generateRoundRobinSchedule(teamIds, 1);
    const pairCounts: Record<string, number> = {};
    schedule.forEach(day => {
      day.matches.forEach(m => {
        const key = [m.team1Id, m.team2Id].sort().join('-');
        pairCounts[key] = (pairCounts[key] ?? 0) + 1;
      });
    });
    // 4C2 = 6 unique pairs
    expect(Object.keys(pairCounts)).toHaveLength(6);
    Object.values(pairCounts).forEach(count => expect(count).toBe(1));
  });

  it('no team plays twice on the same match day', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2', 't3', 't4'], 2);
    schedule.forEach(day => {
      const teamsOnDay = new Set<string>();
      day.matches.forEach(m => {
        expect(teamsOnDay.has(m.team1Id)).toBe(false);
        expect(teamsOnDay.has(m.team2Id)).toBe(false);
        teamsOnDay.add(m.team1Id);
        teamsOnDay.add(m.team2Id);
      });
    });
  });

  it('multiplies match days correctly for 2 rounds', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2', 't3', 't4'], 2);
    expect(schedule).toHaveLength(6); // 3 days × 2 rounds
  });

  it('assigns sequential matchDay numbers across rounds', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2', 't3', 't4'], 2);
    schedule.forEach((day, i) => {
      expect(day.matchDay).toBe(i + 1);
    });
  });

  it('sets dates when startDate and dayOfWeek are provided', () => {
    const schedule = generateRoundRobinSchedule(
      ['t1', 't2'],
      1,
      '2024-01-01T00:00:00Z',
      'Monday'
    );
    expect(schedule[0]?.date).not.toBeNull();
    expect(typeof schedule[0]?.date).toBe('string');
  });

  it('leaves date as null when no startDate provided', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2'], 1);
    expect(schedule[0]?.date).toBeNull();
  });

  it('sets postponed to false by default', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2', 't3', 't4'], 1);
    schedule.forEach(day => expect(day.postponed).toBe(false));
  });

  it('assigns correct round numbers', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2', 't3', 't4'], 2);
    const round1Days = schedule.filter(d => d.round === 1);
    const round2Days = schedule.filter(d => d.round === 2);
    expect(round1Days).toHaveLength(3);
    expect(round2Days).toHaveLength(3);
  });
});

// ── getMatchDaysForRound ─────────────────────────────────────────────────────

describe('getMatchDaysForRound', () => {
  it('returns only match days for the requested round', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2', 't3', 't4'], 2);
    const round1 = getMatchDaysForRound(schedule, 1);
    expect(round1.every(d => d.round === 1)).toBe(true);
    expect(round1).toHaveLength(3);
  });

  it('returns empty array for non-existent round', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2'], 1);
    expect(getMatchDaysForRound(schedule, 99)).toHaveLength(0);
  });
});

// ── getMatchupsForMatchDay ───────────────────────────────────────────────────

describe('getMatchupsForMatchDay', () => {
  it('returns matches for the given match day', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2', 't3', 't4'], 1);
    const matches = getMatchupsForMatchDay(schedule, 1);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('returns empty array for unknown match day', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2'], 1);
    expect(getMatchupsForMatchDay(schedule, 99)).toHaveLength(0);
  });
});

// ── getTotalMatchDays ────────────────────────────────────────────────────────

describe('getTotalMatchDays', () => {
  it('calculates correctly for even team count', () => {
    // 4 teams, 1 round → 3 match days
    expect(getTotalMatchDays(4, 1)).toBe(3);
    expect(getTotalMatchDays(4, 2)).toBe(6);
  });

  it('calculates correctly for odd team count (padded to even)', () => {
    // 3 teams → padded to 4 → 3 match days
    expect(getTotalMatchDays(3, 1)).toBe(3);
    expect(getTotalMatchDays(5, 1)).toBe(5); // 5 → 6 → 5 match days
  });

  it('calculates correctly for 2 teams', () => {
    expect(getTotalMatchDays(2, 1)).toBe(1);
    expect(getTotalMatchDays(2, 3)).toBe(3);
  });
});

// ── getTotalGames ────────────────────────────────────────────────────────────

describe('getTotalGames', () => {
  it('calculates total games for 4 teams, 1 round', () => {
    // 4C2 = 6 games
    expect(getTotalGames(4, 1)).toBe(6);
  });

  it('multiplies games by rounds', () => {
    expect(getTotalGames(4, 2)).toBe(12);
  });

  it('handles 2 teams', () => {
    expect(getTotalGames(2, 1)).toBe(1);
  });
});

// ── validateSchedule ─────────────────────────────────────────────────────────

describe('validateSchedule', () => {
  it('returns valid for a proper round-robin schedule', () => {
    const teamIds = ['t1', 't2', 't3', 't4'];
    const schedule = generateRoundRobinSchedule(teamIds, 1);
    const result = validateSchedule(schedule, teamIds);
    expect(result.valid).toBe(true);
  });

  it('returns valid for empty schedule with no teams', () => {
    const result = validateSchedule([], []);
    expect(result.valid).toBe(true);
  });

  it('detects unequal match counts', () => {
    const teamIds = ['t1', 't2', 't3'];
    const schedule = generateRoundRobinSchedule(teamIds, 1);
    // Inject an extra match for t1 only
    schedule[0]!.matches.push({ team1Id: 't1', team2Id: 't2' });
    const result = validateSchedule(schedule, teamIds);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ── getTeamSchedule ──────────────────────────────────────────────────────────

describe('getTeamSchedule', () => {
  const teamIds = ['t1', 't2', 't3', 't4'];

  it('returns schedule entries for the requested team', () => {
    const schedule = generateRoundRobinSchedule(teamIds, 1);
    const t1Schedule = getTeamSchedule(schedule, 't1');
    expect(t1Schedule.length).toBe(3); // plays 3 match days
  });

  it('correctly identifies home and away games', () => {
    const schedule = generateRoundRobinSchedule(teamIds, 1);
    const t1Schedule = getTeamSchedule(schedule, 't1');
    t1Schedule.forEach(entry => {
      const daySchedule = schedule.find(d => d.matchDay === entry.matchDay)!;
      const match = daySchedule.matches.find(
        m => m.team1Id === 't1' || m.team2Id === 't1'
      )!;
      expect(entry.isHome).toBe(match.team1Id === 't1');
      expect(entry.opponentId).toBe(
        match.team1Id === 't1' ? match.team2Id : match.team1Id
      );
    });
  });

  it('returns empty array for team not in schedule', () => {
    const schedule = generateRoundRobinSchedule(teamIds, 1);
    expect(getTeamSchedule(schedule, 'unknown')).toHaveLength(0);
  });
});

// ── postponeMatchDay ─────────────────────────────────────────────────────────

describe('postponeMatchDay', () => {
  it('marks the specified match day as postponed', () => {
    const schedule = generateRoundRobinSchedule(
      ['t1', 't2', 't3', 't4'],
      1,
      '2024-01-01T00:00:00Z',
      'Monday'
    );
    const updated = postponeMatchDay(schedule, 1, 1, 'Monday');
    expect(updated[0]?.postponed).toBe(true);
  });

  it('stores the original date before updating', () => {
    const schedule = generateRoundRobinSchedule(
      ['t1', 't2', 't3', 't4'],
      1,
      '2024-01-01T00:00:00Z',
      'Monday'
    );
    const originalDate = schedule[0]?.date;
    const updated = postponeMatchDay(schedule, 1, 1, 'Monday');
    expect(updated[0]?.originalDate).toBe(originalDate);
  });

  it('shifts the postponed match day date forward by the delay', () => {
    const schedule = generateRoundRobinSchedule(
      ['t1', 't2', 't3', 't4'],
      1,
      '2024-01-01T00:00:00Z',
      'Monday'
    );
    const originalDate = schedule[0]?.date!;
    const updated = postponeMatchDay(schedule, 1, 1, 'Monday');
    const newDate = new Date(updated[0]?.date!);
    const old = new Date(originalDate);
    expect(newDate.getTime()).toBeGreaterThan(old.getTime());
  });

  it('returns unchanged schedule when match day not found', () => {
    const schedule = generateRoundRobinSchedule(['t1', 't2'], 1);
    const updated = postponeMatchDay(schedule, 99, 1, 'Monday');
    expect(updated).toEqual(schedule);
  });
});

// ── formatMatchDate ──────────────────────────────────────────────────────────

describe('formatMatchDate', () => {
  it('returns "TBD" for null input', () => {
    expect(formatMatchDate(null)).toBe('TBD');
  });

  it('returns a formatted date string for valid ISO date', () => {
    const result = formatMatchDate('2024-06-15T00:00:00Z', 'en-US');
    // Should contain month/day indicators
    expect(result).toMatch(/Jun|June|6/);
    expect(result).toMatch(/2024/);
  });
});
