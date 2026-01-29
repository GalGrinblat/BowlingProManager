import { createEmptyMatch } from './matchUtils.js';

export const createNewGame = () => {
  return {
    id: Date.now(),
    team1: {
      name: '',
      players: [
        { rank: 1, name: '', average: '', handicap: 0, absent: false },
        { rank: 2, name: '', average: '', handicap: 0, absent: false },
        { rank: 3, name: '', average: '', handicap: 0, absent: false },
        { rank: 4, name: '', average: '', handicap: 0, absent: false }
      ]
    },
    team2: {
      name: '',
      players: [
        { rank: 1, name: '', average: '', handicap: 0, absent: false },
        { rank: 2, name: '', average: '', handicap: 0, absent: false },
        { rank: 3, name: '', average: '', handicap: 0, absent: false },
        { rank: 4, name: '', average: '', handicap: 0, absent: false }
      ]
    },
    matches: [
      createEmptyMatch(1),
      createEmptyMatch(2),
      createEmptyMatch(3)
    ],
    grandTotalPoints: { team1: 0, team2: 0 }
  };
};

export const validateSetup = (game) => {
  if (!game.team1.name.trim() || !game.team2.name.trim()) {
    alert('Please enter both team names');
    return false;
  }
  
  const team1Valid = game.team1.players.every(p => p.name.trim() && p.average !== '');
  const team2Valid = game.team2.players.every(p => p.name.trim() && p.average !== '');
  
  if (!team1Valid || !team2Valid) {
    alert('Please enter all player names and averages');
    return false;
  }
  
  return true;
};

export const validateAllMatches = (game) => {
  return game.matches.every((match, idx) => {
    return match.team1.players.every(p => p.pins !== '') && 
           match.team2.players.every(p => p.pins !== '');
  });
};
