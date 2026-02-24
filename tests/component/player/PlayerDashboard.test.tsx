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
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    playerData: { id: 'test-player-id', firstName: 'Test', lastName: 'Player', active: true },
    currentUser: null,
    isAdmin: () => false,
    isPlayer: () => true,
    logout: jest.fn(),
  }),
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  jest.restoreAllMocks();
});
import { render, screen } from '@testing-library/react';
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
});
