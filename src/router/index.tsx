import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminDataProvider } from '../contexts/AdminDataContext';
import { Header } from '../components/common/Header';
import { LoginView } from '../components/common/LoginView';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { PlayerRegistry } from '../components/admin/players';
import { LeagueManagement, LeagueDetail } from '../components/admin/league';
import { SeasonCreator, SeasonDetail, TeamManagement } from '../components/admin/season';
import { SeasonGame } from '../components/admin/game';
import { Settings } from '../components/admin/Settings';
import { UserManagement } from '../components/admin/UserManagement';
import { PlayerDashboard } from '../components/player/PlayerDashboard';
import { CompletedGameView } from '../components/common/CompletedGameView';

const RootLayout = () => {
  const { currentUser, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Header currentUser={currentUser} onLogout={logout} />
        <Outlet />
      </div>
    </div>
  );
};

const RequireAdmin = () => {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/player" replace />;
  return <AdminDataProvider><Outlet /></AdminDataProvider>;
};

const RequirePlayer = () => {
  const { currentUser, isPlayer } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isPlayer()) return <Navigate to="/admin" replace />;
  return <Outlet />;
};

const RootRedirect = () => {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin() ? '/admin' : '/player'} replace />;
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <RootRedirect /> },
      { path: '/login', element: <LoginView /> },
      {
        element: <RequireAdmin />,
        children: [
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/players', element: <PlayerRegistry /> },
          { path: '/admin/leagues', element: <LeagueManagement /> },
          { path: '/admin/leagues/:leagueId', element: <LeagueDetail /> },
          { path: '/admin/leagues/:leagueId/seasons/new', element: <SeasonCreator /> },
          { path: '/admin/seasons/:seasonId', element: <SeasonDetail /> },
          { path: '/admin/seasons/:seasonId/teams', element: <TeamManagement /> },
          { path: '/admin/games/:gameId/play', element: <SeasonGame /> },
          { path: '/admin/games/:gameId', element: <CompletedGameView /> },
          { path: '/admin/settings', element: <Settings /> },
          { path: '/admin/users', element: <UserManagement /> },
        ],
      },
      {
        element: <RequirePlayer />,
        children: [
          { path: '/player', element: <PlayerDashboard /> },
          { path: '/player/games/:gameId/play', element: <SeasonGame /> },
          { path: '/player/games/:gameId', element: <CompletedGameView /> },
        ],
      },
      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
]);
