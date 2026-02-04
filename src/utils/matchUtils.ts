import type { BonusRule, Game, PlayerMatchResult, GameMatch, MatchPlayer } from '../types/index';

export const createEmptyMatch = (matchNumber: number, playersPerTeam: number = 4): GameMatch => {
  const emptyPlayers: MatchPlayer[] = Array.from({ length: playersPerTeam }, () => ({ 
    pins: 0, 
    bonusPoints: 0 
  }));
  
  const emptyPlayerMatches: PlayerMatchResult[] = Array.from({ length: playersPerTeam }, (_, i) => ({ 
    player: i + 1, 
    result: null,
    team1Points: 0,
    team2Points: 0
  }));
  
  return {
    matchNumber,
    team1: {
      score: 0,
      totalPins: 0,
      totalWithHandicap: 0,
      bonusPoints: 0,
      players: emptyPlayers
    },
    team2: {
      score: 0,
      totalPins: 0,
      totalWithHandicap: 0,
      bonusPoints: 0,
      players: [...emptyPlayers]
    },
    playerMatches: emptyPlayerMatches
  };
};

export const calculateBonusPoints = (
  score: string | number, 
  average: string | number, 
  isAbsent: boolean, 
  bonusRules: BonusRule[] | null = null
): number => {
  // Absent players cannot earn bonus points
  if (isAbsent) return 0;
  
  if (score === '' || average === '') return 0;
  const scoreNum = typeof score === 'string' ? parseInt(score) : score;
  const avgNum = typeof average === 'string' ? parseInt(average) : average;
  
  // Use bonus rules if provided
  if (!bonusRules || bonusRules.length === 0) return 0;
  
  // Filter for player bonuses only and sort by points descending to award highest first
  const playerRules = bonusRules
    .filter(r => r.type === 'player')
    .sort((a, b) => b.points - a.points);
  
  // Check each rule and return the first (highest) bonus that applies
  for (const rule of playerRules) {
    if (rule.condition === 'vs_average') {
      if (scoreNum >= avgNum + rule.threshold) {
        return rule.points;
      }
    } else if (rule.condition === 'pure_score') {
      if (scoreNum >= rule.threshold) {
        return rule.points;
      }
    }
  }
  
  return 0;
};

export const calculateMatchResults = (game: Game, matchIndex: number): void => {
  if (!game.matches) return;
  const match = game.matches[matchIndex];
  if (!match) return;
  
  // Get configurable point values (defaults to 1 if not set)
  const playerMatchPointsPerWin = game.playerMatchPointsPerWin || 1;
  const teamMatchPointsPerWin = game.teamMatchPointsPerWin || 1;
  
  // Calculate individual game results with handicap
  match.playerMatches.forEach((gameResult: any, idx: number) => {
    if (!game.team1 || !game.team2) return;
    const team1Player = game.team1.players[idx];
    const team2Player = game.team2.players[idx];
    
    // Safety check: if players are undefined, skip this game
    if (!team1Player || !team2Player) {
      gameResult.result = null;
      gameResult.team1Points = 0;
      gameResult.team2Points = 0;
      return;
    }
    
    // If player is absent, use average - 10; otherwise use entered pins (or 0)
    const team1Score = team1Player.absent ? team1Player.average - 10 : (match.team1.players[idx]?.pins || 0);
    const team2Score = team2Player.absent ? team2Player.average - 10 : (match.team2.players[idx]?.pins || 0);
    
    const team1WithHandicap = team1Score + team1Player.handicap;
    const team2WithHandicap = team2Score + team2Player.handicap;
    
    // Only calculate if both players have scores (entered or absent)
    const team1HasScore = team1Player.absent || (match.team1.players[idx]?.pins || 0) > 0;
    const team2HasScore = team2Player.absent || (match.team2.players[idx]?.pins || 0) > 0;
    
    if (team1HasScore && team2HasScore) {
      // Special rule: If both players are absent, it's always a draw
      if (team1Player.absent && team2Player.absent) {
        gameResult.result = 'draw';
        gameResult.team1Points = playerMatchPointsPerWin / 2;
        gameResult.team2Points = playerMatchPointsPerWin / 2;
      } else if (team1WithHandicap > team2WithHandicap) {
        gameResult.result = 'team1';
        gameResult.team1Points = playerMatchPointsPerWin;
        gameResult.team2Points = 0;
      } else if (team2WithHandicap > team1WithHandicap) {
        gameResult.result = 'team2';
        gameResult.team1Points = 0;
        gameResult.team2Points = playerMatchPointsPerWin;
      } else {
        gameResult.result = 'draw';
        gameResult.team1Points = playerMatchPointsPerWin / 2;
        gameResult.team2Points = playerMatchPointsPerWin / 2;
      }
    } else {
      gameResult.result = null;
      gameResult.team1Points = 0;
      gameResult.team2Points = 0;
    }
  });

  // Calculate totals
  if (!game.team1 || !game.team2) return;
  match.team1.totalPins = game.team1.players.reduce((sum: number, p: any, idx: number) => {
    if (!p || !match.team1.players[idx]) return sum;
    const score = p.absent ? p.average - 10 : (match.team1.players[idx].pins || 0);
    return sum + score;
  }, 0);
  
  match.team2.totalPins = game.team2.players.reduce((sum: number, p: any, idx: number) => {
    if (!p || !match.team2.players[idx]) return sum;
    const score = p.absent ? p.average - 10 : (match.team2.players[idx].pins || 0);
    return sum + score;
  }, 0);
  
  match.team1.totalWithHandicap = game.team1.players.reduce((sum: number, p: any, idx: number) => {
    if (!p || !match.team1.players[idx]) return sum;
    const score = p.absent ? p.average - 10 : (match.team1.players[idx].pins || 0);
    return sum + score + p.handicap;
  }, 0);
  
  match.team2.totalWithHandicap = game.team2.players.reduce((sum: number, p: any, idx: number) => {
    if (!p || !match.team2.players[idx]) return sum;
    const score = p.absent ? p.average - 10 : (match.team2.players[idx].pins || 0);
    return sum + score + p.handicap;
  }, 0);

  // Calculate bonus points
  match.team1.bonusPoints = match.team1.players.reduce((sum: number, p: any) => sum + p.bonusPoints, 0);
  match.team2.bonusPoints = match.team2.players.reduce((sum: number, p: any) => sum + p.bonusPoints, 0);

  // Calculate game points
  let team1GamePoints = 0;
  let team2GamePoints = 0;
  
  match.playerMatches.forEach((gameResult: any) => {
    team1GamePoints += gameResult.team1Points;
    team2GamePoints += gameResult.team2Points;
  });

  // Calculate total points (game points + total bonus + performance bonus)
  if (!game.team1 || !game.team2) return;
  const team1AllScoresEntered = game.team1.players.every((p: any, idx: number) => {
    const matchPlayer = match.team1.players[idx];
    return !p || (p.absent || (matchPlayer?.pins || 0) > 0);
  });
  const team2AllScoresEntered = game.team2.players.every((p: any, idx: number) => {
    const matchPlayer = match.team2.players[idx];
    return !p || (p.absent || (matchPlayer?.pins || 0) > 0);
  });
  const allScoresEntered = team1AllScoresEntered && team2AllScoresEntered;
  
  if (allScoresEntered) {
    if (match.team1.totalWithHandicap > match.team2.totalWithHandicap) {
      match.team1.score = team1GamePoints + teamMatchPointsPerWin + match.team1.bonusPoints;
      match.team2.score = team2GamePoints + match.team2.bonusPoints;
    } else if (match.team2.totalWithHandicap > match.team1.totalWithHandicap) {
      match.team1.score = team1GamePoints + match.team1.bonusPoints;
      match.team2.score = team2GamePoints + teamMatchPointsPerWin + match.team2.bonusPoints;
    } else {
      match.team1.score = team1GamePoints + (teamMatchPointsPerWin / 2) + match.team1.bonusPoints;
      match.team2.score = team2GamePoints + (teamMatchPointsPerWin / 2) + match.team2.bonusPoints;
    }
  } else {
    match.team1.score = team1GamePoints + match.team1.bonusPoints;
    match.team2.score = team2GamePoints + match.team2.bonusPoints;
  }
};

export const validateMatch = (currentGame: Game, matchIndex: number): boolean => {
  if (!currentGame.matches) return false;
  const match = currentGame.matches[matchIndex];
  if (!match) return false;
  if (!currentGame.team1 || !currentGame.team2) return false;
  const team1Valid = currentGame.team1.players.every((p: any, idx: number) => !p || (p.absent || (match.team1.players[idx]?.pins || 0) > 0));
  const team2Valid = currentGame.team2.players.every((p: any, idx: number) => !p || (p.absent || (match.team2.players[idx]?.pins || 0) > 0));
  return team1Valid && team2Valid;
};
