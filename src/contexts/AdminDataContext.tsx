import React, { createContext, useContext, useState, ReactNode } from 'react';
import { organizationApi, leaguesApi, seasonsApi, gamesApi, playersApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { logger } from '../utils/logger';
import type { Organization, League, Season, Game, Player } from '../types';

interface AdminDataContextType {
  org: Organization | null;
  leagues: League[];
  seasonsMap: Record<string, Season[]>;
  gamesMap: Record<string, Game[]>;
  isLoadingData: boolean;
  players: Player[];
  isLoadingPlayers: boolean;
  loadDashboardData: () => Promise<void>;
  loadPlayers: () => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | null>(null);

export const useAdminData = (): AdminDataContextType => {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within AdminDataProvider');
  return context;
};

export const AdminDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [org, setOrg] = useState<Organization | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasonsMap, setSeasonsMap] = useState<Record<string, Season[]>>({});
  const [gamesMap, setGamesMap] = useState<Record<string, Game[]>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  const isAdminUser = !authLoading && currentUser && isAdmin();

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const [orgData, leaguesData] = await Promise.all([
        organizationApi.get(),
        leaguesApi.getAll()
      ]);
      setOrg(orgData);
      setLeagues(leaguesData);

      const seasonsResults = await Promise.all(
        leaguesData.map(league => seasonsApi.getByLeague(league.id))
      );
      const seasonsData: Record<string, Season[]> = {};
      leaguesData.forEach((league, i) => { seasonsData[league.id] = seasonsResults[i] ?? []; });

      const allSeasons = seasonsResults.flat();
      const gamesResults = await Promise.all(
        allSeasons.map(season => gamesApi.getBySeason(season.id))
      );
      const allGamesData: Record<string, Game[]> = {};
      allSeasons.forEach((season, i) => { allGamesData[season.id] = gamesResults[i] ?? []; });

      setSeasonsMap(seasonsData);
      setGamesMap(allGamesData);
    } catch (error) {
      logger.error('Error loading dashboard data:', error);
      showToast('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadPlayers = async () => {
    setIsLoadingPlayers(true);
    try {
      const playersData = await playersApi.getAll();
      setPlayers(playersData);
    } catch (error) {
      logger.error('Error loading players:', error);
      showToast('Failed to load players. Please refresh the page.');
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  React.useEffect(() => {
    if (isAdminUser) {
      loadDashboardData();
      loadPlayers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminUser]);

  return (
    <AdminDataContext.Provider value={{
      org, leagues, seasonsMap, gamesMap, isLoadingData,
      players, isLoadingPlayers,
      loadDashboardData, loadPlayers,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};
