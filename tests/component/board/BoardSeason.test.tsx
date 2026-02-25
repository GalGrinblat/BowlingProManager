import React from 'react';
/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '../../../src/contexts/LanguageContext';
import { BoardSeason } from '../../../src/components/board/BoardSeason';
import type { Season, League, Team, Game } from '../../../src/types/index';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => jest.fn(),
  useParams: () => ({ seasonId: 'season-1' }),
}));

jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: null, isAdmin: () => false }),
}));

jest.mock('../../../src/services/api/boardApi', () => ({
  boardApi: {
    getSeasonById: jest.fn(),
    getLeagueById: jest.fn(),
    getTeamsBySeason: jest.fn(),
    getGamesBySeason: jest.fn(),
  },
}));

// Import after mocking so we can configure return values
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { boardApi } = require('../../../src/services/api/boardApi');

const mockSeasonConfig = {
  numberOfTeams: 4,
  playersPerTeam: 4,
  numberOfRounds: 2,
  matchesPerGame: 3,
  lineupStrategy: 'flexible' as const,
  lineupRule: 'standard' as const,
  playerMatchPointsPerWin: 1,
  teamMatchPointsPerWin: 1,
  teamGamePointsPerWin: 2,
  useHandicap: false,
  handicapBasis: 160,
  handicapPercentage: 100,
  teamAllPresentBonusEnabled: false,
  teamAllPresentBonusPoints: 0,
  bonusRules: [],
};

const mockSeason: Season = {
  id: 'season-1', leagueId: 'league-1', name: 'Spring 2025',
  startDate: '2025-01-01', endDate: '2025-06-30', status: 'active',
  createdAt: '', schedule: [], seasonConfigurations: mockSeasonConfig,
};

const mockLeague: League = {
  id: 'league-1', name: 'Monday League', description: '',
  dayOfWeek: 'Monday', active: true, createdAt: '',
  defaultSeasonConfigurations: mockSeasonConfig,
};

const mockTeams: Team[] = [
  { id: 'team-1', seasonId: 'season-1', name: 'Team Alpha', playerIds: [], rosterChanges: [], createdAt: '' },
  { id: 'team-2', seasonId: 'season-1', name: 'Team Beta', playerIds: [], rosterChanges: [], createdAt: '' },
];

const mockGames: Game[] = [
  {
    id: 'game-1', seasonId: 'season-1', round: 1, matchDay: 1,
    team1Id: 'team-1', team2Id: 'team-2', status: 'pending',
    createdAt: '', postponed: false, matchesPerGame: 3, useHandicap: false,
    lineupStrategy: 'flexible', lineupRule: 'standard',
    playerMatchPointsPerWin: 1, teamMatchPointsPerWin: 1, teamGamePointsPerWin: 2,
    teamAllPresentBonusEnabled: false, teamAllPresentBonusPoints: 0, bonusRules: [],
  },
];

beforeEach(() => {
  boardApi.getSeasonById.mockResolvedValue(mockSeason);
  boardApi.getLeagueById.mockResolvedValue(mockLeague);
  boardApi.getTeamsBySeason.mockResolvedValue(mockTeams);
  boardApi.getGamesBySeason.mockResolvedValue(mockGames);
});

describe('BoardSeason', () => {
  it('renders season name after loading', async () => {
    render(
      <LanguageProvider>
        <BoardSeason />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Spring 2025').length).toBeGreaterThan(0);
    });
  });

  it('renders league name in breadcrumb', async () => {
    render(
      <LanguageProvider>
        <BoardSeason />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Monday League')).toBeInTheDocument();
    });
  });

  it('does not render print or postpone buttons', async () => {
    render(
      <LanguageProvider>
        <BoardSeason />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/print/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/postpone/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/manage teams/i)).not.toBeInTheDocument();
    });
  });

  it('renders team names in the schedule', async () => {
    render(
      <LanguageProvider>
        <BoardSeason />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Team Alpha').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Team Beta').length).toBeGreaterThan(0);
    });
  });
});
