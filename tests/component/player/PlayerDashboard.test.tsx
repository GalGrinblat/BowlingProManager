import React from 'react';
jest.mock('../../../src/lib/supabase', () => ({
  supabase: {
    auth: { onAuthStateChange: jest.fn(), getUser: jest.fn() },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          order: jest.fn(() => ({
            eq: jest.fn(() => ({ single: jest.fn(() => ({ data: null, error: null })) })),
            single: jest.fn(() => ({ data: null, error: null })),
          })),
        })),
        eq: jest.fn(() => ({ single: jest.fn(() => ({ data: null, error: null })) })),
        single: jest.fn(() => ({ data: null, error: null })),
      })),
    })),
  },
}));

const mockSetSearchParams = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    playerData: { id: 'test-player-id', firstName: 'Test', lastName: 'Player', active: true },
    currentUser: null,
    isAdmin: () => false,
    isPlayer: () => true,
    logout: jest.fn(),
    session: null,
    isLoading: false,
  }),
}));

jest.mock('../../../src/services/api/players', () => ({
  playersApi: {
    getById: jest.fn().mockResolvedValue({ id: 'test-player-id', firstName: 'Test', lastName: 'Player', active: true }),
  },
}));
jest.mock('../../../src/services/api/leagues', () => ({
  leaguesApi: { getById: jest.fn().mockResolvedValue(null) },
}));
jest.mock('../../../src/services/api/seasons', () => ({
  seasonsApi: { getById: jest.fn().mockResolvedValue(null) },
}));
jest.mock('../../../src/services/api/teams', () => ({
  teamsApi: { getAll: jest.fn().mockResolvedValue([]) },
}));
jest.mock('../../../src/services/api/games', () => ({
  gamesApi: { getAll: jest.fn().mockResolvedValue([]) },
}));
jest.mock('../../../src/utils/statsUtils', () => ({
  calculatePlayerStats: jest.fn().mockReturnValue(null),
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  mockSearchParams = new URLSearchParams();
  mockSetSearchParams.mockClear();
});
afterAll(() => {
  jest.restoreAllMocks();
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerDashboard } from '../../../src/components/player/PlayerDashboard';
import { LanguageProvider } from '../../../src/contexts/LanguageContext';

describe('PlayerDashboard', () => {
  it('renders player dashboard', () => {
    render(
      <LanguageProvider>
        <PlayerDashboard />
      </LanguageProvider>
    );
    // TODO: Add assertions for player dashboard
  });

  it('shows Dashboard tab as active by default (no ?view param)', async () => {
    mockSearchParams = new URLSearchParams();
    render(
      <LanguageProvider>
        <PlayerDashboard />
      </LanguageProvider>
    );
    await waitFor(() => {
      const dashboardTab = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardTab.className).toContain('bg-purple-600');
    });
  });

  it('shows Stats tab as active when ?view=stats', async () => {
    mockSearchParams = new URLSearchParams('view=stats');
    render(
      <LanguageProvider>
        <PlayerDashboard />
      </LanguageProvider>
    );
    await waitFor(() => {
      const statsTab = screen.getByRole('button', { name: /stats/i });
      expect(statsTab.className).toContain('bg-purple-600');
    });
  });

  it('calls setSearchParams with view=stats when Stats tab is clicked', async () => {
    mockSearchParams = new URLSearchParams();
    render(
      <LanguageProvider>
        <PlayerDashboard />
      </LanguageProvider>
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stats/i })).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /stats/i }));
    expect(mockSetSearchParams).toHaveBeenCalledWith({ view: 'stats' });
  });

  it('calls setSearchParams with view=dashboard when Dashboard tab is clicked', async () => {
    mockSearchParams = new URLSearchParams('view=stats');
    render(
      <LanguageProvider>
        <PlayerDashboard />
      </LanguageProvider>
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /dashboard/i }));
    expect(mockSetSearchParams).toHaveBeenCalledWith({ view: 'dashboard' });
  });
});
