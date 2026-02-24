import React from 'react';
jest.mock('../../../src/lib/supabase', () => ({
  supabase: { auth: { onAuthStateChange: jest.fn(), getUser: jest.fn() } }
}));
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock('../../../src/contexts/AdminDataContext', () => ({
  useAdminData: () => ({
    players: [],
    isLoadingPlayers: false,
    loadPlayers: jest.fn(),
    loadDashboardData: jest.fn(),
    org: null,
    leagues: [],
    seasonsMap: {},
    gamesMap: {},
    isLoadingData: false,
  }),
}));
import { render, screen } from '@testing-library/react';
import { PlayerRegistry } from '../../../src/components/admin/players/PlayerRegistry';
import { LanguageProvider } from '../../../src/contexts/LanguageContext';

describe('PlayerRegistry', () => {
  it('renders player list', () => {
    render(
      <LanguageProvider>
        <PlayerRegistry />
      </LanguageProvider>
    );
    // TODO: Add assertions for player list
  });
});
