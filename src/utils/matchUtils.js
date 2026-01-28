export const createEmptyMatch = (matchNumber) => ({
  matchNumber,
  team1: {
    score: 0,
    totalPins: 0,
    totalWithHandicap: 0,
    bonusPoints: 0,
    players: [
      { pins: '', bonusPoints: 0 },
      { pins: '', bonusPoints: 0 },
      { pins: '', bonusPoints: 0 },
      { pins: '', bonusPoints: 0 }
    ]
  },
  team2: {
    score: 0,
    totalPins: 0,
    totalWithHandicap: 0,
    bonusPoints: 0,
    players: [
      { pins: '', bonusPoints: 0 },
      { pins: '', bonusPoints: 0 },
      { pins: '', bonusPoints: 0 },
      { pins: '', bonusPoints: 0 }
    ]
  },
  games: [
    { player: 1, result: null, team1Points: 0, team2Points: 0 },
    { player: 2, result: null, team1Points: 0, team2Points: 0 },
    { player: 3, result: null, team1Points: 0, team2Points: 0 },
    { player: 4, result: null, team1Points: 0, team2Points: 0 }
  ]
});

export const calculateBonusPoints = (score, average, isAbsent) => {
  // If player is absent, they use average - 10
  if (isAbsent && average !== '') {
    const absenceScore = parseInt(average) - 10;
    const scoreToUse = score === '' ? absenceScore : Math.max(absenceScore, parseInt(score));
    if (scoreToUse >= parseInt(average) + 70) return 2;
    if (scoreToUse >= parseInt(average) + 50) return 1;
    return 0;
  }
  
  if (score === '' || average === '') return 0;
  const scoreNum = parseInt(score);
  const avgNum = parseInt(average);
  
  if (scoreNum >= avgNum + 70) return 2;
  if (scoreNum >= avgNum + 50) return 1;
  return 0;
};

export const calculateMatchResults = (game, matchIndex) => {
  const match = game.matches[matchIndex];
  
  // Calculate individual game results with handicap
  match.games.forEach((gameResult, idx) => {
    const team1Player = game.team1.players[idx];
    const team2Player = game.team2.players[idx];
    
    // If player is absent, use average - 10; otherwise use entered pins (or 0)
    const team1Score = team1Player.absent ? parseInt(team1Player.average) - 10 : (match.team1.players[idx].pins === '' ? 0 : parseInt(match.team1.players[idx].pins));
    const team2Score = team2Player.absent ? parseInt(team2Player.average) - 10 : (match.team2.players[idx].pins === '' ? 0 : parseInt(match.team2.players[idx].pins));
    
    const team1WithHandicap = team1Score + team1Player.handicap;
    const team2WithHandicap = team2Score + team2Player.handicap;
    
    // Only calculate if both players have scores (entered or absent)
    const team1HasScore = team1Player.absent || match.team1.players[idx].pins !== '';
    const team2HasScore = team2Player.absent || match.team2.players[idx].pins !== '';
    
    if (team1HasScore && team2HasScore) {
      if (team1WithHandicap > team2WithHandicap) {
        gameResult.result = 'team1';
        gameResult.team1Points = 1;
        gameResult.team2Points = 0;
      } else if (team2WithHandicap > team1WithHandicap) {
        gameResult.result = 'team2';
        gameResult.team1Points = 0;
        gameResult.team2Points = 1;
      } else {
        gameResult.result = 'draw';
        gameResult.team1Points = 0.5;
        gameResult.team2Points = 0.5;
      }
    } else {
      gameResult.result = null;
      gameResult.team1Points = 0;
      gameResult.team2Points = 0;
    }
  });

  // Calculate totals
  match.team1.totalPins = game.team1.players.reduce((sum, p, idx) => {
    const score = p.absent ? parseInt(p.average) - 10 : (match.team1.players[idx].pins === '' ? 0 : parseInt(match.team1.players[idx].pins));
    return sum + score;
  }, 0);
  
  match.team2.totalPins = game.team2.players.reduce((sum, p, idx) => {
    const score = p.absent ? parseInt(p.average) - 10 : (match.team2.players[idx].pins === '' ? 0 : parseInt(match.team2.players[idx].pins));
    return sum + score;
  }, 0);
  
  match.team1.totalWithHandicap = game.team1.players.reduce((sum, p, idx) => {
    const score = p.absent ? parseInt(p.average) - 10 : (match.team1.players[idx].pins === '' ? 0 : parseInt(match.team1.players[idx].pins));
    return sum + score + p.handicap;
  }, 0);
  
  match.team2.totalWithHandicap = game.team2.players.reduce((sum, p, idx) => {
    const score = p.absent ? parseInt(p.average) - 10 : (match.team2.players[idx].pins === '' ? 0 : parseInt(match.team2.players[idx].pins));
    return sum + score + p.handicap;
  }, 0);

  // Calculate bonus points
  match.team1.bonusPoints = match.team1.players.reduce((sum, p, idx) => sum + p.bonusPoints, 0);
  match.team2.bonusPoints = match.team2.players.reduce((sum, p, idx) => sum + p.bonusPoints, 0);

  // Calculate game points
  let team1GamePoints = 0;
  let team2GamePoints = 0;
  
  match.games.forEach(gameResult => {
    team1GamePoints += gameResult.team1Points;
    team2GamePoints += gameResult.team2Points;
  });

  // Calculate total points (game points + total bonus + performance bonus)
  const team1AllScoresEntered = game.team1.players.every((p, idx) => p.absent || match.team1.players[idx].pins !== '');
  const team2AllScoresEntered = game.team2.players.every((p, idx) => p.absent || match.team2.players[idx].pins !== '');
  const allScoresEntered = team1AllScoresEntered && team2AllScoresEntered;
  
  if (allScoresEntered) {
    if (match.team1.totalWithHandicap > match.team2.totalWithHandicap) {
      match.team1.score = team1GamePoints + 1 + match.team1.bonusPoints;
      match.team2.score = team2GamePoints + match.team2.bonusPoints;
    } else if (match.team2.totalWithHandicap > match.team1.totalWithHandicap) {
      match.team1.score = team1GamePoints + match.team1.bonusPoints;
      match.team2.score = team2GamePoints + 1 + match.team2.bonusPoints;
    } else {
      match.team1.score = team1GamePoints + 0.5 + match.team1.bonusPoints;
      match.team2.score = team2GamePoints + 0.5 + match.team2.bonusPoints;
    }
  } else {
    match.team1.score = team1GamePoints + match.team1.bonusPoints;
    match.team2.score = team2GamePoints + match.team2.bonusPoints;
  }
};

export const validateMatch = (currentGame, matchIndex) => {
  const match = currentGame.matches[matchIndex];
  const team1Valid = currentGame.team1.players.every((p, idx) => p.absent || match.team1.players[idx].pins !== '');
  const team2Valid = currentGame.team2.players.every((p, idx) => p.absent || match.team2.players[idx].pins !== '');
  return team1Valid && team2Valid;
};
