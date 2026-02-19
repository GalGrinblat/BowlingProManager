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
        <PlayerDashboard playerId={"test-player-id"} onNavigate={() => {}} />
      </LanguageProvider>
    );
    // TODO: Add assertions for player dashboard
  });
});
