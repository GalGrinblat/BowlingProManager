import type { Game } from '../types/index.ts';

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
  if (!game.team1 || !game.team2) {
    return {
      team1Stats: [],
      team2Stats: [],
      team1TotalPins: 0,
      team2TotalPins: 0,
      team1Average: 0,
      team2Average: 0
    };
  }
  const team1Stats = game.team1.players.map((player: any, idx: number) => {
    if (!player) {
      return { totalPins: 0, gameAverage: 0, pointsScored: 0, isAbsent: false };
    }
    if (player.absent) {
      const absenceScore = player.average - 10;
      const totalPins = absenceScore * 3;
      const gameAverage = absenceScore;
      const pointsScored = game.matches?.reduce((sum: number, m: any) => sum + m.playerMatches[idx].team1Points, 0) || 0;
      return { ...player, totalPins, gameAverage, pointsScored, isAbsent: true };
    }
    const totalPins = game.matches?.reduce((sum: number, m: any) => sum + (m.team1.players[idx].pins || 0), 0) || 0;
    const gameAverage = totalPins / 3;
    const pointsScored = game.matches?.reduce((sum: number, m: any) => sum + m.playerMatches[idx].team1Points, 0) || 0;
    return { ...player, totalPins, gameAverage, pointsScored, isAbsent: false };
  });
  
  const team2Stats = game.team2.players.map((player: any, idx: number) => {
    if (!player) {
      return { totalPins: 0, gameAverage: 0, pointsScored: 0, isAbsent: false };
    }
    if (player.absent) {
      const absenceScore = player.average - 10;
      const totalPins = absenceScore * 3;
      const gameAverage = absenceScore;
      const pointsScored = game.matches?.reduce((sum: number, m: any) => sum + m.playerMatches[idx].team2Points, 0) || 0;
      return { ...player, totalPins, gameAverage, pointsScored, isAbsent: true };
    }
    const totalPins = game.matches?.reduce((sum: number, m: any) => sum + (m.team2.players[idx].pins || 0), 0) || 0;
    const gameAverage = totalPins / 3;
    const pointsScored = game.matches?.reduce((sum: number, m: any) => sum + m.playerMatches[idx].team2Points, 0) || 0;
    return { ...player, totalPins, gameAverage, pointsScored, isAbsent: false };
  });
  
  // Calculate totals excluding absent players
  const team1NonAbsentStats = team1Stats.filter((p: any) => !p.isAbsent);
  const team2NonAbsentStats = team2Stats.filter((p: any) => !p.isAbsent);
  
  const team1TotalPins = team1NonAbsentStats.reduce((sum: number, p: any) => sum + p.totalPins, 0);
  const team2TotalPins = team2NonAbsentStats.reduce((sum: number, p: any) => sum + p.totalPins, 0);
  
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
  const team1Total = (game.matches?.reduce((sum: number, m: any) => sum + m.team1.score, 0) || 0) + game.grandTotalPoints.team1;
  const team2Total = (game.matches?.reduce((sum: number, m: any) => sum + m.team2.score, 0) || 0) + game.grandTotalPoints.team2;
  
  return {
    team1Total,
    team2Total
  };
};

export const calculateGrandTotalPoints = (game: Game): { team1: number; team2: number } => {
  // Get configurable grand total points (defaults to 2 if not set)
  const teamGamePointsPerWin = game.teamGamePointsPerWin || 2;
  
  // Check if all matches are complete (accounting for absent players)
  if (!game.team1 || !game.team2) return { team1: 0, team2: 0 };
  const allMatchesComplete = game.matches?.every((m: any) => {
    const team1Complete = game.team1!.players.every((p: any, idx: number) => !p || (p.absent || m.team1.players[idx]?.pins !== ''));
    const team2Complete = game.team2!.players.every((p: any, idx: number) => !p || (p.absent || m.team2.players[idx]?.pins !== ''));
    return team1Complete && team2Complete;
  }) || false;
  
  if (allMatchesComplete) {
    // Calculate total pins with handicap across all matches
    const team1GrandTotal = game.matches?.reduce((sum: number, m: any) => sum + m.team1.totalWithHandicap, 0) || 0;
    const team2GrandTotal = game.matches?.reduce((sum: number, m: any) => sum + m.team2.totalWithHandicap, 0) || 0;
    
    if (team1GrandTotal > team2GrandTotal) {
      return { team1: teamGamePointsPerWin, team2: 0 };
    } else if (team2GrandTotal > team1GrandTotal) {
      return { team1: 0, team2: teamGamePointsPerWin };
    } else {
      return { team1: teamGamePointsPerWin / 2, team2: teamGamePointsPerWin / 2 };
    }
  } else {
    return { team1: 0, team2: 0 };
  }
};
