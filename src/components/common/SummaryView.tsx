import { ArrowLeft, CheckCircle } from './Icons';
import { TeamStatsCard } from './TeamStatsCard';
import { useTranslation } from '../../contexts/LanguageContext';

import type { GameMatch, SummaryViewProps } from '../../types/index';

export const SummaryView: React.FC<SummaryViewProps> = ({ game, totals, playerStats, onBack, onFinish }) => {
  const { t, direction, isRTL } = useTranslation();

  if (!game || !game.team1 || !game.team2) return null;

  // Calculate last match number for back button
  const lastMatchNumber = Array.isArray(game.matches) ? game.matches.length : 0;

  // Use default team colors (GameTeam doesn't have color property)
  const team1ColorClass = 'text-orange-400';
  const team2ColorClass = 'text-blue-400';

  return (
    <div className="scorecard rounded-xl p-6 md:p-8 mb-8 animate-slide-in" dir={direction}>
      <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="bowling-title text-white text-3xl">{t('summary.gameSummary')}</div>
        <CheckCircle className="text-green-500" size={36} />
      </div>

      {/* Overall Winner */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 p-6 rounded-lg mb-6 text-center">
        <div className="text-lg font-bold uppercase mb-2">{t('summary.gameWinner')}</div>
        {totals.team1Points > totals.team2Points ? (
          <div className="bowling-title text-5xl">{game.team1.name}</div>
        ) : totals.team2Points > totals.team1Points ? (
          <div className="bowling-title text-5xl">{game.team2.name}</div>
        ) : (
          <div className="bowling-title text-5xl">{t('summary.tieGame')}</div>
        )}
        <div className="text-3xl font-bold mt-2">
          {totals.team1Points} - {totals.team2Points}
        </div>
      </div>

      {/* Match-by-Match Breakdown */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className={`bowling-title text-white text-xl mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('summary.matchBreakdown')}
        </div>
        <div className="space-y-2">
          {Array.isArray(game.matches) && game.matches.map((match: GameMatch, idx: number) => (
            <div key={idx} className="bg-gray-700 rounded p-3">
              <div className="grid grid-cols-3 items-center">
                <div className="text-center">
                  <div className={`${team1ColorClass} font-bold text-2xl`}>{match.team1.totalWithHandicap}</div>
                  <div className="text-gray-400 text-xs">({match.team1.totalPins})</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm mb-1">
                    {t('summary.match')} {idx + 1}
                  </div>
                  <div className="text-yellow-400 font-bold text-xl">
                    {match.team1.points} - {match.team2.points}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`${team2ColorClass} font-bold text-2xl`}>{match.team2.totalWithHandicap}</div>
                  <div className="text-gray-400 text-xs">({match.team2.totalPins})</div>
                </div>
              </div>
            </div>
          ))}

          {/* Total Line */}
          <div className="bg-gray-900 rounded p-3 border-2 border-yellow-500">
            <div className="grid grid-cols-3 items-center">
              <div className="text-center">
                <div className={`${team1ColorClass} font-bold text-2xl`}>{totals.team1TotalPinsWithHandicap}</div>
                <div className="text-gray-400 text-xs">({totals.team1TotalPinsNoHandicap})</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-sm mb-1">{t('common.total')}</div>
                <div className="text-yellow-400 font-bold text-2xl">
                  {game.grandTotalPoints
                    ? `${game.grandTotalPoints.team1} - ${game.grandTotalPoints.team2}`
                    : t('common.na')}
                </div>
              </div>
              <div className="text-center">
                <div className={`${team2ColorClass} font-bold text-2xl`}>{totals.team2TotalPinsWithHandicap}</div>
                <div className="text-gray-400 text-xs">({totals.team2TotalPinsNoHandicap})</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Statistics */}
      <div className={`bowling-title text-white text-2xl mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t('summary.gameStatistics')}
      </div>

      {/* Player Statistics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <TeamStatsCard
          teamName={game.team1.name}
          teamColor="orange"
          playerStats={playerStats.team1Stats}
          teamAverage={playerStats.team1Average}
        />

        <TeamStatsCard
          teamName={game.team2.name}
          teamColor="blue"
          playerStats={playerStats.team2Stats}
          teamAverage={playerStats.team2Average}
        />
      </div>

      {/* Navigation */}
      <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'grid-flow-col-dense' : ''}`}>
        <button
          onClick={onBack}
          className={`flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-bold uppercase text-sm hover:bg-gray-600 transition-colors ${isRTL ? 'flex-row-reverse col-start-2' : ''}`}
        >
          <ArrowLeft size={18} />
          {t('summary.backToMatch').replace('{{matchNumber}}', String(lastMatchNumber))}
        </button>

        <button
          onClick={onFinish}
          className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold uppercase text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg ${isRTL ? 'col-start-1' : ''}`}
        >
          {t('summary.saveGame')}
        </button>
      </div>
    </div>
  );
}
