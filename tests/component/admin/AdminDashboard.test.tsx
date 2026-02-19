import { LanguageProvider } from '../../../src/contexts/LanguageContext';
/// <reference types="jest" />
import { render } from '@testing-library/react';
import { AdminDashboard } from '../../../src/components/admin/AdminDashboard';

describe('AdminDashboard', () => {
  it('renders league overview section', () => {
    render(
      <LanguageProvider>
        <AdminDashboard onNavigate={() => {}} org={null} leagues={[]} seasonsMap={{}} gamesMap={{}} isLoadingData={false} onRefreshData={async () => {}} />
      </LanguageProvider>
    );
    // TODO: Add assertions for league overview
  });
});
