import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

const ScoreLayout = () => (
  <div className="min-h-screen bg-gray-900 text-white">
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500" />
      </div>
    }>
      <Outlet />
    </Suspense>
  </div>
);

export default ScoreLayout;
