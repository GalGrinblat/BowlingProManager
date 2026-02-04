import type { BonusRule, Game, PlayerMatchResult } from '../types/index.ts';

interface MatchPlayer {
  pins: number;
  bonusPoints: number;
}

interface MatchTeam {
  score: number;
  totalPins: number;
  totalWithHandicap: number;
  bonusPoints: number;
  players: MatchPlayer[];
}

interface Match {
  matchNumber: number;
  team1: MatchTeam;
  team2: MatchTeam;
  playerMatches: PlayerMatchResult[];
}

export const createEmptyMatch = (matchNumber: number, playersPerTeam: number = 4): Match => {
  const emptyPlayers: MatchPlayer[] = Array.from({ length: playersPerTeam }, () => ({ 
    pins: 0, 
    bonusPoints: 0 
  }));
  
  const emptyGames: PlayerMatchResult[] = Array.from({ length: playersPerTeam }, (_, i) => ({ 
    player: i + 1, 
    result: null, 
    player1Score: 0, 
    player2Score: 0,
    player1Points: 0,
    player2Points: 0,
    player1BonusPoints: 0,
    player2BonusPoints: 0
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
    playerMatches: emptyGames
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
  
  // Use custom bonus rules if provided, otherwise use default
  const rules: BonusRule[] = bonusRules || [
    { type: 'player', condition: 'vs_average', threshold: 70, points: 2 },
    { type: 'player', condition: 'vs_average', threshold: 50, points: 1 }
  ];
  
  // Filter for player bonuses only and sort by points descending to award highest first
  const playerRules = rules
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
  
  // Get configurable point values (defaults to 1 if not set)
  const playerWinPoints = game.playerWinPoints || 1;
  const teamWinPoints = game.teamWinPoints || 1;
  
  // Calculate individual game results with handicap
  match.games.forEach((gameResult: any, idx: number) => {
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
    const team1Score = team1Player.absent ? parseInt(team1Player.average) - 10 : (match.team1.players[idx].pins || 0);
    const team2Score = team2Player.absent ? parseInt(team2Player.average) - 10 : (match.team2.players[idx].pins || 0);
    
    const team1WithHandicap = team1Score + team1Player.handicap;
    const team2WithHandicap = team2Score + team2Player.handicap;
    
    // Only calculate if both players have scores (entered or absent)
    const team1HasScore = team1Player.absent || match.team1.players[idx].pins > 0;
    const team2HasScore = team2Player.absent || match.team2.players[idx].pins > 0;
    
    if (team1HasScore && team2HasScore) {
      // Special rule: If both players are absent, it's always a draw
      if (team1Player.absent && team2Player.absent) {
        gameResult.result = 'draw';
        gameResult.team1Points = playerWinPoints / 2;
        gameResult.team2Points = playerWinPoints / 2;
      } else if (team1WithHandicap > team2WithHandicap) {
        gameResult.result = 'team1';
        gameResult.team1Points = playerWinPoints;
        gameResult.team2Points = 0;
      } else if (team2WithHandicap > team1WithHandicap) {
        gameResult.result = 'team2';
        gameResult.team1Points = 0;
        gameResult.team2Points = playerWinPoints;
      } else {
        gameResult.result = 'draw';
        gameResult.team1Points = playerWinPoints / 2;
        gameResult.team2Points = playerWinPoints / 2;
      }
    } else {
      gameResult.result = null;
      gameResult.team1Points = 0;
      gameResult.team2Points = 0;
    }
  });

  // Calculate totals
  match.team1.totalPins = game.team1.players.reduce((sum: number, p: any, idx: number) => {
    if (!p || !match.team1.players[idx]) return sum;
    const score = p.absent ? parseInt(p.average) - 10 : (match.team1.players[idx].pins || 0);
    return sum + score;
  }, 0);
  
  match.team2.totalPins = game.team2.players.reduce((sum: number, p: any, idx: number) => {
    if (!p || !match.team2.players[idx]) return sum;
    const score = p.absent ? parseInt(p.average) - 10 : (match.team2.players[idx].pins || 0);
    return sum + score;
  }, 0);
  
  match.team1.totalWithHandicap = game.team1.players.reduce((sum: number, p: any, idx: number) => {
    if (!p || !match.team1.players[idx]) return sum;
    const score = p.absent ? parseInt(p.average) - 10 : (match.team1.players[idx].pins || 0);
    return sum + score + p.handicap;
  }, 0);
  
  match.team2.totalWithHandicap = game.team2.players.reduce((sum: number, p: any, idx: number) => {
    if (!p || !match.team2.players[idx]) return sum;
    const score = p.absent ? parseInt(p.average) - 10 : (match.team2.players[idx].pins || 0);
    return sum + score + p.handicap;
  }, 0);

  // Calculate bonus points
  match.team1.bonusPoints = match.team1.players.reduce((sum: number, p: any) => sum + p.bonusPoints, 0);
  match.team2.bonusPoints = match.team2.players.reduce((sum: number, p: any) => sum + p.bonusPoints, 0);

  // Calculate game points
  let team1GamePoints = 0;
  let team2GamePoints = 0;
  
  match.games.forEach((gameResult: any) => {
    team1GamePoints += gameResult.team1Points;
    team2GamePoints += gameResult.team2Points;
  });

  // Calculate total points (game points + total bonus + performance bonus)
  const team1AllScoresEntered = game.team1.players.every((p: any, idx: number) => !p || (p.absent || match.team1.players[idx]?.pins > 0));
  const team2AllScoresEntered = game.team2.players.every((p: any, idx: number) => !p || (p.absent || match.team2.players[idx]?.pins > 0));
  const allScoresEntered = team1AllScoresEntered && team2AllScoresEntered;
  
  if (allScoresEntered) {
    if (match.team1.totalWithHandicap > match.team2.totalWithHandicap) {
      match.team1.score = team1GamePoints + teamWinPoints + match.team1.bonusPoints;
      match.team2.score = team2GamePoints + match.team2.bonusPoints;
    } else if (match.team2.totalWithHandicap > match.team1.totalWithHandicap) {
      match.team1.score = team1GamePoints + match.team1.bonusPoints;
      match.team2.score = team2GamePoints + teamWinPoints + match.team2.bonusPoints;
    } else {
      match.team1.score = team1GamePoints + (teamWinPoints / 2) + match.team1.bonusPoints;
      match.team2.score = team2GamePoints + (teamWinPoints / 2) + match.team2.bonusPoints;
    }
  } else {
    match.team1.score = team1GamePoints + match.team1.bonusPoints;
    match.team2.score = team2GamePoints + match.team2.bonusPoints;
  }
};

export const validateMatch = (currentGame: Game, matchIndex: number): boolean => {
  if (!currentGame.matches) return false;
  const match = currentGame.matches[matchIndex];
  const team1Valid = currentGame.team1.players.every((p: any, idx: number) => !p || (p.absent || match.team1.players[idx]?.pins > 0));
  const team2Valid = currentGame.team2.players.every((p: any, idx: number) => !p || (p.absent || match.team2.players[idx]?.pins > 0));
  return team1Valid && team2Valid;
};
