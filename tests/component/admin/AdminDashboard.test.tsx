/// <reference types="jest" />
import { render } from '@testing-library/react';
import { AdminDashboard } from '../../../src/components/admin/AdminDashboard';

describe('AdminDashboard', () => {
  it('renders league overview section', () => {
    render(<AdminDashboard onNavigate={() => {}} org={null} leagues={[]} seasonsMap={{}} gamesMap={{}} isLoadingData={false} onRefreshData={async () => {}} />);
    // TODO: Add assertions for league overview
  });
});
