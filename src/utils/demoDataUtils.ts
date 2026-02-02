/**
 * Demo Data Seeding Utility
 * Creates realistic demo data for testing and demonstration
 */

import { playersApi, leaguesApi, seasonsApi, teamsApi, gamesApi } from '../services/api';
import { generateRoundRobinSchedule } from './scheduleUtils';
import { calculateMatchResults, calculateBonusPoints, createEmptyMatch } from './matchUtils';

// Realistic first and last names
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const teamNames = [
  'Strikers', 'Pin Crushers', 'Spare Me', 'Gutter Gang', 'Split Happens', 'Ten Pinners',
  'Rolling Thunder', 'Alley Cats', 'Bowling Stones', 'Frame Games', 'Lucky Strikes', 'Pin Heads',
  'Bowl Movement', 'Sacred Rollers', 'Splits & Giggles', 'Kingpins'
];

/**
 * Generate a random bowling score around an average
 */
const generateScore = (average, variance = 30) => {
  const min = Math.max(0, average - variance);
  const max = Math.min(300, average + variance);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Start a season by creating all games from schedule
 * Uses the same logic as SeasonSetup.jsx to ensure consistency
 */
const startSeasonWithGames = (season, teams, players, league) => {
  // Generate schedule with actual team IDs
  const teamIds = teams.map(t => t.id);
  const schedule = generateRoundRobinSchedule(
    teamIds, 
    season.numberOfRounds,
    season.startDate,
    league.dayOfWeek
  );

  seasonsApi.update(season.id, {
    status: 'active',
    schedule: schedule
  });

  // Create all games from schedule (same logic as SeasonSetup.jsx)
  schedule.forEach(daySchedule => {
    daySchedule.matches.forEach(match => {
      const team1 = teams.find(t => t.id === match.team1Id);
      const team2 = teams.find(t => t.id === match.team2Id);
      
      if (team1 && team2) {
        const team1Players = team1.playerIds.map(id => {
          const player = players.find(p => p.id === id);
          const playerAvg = player?.startingAverage || 0;
          let handicap = 0;
          
          if (season.useHandicap && playerAvg < season.handicapBasis) {
            const diff = season.handicapBasis - playerAvg;
            handicap = Math.round(diff * (season.handicapPercentage / 100));
          }
          
          return {
            id: player.id,
            rank: team1.playerIds.indexOf(id) + 1,
            name: player?.name || '',
            average: playerAvg,
            handicap,
            absent: false
          };
        });

        const team2Players = team2.playerIds.map(id => {
          const player = players.find(p => p.id === id);
          const playerAvg = player?.startingAverage || 0;
          let handicap = 0;
          
          if (season.useHandicap && playerAvg < season.handicapBasis) {
            const diff = season.handicapBasis - playerAvg;
            handicap = Math.round(diff * (season.handicapPercentage / 100));
          }
          
          return {
            id: player.id,
            rank: team2.playerIds.indexOf(id) + 1,
            name: player?.name || '',
            average: playerAvg,
            handicap,
            absent: false
          };
        });

        // Create empty matches based on season configuration
        const emptyMatches = Array.from({ length: season.matchesPerGame }, (_, i) => 
          createEmptyMatch(i + 1, season.playersPerTeam)
        );

        gamesApi.create({
          seasonId: season.id,
          round: daySchedule.round,
          matchDay: daySchedule.matchDay,
          team1Id: team1.id,
          team2Id: team2.id,
          bonusRules: season.bonusRules,
          matchesPerGame: season.matchesPerGame,
          gameWinPoints: season.gameWinPoints || 1,
          matchWinPoints: season.matchWinPoints || 1,
          grandTotalPoints: season.grandTotalPoints || 2,
          team1: {
            name: team1.name,
            players: team1Players
          },
          team2: {
            name: team2.name,
            players: team2Players
          },
          matches: emptyMatches,
          grandTotalScore: { team1: 0, team2: 0 }
        });
      }
    });
  });

  return seasonsApi.getById(season.id); // Return updated season
};

/**
 * Complete round 1 games with realistic scores
 */
const completeRound1Games = (seasonId) => {
  const games = gamesApi.getBySeason(seasonId).filter(g => g.round === 1);
  
  games.forEach(game => {
    // Fill in scores for all matches
    game.matches.forEach((match, matchIndex) => {
      game.team1.players.forEach((player, playerIndex) => {
        const pins = generateScore(player.average);
        match.team1.players[playerIndex].pins = pins;
        match.team1.players[playerIndex].bonusPoints = calculateBonusPoints(
          pins, 
          player.average, 
          false, 
          game.bonusRules
        );
      });

      game.team2.players.forEach((player, playerIndex) => {
        const pins = generateScore(player.average);
        match.team2.players[playerIndex].pins = pins;
        match.team2.players[playerIndex].bonusPoints = calculateBonusPoints(
          pins, 
          player.average, 
          false, 
          game.bonusRules
        );
      });

      // Calculate match results using actual game logic
      calculateMatchResults(game, matchIndex);
    });

    // Calculate grand total
    let team1GrandTotal = 0;
    let team2GrandTotal = 0;
    game.matches.forEach(m => {
      team1GrandTotal += m.team1.totalWithHandicap;
      team2GrandTotal += m.team2.totalWithHandicap;
    });

    if (team1GrandTotal > team2GrandTotal) {
      game.grandTotalScore = { team1: game.grandTotalPoints, team2: 0 };
    } else if (team2GrandTotal > team1GrandTotal) {
      game.grandTotalScore = { team1: 0, team2: game.grandTotalPoints };
    } else {
      game.grandTotalScore = { team1: game.grandTotalPoints / 2, team2: game.grandTotalPoints / 2 };
    }

    // Update game to completed status
    gamesApi.update(game.id, {
      matches: game.matches,
      grandTotalScore: game.grandTotalScore,
      status: 'completed',
      completedAt: new Date().toISOString(),
      enteredBy: 'demo-seed'
    });
  });
};

/**
 * Seed complete demo data
 */
import { 
  organizationApi, 
  playersApi, 
  leaguesApi, 
  seasonsApi, 
  teamsApi, 
  gamesApi, 
  authApi 
} from '../services/api';

export const seedDemoData = (): void => {
  console.log('🎳 Seeding demo data...');

  // 1. Create 40 players
  console.log('Creating 40 players...');
  const players = [];
  for (let i = 0; i < 40; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const average = 120 + Math.floor(Math.random() * 100); // 120-220 range
    
    const player = playersApi.create({
      name: `${firstName} ${lastName}`,
      startingAverage: average,
      active: true
    });
    players.push(player);
  }
  console.log(`✅ Created ${players.length} players`);

  // 2. Create 2 leagues
  console.log('Creating 2 leagues...');
  const league1 = leaguesApi.create({
    name: 'Monday Night League',
    description: 'Competitive Monday evening league',
    defaultHandicapBasis: 200,
    useHandicap: true,
    handicapPercentage: 90,
    defaultPlayersPerTeam: 4,
    defaultMatchesPerGame: 3,
    dayOfWeek: 'Monday',
    bonusRules: [
      { type: 'player', condition: 'vs_average', threshold: 50, points: 1 },
      { type: 'player', condition: 'vs_average', threshold: 70, points: 2 }
    ],
    gameWinPoints: 1,
    matchWinPoints: 1,
    grandTotalPoints: 2,
    active: true
  });

  const league2 = leaguesApi.create({
    name: 'Thursday Night League',
    description: 'Recreational Thursday evening league',
    defaultHandicapBasis: 180,
    useHandicap: true,
    handicapPercentage: 100,
    defaultPlayersPerTeam: 4,
    defaultMatchesPerGame: 3,
    dayOfWeek: 'Thursday',
    bonusRules: [
      { type: 'player', condition: 'vs_average', threshold: 50, points: 1 },
      { type: 'player', condition: 'vs_average', threshold: 70, points: 2 }
    ],
    gameWinPoints: 1,
    matchWinPoints: 1,
    grandTotalPoints: 2,
    active: true
  });
  console.log('✅ Created 2 leagues');

  // 3. Create seasons for each league (in 'setup' status initially)
  console.log('Creating seasons...');
  const season1 = seasonsApi.create({
    leagueId: league1.id,
    name: 'Fall 2025',
    numberOfTeams: 8,
    playersPerTeam: 4,
    numberOfRounds: 4,
    handicapBasis: 200,
    useHandicap: true,
    handicapPercentage: 90,
    matchesPerGame: 3,
    bonusRules: league1.bonusRules,
    gameWinPoints: 1,
    matchWinPoints: 1,
    grandTotalPoints: 2,
    startDate: '2025-09-08',
    endDate: '2025-12-15'
  });

  const season2 = seasonsApi.create({
    leagueId: league2.id,
    name: 'Fall 2025',
    numberOfTeams: 8,
    playersPerTeam: 4,
    numberOfRounds: 4,
    handicapBasis: 180,
    useHandicap: true,
    handicapPercentage: 100,
    matchesPerGame: 3,
    bonusRules: league2.bonusRules,
    gameWinPoints: 1,
    matchWinPoints: 1,
    grandTotalPoints: 2,
    startDate: '2025-09-10',
    endDate: '2025-12-17'
  });
  console.log('✅ Created 2 seasons');

  // 4. Create 8 teams per league (16 total teams)
  console.log('Creating teams...');
  const season1Teams = [];
  const season2Teams = [];

  // Shuffle players
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

  // Season 1 teams (first 32 players)
  for (let i = 0; i < 8; i++) {
    const teamPlayers = shuffledPlayers.slice(i * 4, (i * 4) + 4);
    const team = teamsApi.create({
      seasonId: season1.id,
      name: teamNames[i],
      playerIds: teamPlayers.map(p => p.id)
    });
    season1Teams.push(team);
  }

  // Season 2 teams (last 8 players from season 1 + remaining players, shuffled differently)
  const season2Players = [...shuffledPlayers.slice(24)].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 8; i++) {
    const teamPlayers = season2Players.slice(i * 4, (i * 4) + 4);
    const team = teamsApi.create({
      seasonId: season2.id,
      name: teamNames[i + 8] || `Team ${String.fromCharCode(65 + i)}`,
      playerIds: teamPlayers.map(p => p.id)
    });
    season2Teams.push(team);
  }
  console.log('✅ Created 16 teams (8 per league)');

  // 5. Start both seasons (creates all games using actual app logic)
  console.log('Starting seasons and creating games...');
  startSeasonWithGames(season1, season1Teams, players, league1);
  startSeasonWithGames(season2, season2Teams, players, league2);
  console.log('✅ Started seasons and created all games for 4 rounds');

  // 6. Complete round 1 for both seasons with realistic scores
  console.log('Completing round 1 games...');
  completeRound1Games(season1.id);
  completeRound1Games(season2.id);
  console.log('✅ Completed round 1 for both seasons');
  console.log('🎉 Demo data seeding complete!');
  
  const round1Games = gamesApi.getAll().filter(g => g.round === 1 && g.status === 'completed');
  
  return {
    players: players.length,
    leagues: 2,
    seasons: 2,
    teams: 16,
    completedGames: round1Games.length
  };
};
