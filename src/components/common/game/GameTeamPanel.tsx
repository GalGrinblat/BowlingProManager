import React from 'react';
import type { GamePlayer } from '../../../types/index';

interface PlayerRowProps {
  player: GamePlayer;
  idx: number;
  team: 'team1' | 'team2';
  lineupStrategy?: string;
  toggleAbsent: (team: 'team1' | 'team2', playerId: string) => void;
  movePlayer: (team: 'team1' | 'team2', idx: number, direction: 'up' | 'down') => void;
  t: (key: string) => string;
  totalPlayers: number;
}

const PlayerRow: React.FC<PlayerRowProps> = ({
  player,
  idx,
  team,
  lineupStrategy,
  toggleAbsent,
  movePlayer,
  t,
  totalPlayers
}) => (
  <div
    className={`p-4 rounded-lg border-2 transition-[background-color,border-color] ${
      player.absent ? 'bg-red-900/20 border-red-500' : 'bg-gray-700 border-gray-600'
    } ${lineupStrategy === 'flexible' ? 'cursor-move' : ''}`}
    draggable={lineupStrategy === 'flexible'}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">
            {player.rank}. {player.name}
          </span>
          {player.absent && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
              {t('games.absent').toUpperCase()}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {t('common.average')}: <span className="text-white font-medium">{typeof player.average === 'number' ? player.average.toFixed(1) : player.average}</span>
          {' • '}
          {t('common.handicap')}: <span className="text-white font-medium">{player.handicap}</span>
        </div>
        {player.absent && (
          <div className="text-xs text-red-400 mt-1">
            {t('games.willUse')}: {Math.round(player.average) - 10} {t('games.pinsPerGame')}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end ml-2">
        <div className="flex flex-row items-center gap-2">
          <button
            onClick={() => toggleAbsent(team, player.playerId)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              player.absent ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {player.absent ? t('games.markPresent') : t('games.markAbsent')}
          </button>
          {lineupStrategy === 'flexible' && (
            <>
              <button
                className="bg-gray-600 hover:bg-blue-500 text-white rounded p-1 disabled:opacity-40"
                onClick={() => movePlayer(team, idx, 'up')}
                disabled={idx === 0}
                title="Move Up"
              >
                ▲
              </button>
              <button
                className="bg-gray-600 hover:bg-blue-500 text-white rounded p-1 disabled:opacity-40"
                onClick={() => movePlayer(team, idx, 'down')}
                disabled={idx === totalPlayers - 1}
                title="Move Down"
              >
                ▼
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

interface GameTeamPanelProps {
  teamName: string;
  teamColor: string;
  players: GamePlayer[];
  team: 'team1' | 'team2';
  lineupStrategy?: string;
  toggleAbsent: (team: 'team1' | 'team2', playerId: string) => void;
  movePlayer: (team: 'team1' | 'team2', idx: number, direction: 'up' | 'down') => void;
  t: (key: string) => string;
}

export const GameTeamPanel: React.FC<GameTeamPanelProps> = ({
  teamName,
  teamColor,
  players,
  team,
  lineupStrategy,
  toggleAbsent,
  movePlayer,
  t
}) => (
  <div className="bg-gray-800 rounded-lg p-6">
    <h2 className={`text-2xl font-bold mb-4 ${teamColor}`}>{teamName}</h2>
    <div className="space-y-3">
      {players.map((player, idx) => (
        <PlayerRow
          key={player.playerId}
          player={player}
          idx={idx}
          team={team}
          lineupStrategy={lineupStrategy}
          toggleAbsent={toggleAbsent}
          movePlayer={movePlayer}
          t={t}
          totalPlayers={players.length}
        />
      ))}
    </div>
  </div>
);
