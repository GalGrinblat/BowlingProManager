/**
 * Demo Data Seeding Utility
 * Creates realistic demo data for testing and demonstration
 */
/// <reference types="vite/client" />

import { playersApi, leaguesApi, seasonsApi, teamsApi, gamesApi } from '../services/api';
import { generateRoundRobinSchedule } from './scheduleUtils';
import { createPlayer, createLeague, createSeason, createTeam } from '../models/index';
import type { Season, Team, League } from '../types/index.ts';

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
 * Start a season by creating all games from schedule
 * Uses the same logic as SeasonSetup.jsx to ensure consistency
 */
const startSeasonWithGames = (season: Season, teams: Team[], league: League): Season => {
  // Generate schedule with actual team IDs
  const teamIds = teams.map((t: Team) => t.id);
  const schedule = generateRoundRobinSchedule(
    teamIds, 
    season.numberOfRounds,
    season.startDate,
    league.dayOfWeek
  );

  // Update season to active status
  seasonsApi.update(season.id, {
    status: 'active'
  });

  // Create all games from schedule (same logic as SeasonSetup.jsx)
  schedule.forEach(daySchedule => {
    daySchedule.matches.forEach(match => {
      const team1 = teams.find((t: Team) => t.id === match.team1Id);
      const team2 = teams.find((t: Team) => t.id === match.team2Id);
      
      if (team1 && team2) {
        // Create game with proper structure matching current Game interface
        gamesApi.create({
          seasonId: season.id,
          round: daySchedule.round,
          matchDay: daySchedule.matchDay,
          team1Id: team1.id,
          team2Id: team2.id
        });
      }
    });
  });

  const updatedSeason = seasonsApi.getById(season.id);
  return updatedSeason!; // Return updated season (non-null assertion since we just updated it)
};

/**
 * Seed complete demo data
 */
export interface SeedDataResult {
  players: number;
  leagues: number;
  seasons: number;
  teams: number;
  completedGames: number;
}

export const seedDemoData = (): SeedDataResult => {
  const isDev = import.meta.env.DEV;
  if (isDev) console.log('🎳 Seeding demo data...');

  try {
    // 1. Create 40 players
    if (isDev) console.log('Creating 40 players...');
    const players = [];
    for (let i = 0; i < 40; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const average = 120 + Math.floor(Math.random() * 100); // 120-220 range
      
      const player = playersApi.create(
        createPlayer({
          name: `${firstName} ${lastName}`,
          startingAverage: average,
          active: true
        })
      );
      players.push(player);
    }
    if (isDev) console.log(`✅ Created ${players.length} players`);

    // 2. Create 2 leagues
    if (isDev) console.log('Creating 2 leagues...');
    const league1 = leaguesApi.create(
      createLeague({
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
        playerMatchPointsPerWin: 1,
        teamMatchPointsPerWin: 1,
        grandTotalPoints: 2,
        active: true
      })
    );
    if (isDev) console.log('✅ Created league 1:', league1.id);

    const league2 = leaguesApi.create(
      createLeague({
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
        playerMatchPointsPerWin: 1,
        teamMatchPointsPerWin: 1,
        grandTotalPoints: 2,
        active: true
      })
    );
    if (isDev) console.log('✅ Created league 2:', league2.id);
    if (isDev) console.log('✅ Created 2 leagues');

  // 3. Create seasons for each league (in 'setup' status initially)
  if (isDev) console.log('Creating seasons...');
  const season1 = seasonsApi.create(
    createSeason({
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
      playerMatchPointsPerWin: 1,
      teamMatchPointsPerWin: 1,
      grandTotalPoints: 2,
      startDate: '2025-09-08',
      endDate: '2025-12-15'
    })
  );

  const season2 = seasonsApi.create(
    createSeason({
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
      playerMatchPointsPerWin: 1,
      teamMatchPointsPerWin: 1,
      grandTotalPoints: 2,
      startDate: '2025-09-10',
      endDate: '2025-12-17'
    })
  );
  if (isDev) console.log('✅ Created 2 seasons');

  // 4. Create 8 teams per league (16 total teams)
  if (isDev) console.log('Creating teams...');
  const season1Teams = [];
  const season2Teams = [];

  // Shuffle players
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

  // Season 1 teams (first 32 players)
  for (let i = 0; i < 8; i++) {
    const teamPlayers = shuffledPlayers.slice(i * 4, (i * 4) + 4);
    const team = teamsApi.create(
      createTeam({
        seasonId: season1.id,
        name: teamNames[i]!,
        playerIds: teamPlayers.map(p => p.id)
      })
    );
    season1Teams.push(team);
  }

  // Season 2 teams (last 8 players from season 1 + remaining players, shuffled differently)
  const season2Players = [...shuffledPlayers.slice(24)].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 8; i++) {
    const teamPlayers = season2Players.slice(i * 4, (i * 4) + 4);
    const team = teamsApi.create(
      createTeam({
        seasonId: season2.id,
        name: teamNames[i + 8] || `Team ${String.fromCharCode(65 + i)}`,
        playerIds: teamPlayers.map(p => p.id)
      })
    );
    season2Teams.push(team);
  }
  if (isDev) console.log('✅ Created 16 teams (8 per league)');

  // 5. Start both seasons (creates all games using actual app logic)
  if (isDev) console.log('Starting seasons and creating games...');
  startSeasonWithGames(season1, season1Teams, league1);
  startSeasonWithGames(season2, season2Teams, league2);
  if (isDev) console.log('✅ Started seasons and created all games for 4 rounds');

  // 6. Games are created in pending status (ready for score entry)
  if (isDev) console.log('✅ All games created in pending status');
  if (isDev) console.log('🎉 Demo data seeding complete!');
  
  return {
    players: players.length,
    leagues: 2,
    seasons: 2,
    teams: 16,
    completedGames: 0 // Games created in pending status for manual entry
  };
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
};
