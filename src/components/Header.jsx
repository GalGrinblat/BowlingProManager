import React from 'react';
import { Trophy } from './Icons';

export function Header() {
  return (
    <div className="text-center mb-8 animate-slide-in">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Trophy className="text-orange-600" size={40} strokeWidth={2.5} />
        <h1 className="bowling-title text-5xl md:text-6xl text-gray-900">
          BOWLING LEAGUE
        </h1>
        <Trophy className="text-orange-600" size={40} strokeWidth={2.5} />
      </div>
      <p className="text-gray-600 font-semibold text-lg">3-Match Game Tracker</p>
    </div>
  );
}
