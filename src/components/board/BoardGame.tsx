import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { boardApi } from '../../services/api/boardApi';
import { useTranslation } from '../../contexts/LanguageContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import { GameScoreTable } from '../common/GameScoreTable';
import type { Game, GameMatch } from '../../types/index';

export const BoardGame: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const { t, direction, isRTL } = useTranslation();
  const { formatDate } = useDateFormat();
  const [game, setGame] = useState<Game | undefined>(location.state?.game);

  useEffect(() => {
    if (!game && gameId) {
      boardApi.getGameById(gameId).then(data => {
        if (data) setGame(data);
      });
    }
  }, [gameId, game]);

  if (!game) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const matches = game.matches ?? [];
  const team1TotalPoints = matches.reduce((sum: number, m: GameMatch) => sum + (m.team1?.points || 0), 0) + (game.grandTotalPoints?.team1 || 0);
  const team2TotalPoints = matches.reduce((sum: number, m: GameMatch) => sum + (m.team2?.points || 0), 0) + (game.grandTotalPoints?.team2 || 0);
  const winner = team1TotalPoints > team2TotalPoints ? 'team1' :
                 team2TotalPoints > team1TotalPoints ? 'team2' : 'tie';

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('gameHistory.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('common.round')} {game.round} · {t('common.matchDay')} {game.matchDay}
              {game.completedAt && ` · ${t('playerDashboard.completedOn')} ${formatDate(game.completedAt)}`}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isRTL ? t('common.rightArrow') : t('common.leftArrow')} {t('common.back')}
          </button>
        </div>
      </div>

      {/* Winner Banner */}
      {winner !== 'tie' && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-4">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">
              🏆 {t('gameHistory.championBanner')} {winner === 'team1' ? game.team1?.name : game.team2?.name} 🏆
            </span>
          </div>
        </div>
      )}

      {/* Game Summary Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3">
          <div className="flex items-center justify-center gap-3 text-white font-bold text-lg">
            <span className="text-orange-300">{game.team1?.name}</span>
            <span>{team1TotalPoints} 🆚 {team2TotalPoints}</span>
            <span className="text-blue-300">{game.team2?.name}</span>
          </div>
        </div>
        <GameScoreTable game={game} />
      </div>
    </div>
  );
};
