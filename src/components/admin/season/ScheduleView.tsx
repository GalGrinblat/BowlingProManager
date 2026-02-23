import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { useDateFormat } from '../../../hooks/useDateFormat';
import { calculateHeadToHead } from '../../../utils/headToHeadUtils';
import { GameCard } from './GameCard';
import type { Season, Team, Game, ScheduleMatchDay } from '../../../types/index';

interface ScheduleViewProps {
  season: Season;
  teams: Team[];
  games: Game[];
  selectedRound: number;
  selectedMatchDay: number | null;
  onRoundChange: (round: number) => void;
  onMatchDayChange: (matchDay: number | null) => void;
  onShowPrintOptions: () => void;
  onShowPostpone: () => void;
  onPlayGame: (gameId: string) => void;
  onViewGame: (gameId: string, game: Game) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  season, teams, games, selectedRound, selectedMatchDay,
  onRoundChange, onMatchDayChange, onShowPrintOptions, onShowPostpone,
  onPlayGame, onViewGame
}) => {
  const { t } = useTranslation();
  const { formatMatchDate } = useDateFormat();

  const roundGames = games.filter(g => g.round === selectedRound);
  const matchDayGames = selectedMatchDay ? roundGames.filter(g => g.matchDay === selectedMatchDay) : [];
  const matchDaysInRound = Array.from(new Set(roundGames.map(g => g.matchDay))).sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {/* Round Selector */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">{t('seasons.selectRound')}</h3>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: season.seasonConfigurations.numberOfRounds }, (_, i) => i + 1).map(round => {
            const roundGamesForRound = games.filter(g => g.round === round);
            const completedInRound = roundGamesForRound.filter(g => g.status === 'completed').length;

            return (
              <button
                key={round}
                onClick={() => {
                  onRoundChange(round);
                  const matchDays = Array.from(new Set(roundGamesForRound.map(g => g.matchDay))).sort((a, b) => a - b);
                  if (matchDays.length > 0) {
                    const incompleteMatchDay = matchDays.find(md =>
                      roundGamesForRound.filter(g => g.matchDay === md && g.status !== 'completed').length > 0
                    );
                    onMatchDayChange((incompleteMatchDay ?? matchDays[matchDays.length - 1]) ?? null);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedRound === round
                    ? 'bg-blue-600 text-white'
                    : completedInRound === roundGamesForRound.length
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('common.round')} {round} ({completedInRound}/{roundGamesForRound.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Day Selector */}
      {matchDaysInRound.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-600">{t('seasons.selectMatchDay')}</h3>
            <div className="flex gap-2">
              {selectedMatchDay && (
                <button
                  onClick={onShowPrintOptions}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-xs"
                >
                  🖨️ {t('print.printOptions')}
                </button>
              )}
              {season.status === 'active' && selectedMatchDay && (
                <button
                  onClick={onShowPostpone}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-semibold text-xs"
                >
                  📅 {t('seasons.postpone')}
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {matchDaysInRound.map(matchDay => {
              const matchDayGamesForDay = roundGames.filter(g => g.matchDay === matchDay);
              const completedInMatchDay = matchDayGamesForDay.filter(g => g.status === 'completed').length;
              const scheduleEntry = season.schedule?.find((s: ScheduleMatchDay) => s.matchDay === matchDay);
              const dateDisplay = scheduleEntry?.date ? formatMatchDate(scheduleEntry.date) : null;
              const isPostponed = scheduleEntry?.postponed;

              return (
                <button
                  key={matchDay}
                  onClick={() => onMatchDayChange(matchDay)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedMatchDay === matchDay
                      ? 'bg-purple-600 text-white'
                      : completedInMatchDay === matchDayGamesForDay.length
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isPostponed ? 'ring-2 ring-orange-400' : ''}`}
                >
                  <div>{t('common.matchDay')} {matchDay}</div>
                  {dateDisplay && (
                    <div className="text-xs mt-1 opacity-90">
                      {isPostponed && '⚠️ '}{dateDisplay}
                    </div>
                  )}
                  <div className="text-xs mt-1">({completedInMatchDay}/{matchDayGamesForDay.length})</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Games List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t('common.round')} {selectedRound} - {t('common.matchDay')} {selectedMatchDay}
        </h2>
        {matchDayGames.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t('seasons.noGamesInMatchDay')}</p>
        ) : (
          <div className="space-y-3">
            {matchDayGames.map(game => {
              const team1 = teams.find(t => t.id === game.team1Id);
              const team2 = teams.find(t => t.id === game.team2Id);
              const h2h = calculateHeadToHead(game.team1Id, game.team2Id, games);

              return (
                <GameCard
                  key={game.id}
                  game={game}
                  team1={team1}
                  team2={team2}
                  h2h={h2h}
                  onPlayGame={() => onPlayGame(game.id)}
                  onViewGame={() => onViewGame(game.id, game)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
