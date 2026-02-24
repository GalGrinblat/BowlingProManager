import React from 'react';
/// <reference types="jest" />
import { render } from '@testing-library/react';
import { LanguageProvider } from '../../../src/contexts/LanguageContext';
import { AdminDashboard } from '../../../src/components/admin/AdminDashboard';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../../../src/contexts/AdminDataContext', () => ({
  useAdminData: () => ({
    org: null,
    leagues: [],
    seasonsMap: {},
    gamesMap: {},
    isLoadingData: false,
    loadDashboardData: jest.fn(),
    loadPlayers: jest.fn(),
    players: [],
    isLoadingPlayers: false,
  }),
}));

describe('AdminDashboard', () => {
  it('renders league overview section', () => {
    render(
      <LanguageProvider>
        <AdminDashboard />
      </LanguageProvider>
    );
    // TODO: Add assertions for league overview
  });
});
