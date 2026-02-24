import { useTranslation } from '../../contexts/LanguageContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import { GameScoreTable } from './GameScoreTable';
import type { CompletedGameViewProps, GameMatch } from '../../types/index';

export const CompletedGameView: React.FC<CompletedGameViewProps> = ({ game, onBack }) => {
  const { t, direction, isRTL } = useTranslation();
  const { formatDate } = useDateFormat();
  if (!game) return <div>{t('common.loading')}</div>;

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
              {t('common.round')} {game.round} • {t('common.matchDay')} {game.matchDay} • {t('playerDashboard.completedOn')} {formatDate(game.completedAt ?? '')}
            </p>
          </div>
          <button
            onClick={onBack}
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
