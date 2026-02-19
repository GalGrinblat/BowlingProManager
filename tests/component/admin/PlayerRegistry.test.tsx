jest.mock('../../../src/lib/supabase', () => ({
  supabase: { auth: { onAuthStateChange: jest.fn(), getUser: jest.fn() } }
}));
import { render, screen } from '@testing-library/react';
import { PlayerRegistry } from '../../../src/components/admin/players/PlayerRegistry';
import { LanguageProvider } from '../../../src/contexts/LanguageContext';

describe('PlayerRegistry', () => {
  it('renders player list', () => {
    render(
      <LanguageProvider>
        <PlayerRegistry
          onBack={jest.fn()}
          players={[]}
          isLoadingPlayers={false}
          onRefreshPlayers={jest.fn()}
        />
      </LanguageProvider>
    );
    // TODO: Add assertions for player list
  });
});
