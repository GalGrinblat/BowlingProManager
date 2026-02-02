/**
 * API Service Layer - Abstraction over localStorage
 * This allows easy migration to backend database later
 */

import type {
  Organization,
  Player,
  League,
  Season,
  Team,
  Game,
  User
} from '../types';

const STORAGE_KEYS = {
  ORGANIZATION: 'bowling_organization',
  PLAYERS: 'bowling_players',
  LEAGUES: 'bowling_leagues',
  SEASONS: 'bowling_seasons',
  TEAMS: 'bowling_teams',
  GAMES: 'bowling_games',
  CURRENT_USER: 'bowling_current_user'
} as const;

// ===== HELPER FUNCTIONS =====

const getFromStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T : null;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
};

const saveToStorage = <T>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    return false;
  }
};

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ===== ORGANIZATION =====

export const organizationApi = {
  get: (): Organization => {
    const org = getFromStorage<Organization>(STORAGE_KEYS.ORGANIZATION);
    if (!org) {
      // Create default organization
      const defaultOrg: Organization = {
        name: 'My Bowling Organization',
        language: 'en',
        createdAt: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.ORGANIZATION, defaultOrg);
      return defaultOrg;
    }
    // Ensure language field exists
    if (!org.language) {
      org.language = 'en';
      saveToStorage(STORAGE_KEYS.ORGANIZATION, org);
    }
    return org;
  },
  
  update: (data: Partial<Organization>): Organization => {
    const org = organizationApi.get();
    const updated = { ...org, ...data };
    saveToStorage(STORAGE_KEYS.ORGANIZATION, updated);
    return updated;
  }
};

// ===== PLAYERS =====

export const playersApi = {
  getAll: (): Player[] => {
    return getFromStorage<Player[]>(STORAGE_KEYS.PLAYERS) || [];
  },
  
  getById: (id: string): Player | undefined => {
    const players = playersApi.getAll();
    return players.find(p => p.id === id);
  },
  
  create: (playerData: Omit<Player, 'id' | 'createdAt'>): Player => {
    const players = playersApi.getAll();
    const newPlayer: Player = {
      id: generateId(),
      ...playerData,
      createdAt: new Date().toISOString()
    };
    players.push(newPlayer);
    saveToStorage(STORAGE_KEYS.PLAYERS, players);
    return newPlayer;
  },
  
  update: (id: string, updates: Partial<Player>): Player | null => {
    const players = playersApi.getAll();
    const index = players.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    players[index] = {
      ...players[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.PLAYERS, players);
    return players[index];
  },
  
  delete: (id: string): boolean => {
    const players = playersApi.getAll();
    const filtered = players.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PLAYERS, filtered);
    return true;
  }
};

// ===== LEAGUES =====

export const leaguesApi = {
  getAll: (): League[] => {
    return getFromStorage<League[]>(STORAGE_KEYS.LEAGUES) || [];
  },
  
  getById: (id: string): League | undefined => {
    const leagues = leaguesApi.getAll();
    return leagues.find(l => l.id === id);
  },
  
  create: (leagueData: Omit<League, 'id' | 'createdAt'>): League => {
    const leagues = leaguesApi.getAll();
    const newLeague: League = {
      id: generateId(),
      ...leagueData,
      createdAt: new Date().toISOString()
    };
    leagues.push(newLeague);
    saveToStorage(STORAGE_KEYS.LEAGUES, leagues);
    return newLeague;
  },
  
  update: (id: string, updates: Partial<League>): League | null => {
    const leagues = leaguesApi.getAll();
    const index = leagues.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    leagues[index] = {
      ...leagues[index],
      ...updates
    };
    saveToStorage(STORAGE_KEYS.LEAGUES, leagues);
    return leagues[index];
  },
  
  delete: (id: string): boolean => {
    const leagues = leaguesApi.getAll();
    const filtered = leagues.filter(l => l.id !== id);
    saveToStorage(STORAGE_KEYS.LEAGUES, filtered);
    return true;
  },
  
  // Get seasons for a league
  getSeasons: (leagueId: string): Season[] => {
    const seasons = seasonsApi.getAll();
    return seasons.filter(s => s.leagueId === leagueId);
  }
};

// ===== SEASONS =====

export const seasonsApi = {
  getAll: (): Season[] => {
    return getFromStorage<Season[]>(STORAGE_KEYS.SEASONS) || [];
  },
  
  getById: (id: string): Season | undefined => {
    const seasons = seasonsApi.getAll();
    return seasons.find(s => s.id === id);
  },
  
  getByLeague: (leagueId: string): Season[] => {
    const seasons = seasonsApi.getAll();
    return seasons.filter(s => s.leagueId === leagueId);
  },
  
  create: (seasonData: Omit<Season, 'id' | 'createdAt'>): Season => {
    const seasons = seasonsApi.getAll();
    const newSeason: Season = {
      id: generateId(),
      status: 'setup', // setup, active, completed
      ...seasonData,
      createdAt: new Date().toISOString()
    };
    seasons.push(newSeason);
    saveToStorage(STORAGE_KEYS.SEASONS, seasons);
    return newSeason;
  },
  
  update: (id: string, updates: Partial<Season>): Season | null => {
    const seasons = seasonsApi.getAll();
    const index = seasons.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    seasons[index] = {
      ...seasons[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.SEASONS, seasons);
    return seasons[index];
  },
  
  delete: (id: string): boolean => {
    const seasons = seasonsApi.getAll();
    const filtered = seasons.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.SEASONS, filtered);
    return true;
  }
};

// ===== TEAMS =====

export const teamsApi = {
  getAll: (): Team[] => {
    return getFromStorage<Team[]>(STORAGE_KEYS.TEAMS) || [];
  },
  
  getById: (id: string): Team | undefined => {
    const teams = teamsApi.getAll();
    return teams.find(t => t.id === id);
  },
  
  getBySeason: (seasonId: string): Team[] => {
    const teams = teamsApi.getAll();
    return teams.filter(t => t.seasonId === seasonId);
  },
  
  create: (teamData: Omit<Team, 'id' | 'createdAt'>): Team => {
    const teams = teamsApi.getAll();
    const newTeam: Team = {
      id: generateId(),
      ...teamData,
      createdAt: new Date().toISOString()
    };
    teams.push(newTeam);
    saveToStorage(STORAGE_KEYS.TEAMS, teams);
    return newTeam;
  },
  
  update: (id: string, updates: Partial<Team>): Team | null => {
    const teams = teamsApi.getAll();
    const index = teams.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    teams[index] = {
      ...teams[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.TEAMS, teams);
    return teams[index];
  },
  
  delete: (id: string): boolean => {
    const teams = teamsApi.getAll();
    const filtered = teams.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TEAMS, filtered);
    return true;
  }
};

// ===== GAMES =====

export const gamesApi = {
  getAll: (): Game[] => {
    return getFromStorage<Game[]>(STORAGE_KEYS.GAMES) || [];
  },
  
  getById: (id: string): Game | undefined => {
    const games = gamesApi.getAll();
    return games.find(g => g.id === id);
  },
  
  getBySeason: (seasonId: string): Game[] => {
    const games = gamesApi.getAll();
    return games.filter(g => g.seasonId === seasonId);
  },
  
  getByRound: (seasonId: string, round: number): Game[] => {
    const games = gamesApi.getAll();
    return games.filter(g => g.seasonId === seasonId && g.round === round);
  },
  
  create: (gameData: Omit<Game, 'id' | 'createdAt' | 'status'>): Game => {
    const games = gamesApi.getAll();
    const newGame: Game = {
      id: generateId(),
      status: 'pending', // pending, in-progress, completed
      ...gameData,
      createdAt: new Date().toISOString()
    };
    games.push(newGame);
    saveToStorage(STORAGE_KEYS.GAMES, games);
    return newGame;
  },
  
  update: (id: string, updates: Partial<Game>): Game | null => {
    const games = gamesApi.getAll();
    const index = games.findIndex(g => g.id === id);
    if (index === -1) return null;
    
    games[index] = {
      ...games[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.GAMES, games);
    return games[index];
  },
  
  delete: (id: string): boolean => {
    const games = gamesApi.getAll();
    const filtered = games.filter(g => g.id !== id);
    saveToStorage(STORAGE_KEYS.GAMES, filtered);
    return true;
  }
};

// ===== AUTH (Simple role-based) =====

interface User {
  userId: string;
  role: 'admin' | 'player';
}

export const authApi = {
  getCurrentUser: (): User | null => {
    return getFromStorage<User>(STORAGE_KEYS.CURRENT_USER);
  },
  
  login: (userId: string, role: 'admin' | 'player' = 'player'): User => {
    const user: User = { userId, role };
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },
  
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
  
  isAdmin: (): boolean => {
    const user = authApi.getCurrentUser();
    return user !== null && user.role === 'admin';
  }
};

// ===== UTILITY =====

export const utilApi = {
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
  
  exportData: (): Record<string, any> => {
    const data: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = getFromStorage(key);
    });
    return data;
  },
  
  importData: (data: Record<string, any>): void => {
    Object.entries(data).forEach(([name, value]) => {
      const key = STORAGE_KEYS[name as keyof typeof STORAGE_KEYS];
      if (key && value) {
        saveToStorage(key, value);
      }
    });
  }
};
