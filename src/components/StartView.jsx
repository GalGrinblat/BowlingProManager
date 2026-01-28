import React from 'react';
import { Trophy, Plus } from './Icons';

export function StartView({ onStartGame }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8 pin-pattern animate-slide-in">
      <h2 className="bowling-title text-3xl text-gray-900 mb-6 flex items-center gap-2">
        <Plus size={28} />
        START NEW GAME
      </h2>
      
      <button
        onClick={onStartGame}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-6 rounded-lg font-bold text-xl uppercase tracking-wide hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
      >
        Create New Game
      </button>
    </div>
  );
}
