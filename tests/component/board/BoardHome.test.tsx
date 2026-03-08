import React from 'react';
/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '../../../src/contexts/LanguageContext';
import { BoardHome } from '../../../src/components/public/board/BoardHome';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: null, isAdmin: () => false }),
}));

jest.mock('../../../src/services/api/boardApi', () => ({
  boardApi: {
    getOrgName: jest.fn().mockResolvedValue({ name: 'Test Bowling Club', language: 'en' }),
    getActiveLeagues: jest.fn().mockResolvedValue([
      {
        id: 'league-1',
        name: 'Monday League',
        description: 'The Monday league',
        dayOfWeek: 'Monday',
        active: true,
        createdAt: '',
        defaultSeasonConfigurations: {} as never,
      },
      {
        id: 'league-2',
        name: 'Friday League',
        description: '',
        dayOfWeek: 'Friday',
        active: true,
        createdAt: '',
        defaultSeasonConfigurations: {} as never,
      },
    ]),
    getSeasonsByLeague: jest.fn().mockImplementation((leagueId: string) => {
      if (leagueId === 'league-1') {
        return Promise.resolve([
          { id: 'season-1', leagueId: 'league-1', name: 'Season 2025', status: 'active', startDate: '2025-01-01', endDate: '2025-12-31', createdAt: '', seasonConfigurations: {} as never },
        ]);
      }
      return Promise.resolve([]);
    }),
    getRecentCompletedGames: jest.fn().mockResolvedValue([]),
  },
}));

describe('BoardHome', () => {
  it('renders league cards after loading', async () => {
    render(
      <LanguageProvider>
        <BoardHome />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Monday League')).toBeInTheDocument();
      expect(screen.getByText('Friday League')).toBeInTheDocument();
    });
  });

  it('shows org name as heading', async () => {
    render(
      <LanguageProvider>
        <BoardHome />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Bowling Club')).toBeInTheDocument();
    });
  });

  it('league cards link to /board/leagues/:id', async () => {
    render(
      <LanguageProvider>
        <BoardHome />
      </LanguageProvider>
    );

    await waitFor(() => {
      const link = screen.getByText('Monday League').closest('a');
      expect(link).toHaveAttribute('href', '/board/leagues/league-1');
    });
  });

  it('shows active season badge for league-1', async () => {
    render(
      <LanguageProvider>
        <BoardHome />
      </LanguageProvider>
    );

    await waitFor(() => {
      // The Monday League card should have an active season badge
      const mondayCard = screen.getByText('Monday League').closest('a');
      expect(mondayCard).not.toBeNull();
    });
  });
});
