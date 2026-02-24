import React from 'react';

// Deep mock for supabase and import.meta.env
jest.mock('../../../src/lib/supabase', () => {
  // Minimal supabase mock for .from().select().order() chain
  const mockSelect = jest.fn(() => ({ order: jest.fn(() => ({
    // getAll returns [] for leagues
    then: jest.fn(),
  })) }));
  const mockFrom = jest.fn(() => ({ select: mockSelect, order: jest.fn(() => ({ then: jest.fn() })) }));
  return {
    supabase: {
      from: mockFrom,
      // Add any other methods as needed
    },
  };
});

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../../../src/contexts/AdminDataContext', () => ({
  useAdminData: () => ({
    loadDashboardData: jest.fn(),
    players: [],
    isLoadingPlayers: false,
    loadPlayers: jest.fn(),
    org: null,
    leagues: [],
    seasonsMap: {},
    gamesMap: {},
    isLoadingData: false,
  }),
}));

// Mock import.meta.env for VITE_SUPABASE_URL/ANON_KEY
Object.defineProperty(global, 'import', {
  value: { meta: { env: { VITE_SUPABASE_URL: 'test', VITE_SUPABASE_ANON_KEY: 'test' } } },
  configurable: true,
});

// Mock window.localStorage for supabase client
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  configurable: true,
});

import { LanguageProvider } from '../../../src/contexts/LanguageContext';
import { render } from '@testing-library/react';
import { LeagueManagement } from '../../../src/components/admin/league/LeagueManagement';

describe('LeagueManagement', () => {
  beforeAll(() => {
    // Suppress console.error for act() warnings
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it('renders league management form', () => {
    render(
      <LanguageProvider>
        <LeagueManagement />
      </LanguageProvider>
    );
    // TODO: Add assertions for league management form
  });
});
