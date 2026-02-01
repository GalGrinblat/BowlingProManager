/**
 * API Service Layer - Abstraction over localStorage
 * This allows easy migration to backend database later
 */

const STORAGE_KEYS = {
  ORGANIZATION: 'bowling_organization',
  PLAYERS: 'bowling_players',
  LEAGUES: 'bowling_leagues',
  SEASONS: 'bowling_seasons',
  TEAMS: 'bowling_teams',
  GAMES: 'bowling_games',
  CURRENT_USER: 'bowling_current_user'
};

// ===== HELPER FUNCTIONS =====

const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    return false;
  }
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ===== ORGANIZATION =====

export const organizationApi = {
  get: () => {
    const org = getFromStorage(STORAGE_KEYS.ORGANIZATION);
    if (!org) {
      // Create default organization
      const defaultOrg = {
        id: generateId(),
        name: 'My Bowling Organization',
        createdAt: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.ORGANIZATION, defaultOrg);
      return defaultOrg;
    }
    return org;
  },
  
  update: (data) => {
    const org = organizationApi.get();
    const updated = { ...org, ...data, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.ORGANIZATION, updated);
    return updated;
  }
};

// ===== PLAYERS =====

export const playersApi = {
  getAll: () => {
    return getFromStorage(STORAGE_KEYS.PLAYERS) || [];
  },
  
  getById: (id) => {
    const players = playersApi.getAll();
    return players.find(p => p.id === id);
  },
  
  create: (playerData) => {
    const players = playersApi.getAll();
    const newPlayer = {
      id: generateId(),
      ...playerData,
      createdAt: new Date().toISOString(),
      active: true
    };
    players.push(newPlayer);
    saveToStorage(STORAGE_KEYS.PLAYERS, players);
    return newPlayer;
  },
  
  update: (id, updates) => {
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
  
  delete: (id) => {
    const players = playersApi.getAll();
    const filtered = players.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PLAYERS, filtered);
    return true;
  }
};

// ===== LEAGUES =====

export const leaguesApi = {
  getAll: () => {
    return getFromStorage(STORAGE_KEYS.LEAGUES) || [];
  },
  
  getById: (id) => {
    const leagues = leaguesApi.getAll();
    return leagues.find(l => l.id === id);
  },
  
  create: (leagueData) => {
    const leagues = leaguesApi.getAll();
    const newLeague = {
      id: generateId(),
      ...leagueData,
      createdAt: new Date().toISOString(),
      active: true
    };
    leagues.push(newLeague);
    saveToStorage(STORAGE_KEYS.LEAGUES, leagues);
    return newLeague;
  },
  
  update: (id, updates) => {
    const leagues = leaguesApi.getAll();
    const index = leagues.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    leagues[index] = {
      ...leagues[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.LEAGUES, leagues);
    return leagues[index];
  },
  
  delete: (id) => {
    const leagues = leaguesApi.getAll();
    const filtered = leagues.filter(l => l.id !== id);
    saveToStorage(STORAGE_KEYS.LEAGUES, filtered);
    return true;
  },
  
  // Get seasons for a league
  getSeasons: (leagueId) => {
    const seasons = seasonsApi.getAll();
    return seasons.filter(s => s.leagueId === leagueId);
  }
};

// ===== SEASONS =====

export const seasonsApi = {
  getAll: () => {
    return getFromStorage(STORAGE_KEYS.SEASONS) || [];
  },
  
  getById: (id) => {
    const seasons = seasonsApi.getAll();
    return seasons.find(s => s.id === id);
  },
  
  getByLeague: (leagueId) => {
    const seasons = seasonsApi.getAll();
    return seasons.filter(s => s.leagueId === leagueId);
  },
  
  create: (seasonData) => {
    const seasons = seasonsApi.getAll();
    const newSeason = {
      id: generateId(),
      status: 'setup', // setup, active, completed
      ...seasonData,
      createdAt: new Date().toISOString()
    };
    seasons.push(newSeason);
    saveToStorage(STORAGE_KEYS.SEASONS, seasons);
    return newSeason;
  },
  
  update: (id, updates) => {
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
  
  delete: (id) => {
    const seasons = seasonsApi.getAll();
    const filtered = seasons.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.SEASONS, filtered);
    return true;
  }
};

// ===== TEAMS =====

export const teamsApi = {
  getAll: () => {
    return getFromStorage(STORAGE_KEYS.TEAMS) || [];
  },
  
  getById: (id) => {
    const teams = teamsApi.getAll();
    return teams.find(t => t.id === id);
  },
  
  getBySeason: (seasonId) => {
    const teams = teamsApi.getAll();
    return teams.filter(t => t.seasonId === seasonId);
  },
  
  create: (teamData) => {
    const teams = teamsApi.getAll();
    const newTeam = {
      id: generateId(),
      ...teamData,
      createdAt: new Date().toISOString()
    };
    teams.push(newTeam);
    saveToStorage(STORAGE_KEYS.TEAMS, teams);
    return newTeam;
  },
  
  update: (id, updates) => {
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
  
  delete: (id) => {
    const teams = teamsApi.getAll();
    const filtered = teams.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TEAMS, filtered);
    return true;
  }
};

// ===== GAMES =====

export const gamesApi = {
  getAll: () => {
    return getFromStorage(STORAGE_KEYS.GAMES) || [];
  },
  
  getById: (id) => {
    const games = gamesApi.getAll();
    return games.find(g => g.id === id);
  },
  
  getBySeason: (seasonId) => {
    const games = gamesApi.getAll();
    return games.filter(g => g.seasonId === seasonId);
  },
  
  getByRound: (seasonId, round) => {
    const games = gamesApi.getAll();
    return games.filter(g => g.seasonId === seasonId && g.round === round);
  },
  
  create: (gameData) => {
    const games = gamesApi.getAll();
    const newGame = {
      id: generateId(),
      status: 'pending', // pending, in-progress, completed
      ...gameData,
      createdAt: new Date().toISOString()
    };
    games.push(newGame);
    saveToStorage(STORAGE_KEYS.GAMES, games);
    return newGame;
  },
  
  update: (id, updates) => {
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
  
  delete: (id) => {
    const games = gamesApi.getAll();
    const filtered = games.filter(g => g.id !== id);
    saveToStorage(STORAGE_KEYS.GAMES, filtered);
    return true;
  }
};

// ===== AUTH (Simple role-based) =====

export const authApi = {
  getCurrentUser: () => {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER);
  },
  
  login: (userId, role = 'player') => {
    const user = { userId, role }; // role: 'admin' or 'player'
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
  
  isAdmin: () => {
    const user = authApi.getCurrentUser();
    return user && user.role === 'admin';
  }
};

// ===== UTILITY =====

export const utilApi = {
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
  
  exportData: () => {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = getFromStorage(key);
    });
    return data;
  },
  
  importData: (data) => {
    Object.entries(data).forEach(([name, value]) => {
      const key = STORAGE_KEYS[name];
      if (key && value) {
        saveToStorage(key, value);
      }
    });
  }
};
