import type { Game } from '../types';

interface PlayerGameStats {
  totalPins: number;
  gameAverage: number;
  pointsScored: number;
  isAbsent: boolean;
  [key: string]: any;
}

interface GameStats {
  team1Stats: PlayerGameStats[];
  team2Stats: PlayerGameStats[];
  team1TotalPins: number;
  team2TotalPins: number;
  team1Average: number;
  team2Average: number;
}

export const calculatePlayerStats = (game: Game): GameStats => {
  const team1Stats = game.team1.players.map((player, idx) => {
    if (player.absent) {
      const absenceScore = parseInt(player.average) - 10;
      const totalPins = absenceScore * 3;
      const gameAverage = absenceScore;
      const pointsScored = game.matches.reduce((sum, m) => sum + m.games[idx].team1Points, 0);
      return { ...player, totalPins, gameAverage, pointsScored, isAbsent: true };
    }
    const totalPins = game.matches.reduce((sum, m) => sum + (parseInt(m.team1.players[idx].pins) || 0), 0);
    const gameAverage = totalPins / 3;
    const pointsScored = game.matches.reduce((sum, m) => sum + m.games[idx].team1Points, 0);
    return { ...player, totalPins, gameAverage, pointsScored, isAbsent: false };
  });
  
  const team2Stats = game.team2.players.map((player, idx) => {
    if (player.absent) {
      const absenceScore = parseInt(player.average) - 10;
      const totalPins = absenceScore * 3;
      const gameAverage = absenceScore;
      const pointsScored = game.matches.reduce((sum, m) => sum + m.games[idx].team2Points, 0);
      return { ...player, totalPins, gameAverage, pointsScored, isAbsent: true };
    }
    const totalPins = game.matches.reduce((sum, m) => sum + (parseInt(m.team2.players[idx].pins) || 0), 0);
    const gameAverage = totalPins / 3;
    const pointsScored = game.matches.reduce((sum, m) => sum + m.games[idx].team2Points, 0);
    return { ...player, totalPins, gameAverage, pointsScored, isAbsent: false };
  });
  
  // Calculate totals excluding absent players
  const team1NonAbsentStats = team1Stats.filter(p => !p.isAbsent);
  const team2NonAbsentStats = team2Stats.filter(p => !p.isAbsent);
  
  const team1TotalPins = team1NonAbsentStats.reduce((sum, p) => sum + p.totalPins, 0);
  const team2TotalPins = team2NonAbsentStats.reduce((sum, p) => sum + p.totalPins, 0);
  
  // Calculate average only from non-absent players
  const team1NonAbsentCount = team1NonAbsentStats.length;
  const team2NonAbsentCount = team2NonAbsentStats.length;
  const team1Average = team1NonAbsentCount > 0 ? team1TotalPins / (team1NonAbsentCount * 3) : 0;
  const team2Average = team2NonAbsentCount > 0 ? team2TotalPins / (team2NonAbsentCount * 3) : 0;
  
  return {
    team1Stats,
    team2Stats,
    team1TotalPins,
    team2TotalPins,
    team1Average,
    team2Average
  };
};

export const calculateGameTotals = (game: Game): { team1Total: number; team2Total: number } => {
  const team1Total = game.matches.reduce((sum, m) => sum + m.team1.score, 0) + game.grandTotalPoints.team1;
  const team2Total = game.matches.reduce((sum, m) => sum + m.team2.score, 0) + game.grandTotalPoints.team2;
  
  const team1TotalPinsNoHandicap = game.matches.reduce((sum, m) => sum + m.team1.totalPins, 0);
  const team2TotalPinsNoHandicap = game.matches.reduce((sum, m) => sum + m.team2.totalPins, 0);
  
  const team1TotalPinsWithHandicap = game.matches.reduce((sum, m) => sum + m.team1.totalWithHandicap, 0);
  const team2TotalPinsWithHandicap = game.matches.reduce((sum, m) => sum + m.team2.totalWithHandicap, 0);
  
  return {
    team1Total,
    team2Total,
    team1TotalPinsNoHandicap,
    team2TotalPinsNoHandicap,
    team1TotalPinsWithHandicap,
    team2TotalPinsWithHandicap
  };
};

export const calculateGrandTotalPoints = (game: Game): { team1: number; team2: number } => {
  // Get configurable grand total points (defaults to 2 if not set)
  const grandTotalPoints = game.grandTotalPoints || 2;
  
  // Check if all matches are complete (accounting for absent players)
  const allMatchesComplete = game.matches.every((m, matchIdx) => {
    const team1Complete = game.team1.players.every((p, idx) => p.absent || m.team1.players[idx].pins !== '');
    const team2Complete = game.team2.players.every((p, idx) => p.absent || m.team2.players[idx].pins !== '');
    return team1Complete && team2Complete;
  });
  
  if (allMatchesComplete) {
    // Calculate total pins with handicap across all matches
    const team1GrandTotal = game.matches.reduce((sum, m) => sum + m.team1.totalWithHandicap, 0);
    const team2GrandTotal = game.matches.reduce((sum, m) => sum + m.team2.totalWithHandicap, 0);
    
    if (team1GrandTotal > team2GrandTotal) {
      game.grandTotalPoints.team1 = grandTotalPoints;
      game.grandTotalScore.team2 = 0;
    } else if (team2Total > team1Total) {
      game.grandTotalScore.team1 = 0;
      game.grandTotalScore.team2 = grandTotalPoints;
    } else {
      game.grandTotalPoints.team1 = grandTotalPoints / 2;
      game.grandTotalScore.team2 = grandTotalPoints / 2;
    }
  } else {
    game.grandTotalScore.team1 = 0;
    game.grandTotalScore.team2 = 0;
  }
};
