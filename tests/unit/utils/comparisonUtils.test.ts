import {
  compareTeamScores,
  applyMatchWinnerPoints,
} from '../../../src/utils/comparisonUtils';

describe('compareTeamScores', () => {
  it('returns team1 as winner when team1 score is higher', () => {
    const result = compareTeamScores(200, 180, 1);
    expect(result.winner).toBe('team1');
    expect(result.team1Points).toBe(1);
    expect(result.team2Points).toBe(0);
  });

  it('returns team2 as winner when team2 score is higher', () => {
    const result = compareTeamScores(160, 190, 1);
    expect(result.winner).toBe('team2');
    expect(result.team1Points).toBe(0);
    expect(result.team2Points).toBe(1);
  });

  it('returns draw when scores are equal', () => {
    const result = compareTeamScores(175, 175, 1);
    expect(result.winner).toBe('draw');
    expect(result.team1Points).toBe(0.5);
    expect(result.team2Points).toBe(0.5);
  });

  it('correctly splits win points on a draw with non-default winPoints', () => {
    const result = compareTeamScores(175, 175, 2);
    expect(result.team1Points).toBe(1);
    expect(result.team2Points).toBe(1);
  });

  it('awards full win points (not split) to winner', () => {
    const result = compareTeamScores(200, 100, 3);
    expect(result.team1Points).toBe(3);
    expect(result.team2Points).toBe(0);
  });
});

describe('applyMatchWinnerPoints', () => {
  it('adds match winner points to the winning team', () => {
    // team1 total > team2 total → team1 gets matchWinnerPoints
    const result = applyMatchWinnerPoints(200, 180, 2, 0, 1);
    expect(result.team1Points).toBe(3); // 2 base + 1 winner
    expect(result.team2Points).toBe(0); // 0 base + 0 winner
  });

  it('adds match winner points to team2 when team2 wins', () => {
    const result = applyMatchWinnerPoints(150, 200, 1, 2, 1);
    expect(result.team1Points).toBe(1); // 1 base + 0 winner
    expect(result.team2Points).toBe(3); // 2 base + 1 winner
  });

  it('splits winner points equally on a draw', () => {
    const result = applyMatchWinnerPoints(180, 180, 1, 1, 2);
    expect(result.team1Points).toBe(2); // 1 base + 1 (draw half of 2)
    expect(result.team2Points).toBe(2);
  });

  it('preserves base points when adding winner bonus', () => {
    const result = applyMatchWinnerPoints(200, 150, 5, 3, 2);
    expect(result.team1Points).toBe(7); // 5 + 2
    expect(result.team2Points).toBe(3); // 3 + 0
  });
});
