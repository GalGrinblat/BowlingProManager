import { LanguageProvider } from '../../../src/contexts/LanguageContext';
/// <reference types="jest" />
import { render } from '@testing-library/react';
import { LeagueManagement } from '../../../src/components/admin/league/LeagueManagement';

describe('LeagueManagement', () => {
  it('renders league management form', () => {
    render(
      <LanguageProvider>
        <LeagueManagement onBack={() => {}} onViewLeague={() => {}} />
      </LanguageProvider>
    );
    // TODO: Add assertions for league management form
  });
});
