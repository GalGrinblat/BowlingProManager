jest.mock('../../../src/lib/supabase', () => ({
  supabase: { auth: { onAuthStateChange: jest.fn(), getUser: jest.fn() } }
}));
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
