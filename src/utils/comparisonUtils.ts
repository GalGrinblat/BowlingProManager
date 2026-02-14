/**
 * Comparison Utilities - Reusable functions for comparing team scores
 */

export type ComparisonResult = 'team1' | 'team2' | 'draw';

export interface TeamPointsResult {
  winner: ComparisonResult;
  team1Points: number;
  team2Points: number;
}

/**
 * Compare two team scores and determine winner with points allocation
 * @param team1Score - Score for team 1
 * @param team2Score - Score for team 2
 * @param winPoints - Points to award to winner (draw gets half each)
 * @returns Object with winner and points for each team
 */
export const compareTeamScores = (
  team1Score: number,
  team2Score: number,
  winPoints: number
): TeamPointsResult => {
  if (team1Score > team2Score) {
    return {
      winner: 'team1',
      team1Points: winPoints,
      team2Points: 0
    };
  } else if (team2Score > team1Score) {
    return {
      winner: 'team2',
      team1Points: 0,
      team2Points: winPoints
    };
  } else {
    return {
      winner: 'draw',
      team1Points: winPoints / 2,
      team2Points: winPoints / 2
    };
  }
};

/**
 * Apply match winner points to team scores based on total with handicap
 * @param team1Total - Team 1 total (with handicap)
 * @param team2Total - Team 2 total (with handicap)
 * @param team1BasePoints - Team 1's base points (before match winner points)
 * @param team2BasePoints - Team 2's base points (before match winner points)
 * @param matchWinnerPoints - Points to award for winning the match
 * @returns Object with updated team points
 */
export const applyMatchWinnerPoints = (
  team1Total: number,
  team2Total: number,
  team1BasePoints: number,
  team2BasePoints: number,
  matchWinnerPoints: number
): { team1Points: number; team2Points: number } => {
  const comparison = compareTeamScores(team1Total, team2Total, matchWinnerPoints);
  
  return {
    team1Points: team1BasePoints + comparison.team1Points,
    team2Points: team2BasePoints + comparison.team2Points
  };
};
