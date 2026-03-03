import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminDataProvider } from '../contexts/AdminDataContext';
import { Header } from '../components/common/Header';
import { LoginView } from '../components/common/LoginView';
import { BoardHeader } from '../components/board/BoardHeader';

const AdminDashboard    = lazy(() => import('../components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const PlayerRegistry    = lazy(() => import('../components/admin/players').then(m => ({ default: m.PlayerRegistry })));
const LeagueManagement  = lazy(() => import('../components/admin/league').then(m => ({ default: m.LeagueManagement })));
const LeagueDetail      = lazy(() => import('../components/admin/league').then(m => ({ default: m.LeagueDetail })));
const SeasonCreator     = lazy(() => import('../components/admin/season').then(m => ({ default: m.SeasonCreator })));
const SeasonDetail      = lazy(() => import('../components/admin/season').then(m => ({ default: m.SeasonDetail })));
const TeamManagement    = lazy(() => import('../components/admin/season').then(m => ({ default: m.TeamManagement })));
const SeasonGame        = lazy(() => import('../components/admin/game').then(m => ({ default: m.SeasonGame })));
const Settings          = lazy(() => import('../components/admin/Settings').then(m => ({ default: m.Settings })));
const UserManagement    = lazy(() => import('../components/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const PlayerDashboard   = lazy(() => import('../components/player/PlayerDashboard').then(m => ({ default: m.PlayerDashboard })));
const CompletedGameView = lazy(() => import('../components/common/CompletedGameView').then(m => ({ default: m.CompletedGameView })));
const BoardHome   = lazy(() => import('../components/board/BoardHome').then(m => ({ default: m.BoardHome })));
const BoardLeague = lazy(() => import('../components/board/BoardLeague').then(m => ({ default: m.BoardLeague })));
const BoardSeason = lazy(() => import('../components/board/BoardSeason').then(m => ({ default: m.BoardSeason })));
const BoardGame   = lazy(() => import('../components/board/BoardGame').then(m => ({ default: m.BoardGame })));
const PlayerScoreEntry = lazy(() => import('../components/score').then(m => ({ default: m.PlayerScoreEntry })));

const BoardLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
    <div className="max-w-6xl mx-auto">
      <BoardHeader />
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      }>
        <Outlet />
      </Suspense>
    </div>
  </div>
);

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
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        }>
          <Outlet />
        </Suspense>
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
  // Board routes sit outside RootLayout so they get only BoardHeader, not the admin Header
  {
    element: <BoardLayout />,
    children: [
      { path: '/board', element: <BoardHome /> },
      { path: '/board/leagues/:leagueId', element: <BoardLeague /> },
      { path: '/board/seasons/:seasonId', element: <BoardSeason /> },
      { path: '/board/games/:gameId', element: <BoardGame /> },
    ],
  },
  // Public score entry — no layout wrapper, no auth required
  {
    path: '/score/:gameId',
    element: (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
        </div>
      }>
        <PlayerScoreEntry />
      </Suspense>
    ),
  },
]);
