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
        <button
          onClick={onBack}
          className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-lg font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <span>{isRTL ? t('common.rightArrow') : t('common.leftArrow')}</span> {t('common.back')}
        </button>
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl font-bold text-gray-800">{t('gameHistory.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('common.round')} {game.round} • {t('common.matchDay')} {game.matchDay} • {t('playerDashboard.completedOn')} {formatDate(game.completedAt ?? '')}
            </p>
          </div>
          {winner !== 'tie' && (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-lg">
              🏆 {winner === 'team1' ? game.team1?.name : game.team2?.name} {t('gameHistory.wins')}!
            </span>
          )}
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
          <h2 className={`text-lg font-bold text-white text-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isRTL ? (
              <>{game.team2?.name} {team2TotalPoints} 🆚 {team1TotalPoints} {game.team1?.name}</>
            ) : (
              <>{game.team1?.name} {team1TotalPoints} 🆚 {team2TotalPoints} {game.team2?.name}</>
            )}
          </h2>
        </div>

        <GameScoreTable game={game} />
      </div>
    </div>
  );
};
