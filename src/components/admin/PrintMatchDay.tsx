import React, { useEffect, useState } from 'react';
import { seasonsApi, teamsApi, gamesApi, leaguesApi, playersApi } from '../../services/api';
import { calculateTeamStandings, calculateCurrentPlayerAverages } from '../../utils/standingsUtils';
import { calculateHeadToHead } from '../../utils/headToHeadUtils';
import { formatMatchDate } from '../../utils/scheduleUtils';
import { useTranslation } from '../../contexts/LanguageContext';

import type { PrintMatchDayProps } from '../../types/index';

export const PrintMatchDay: React.FC<PrintMatchDayProps> = ({ 
  seasonId, 
  matchDay, 
  onClose 
}) => {
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const [season, setSeason] = useState<any>(null);
  const [league, setLeague] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [matchDayGames, setMatchDayGames] = useState<any[]>([]);
  const [teamStandings, setTeamStandings] = useState<any[]>([]);
  const [currentAverages, setCurrentAverages] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [seasonId, matchDay]);

  const loadData = () => {
    const seasonData = seasonsApi.getById(seasonId);
    setSeason(seasonData);

    if (!seasonData) return;

    const leagueData = leaguesApi.getById(seasonData.leagueId);
    setLeague(leagueData);

    const teamsData = teamsApi.getBySeason(seasonId);
    setTeams(teamsData);

    const gamesData = gamesApi.getBySeason(seasonId);
    setGames(gamesData);

    const matchDayGamesData = gamesData.filter(g => g.matchDay === matchDay);
    setMatchDayGames(matchDayGamesData);

    const standings = calculateTeamStandings(teamsData, gamesData);
    setTeamStandings(standings);

    // Calculate current averages (up to this matchday)
    const previousGames = gamesData.filter(g => 
      g.status === 'completed' && g.matchDay < matchDay
    );
    const averages = calculateCurrentPlayerAverages(teamsData, previousGames);
    setCurrentAverages(averages);
  };

  const handlePrint = () => {
    window.print();
  };

  const getTeamPlayers = (team: any) => {
    return team.playerIds.map((playerId: string) => {
      const player = playersApi.getById(playerId);
      const playerName = player?.name || 'Unknown';
      const currentAvg = currentAverages[playerName]?.average || 0;
      const currentGamesPlayed = currentAverages[playerName]?.gamesPlayed || 0;
      
      // Calculate handicap for this match
      let handicap = 0;
      if (season.useHandicap && currentAvg > 0 && currentAvg < season.handicapBasis) {
        const diff = season.handicapBasis - currentAvg;
        handicap = Math.round(diff * (season.handicapPercentage / 100));
      }

      return {
        id: playerId,
        name: playerName,
        average: currentAvg,
        gamesPlayed: currentGamesPlayed,
        handicap
      };
    }).sort((a: any, b: any) => (b.average || 0) - (a.average || 0)); // Sort by average descending
  };

  const getTeamStanding = (teamId: string) => {
    return teamStandings.find(s => s.teamId === teamId);
  };

  const getScheduleInfo = () => {
    if (!season.schedule) return null;
    return season.schedule.find((s: any) => s.matchDay === matchDay);
  };

  if (!season || !league) {
    return <div>{t('seasons.loading')}</div>;
  }

  const scheduleInfo = getScheduleInfo();
  const firstGame = matchDayGames[0];
  const round = firstGame?.round || 1;

  return (
    <div className="print-modal-root fixed inset-0 bg-white z-50 overflow-auto">
      {/* No-print controls */}
      <div className="no-print bg-gray-100 p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {t('seasons.printMatchDay')} {matchDay}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            🖨️ {t('common.print')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
          >
            {t('common.close')}
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div className="print-content p-8 max-w-7xl mx-auto">
        {/* Matches */}
        {matchDayGames.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {t('seasons.noGamesInMatchDay')}
          </div>
        ) : (
          <div className="space-y-12">
            {matchDayGames.map((game, index) => {
              const team1 = teams.find(t => t.id === game.team1Id);
              const team2 = teams.find(t => t.id === game.team2Id);
              
              if (!team1 || !team2) return null;

              const team1Players = getTeamPlayers(team1);
              const team2Players = getTeamPlayers(team2);
              const team1Standing = getTeamStanding(team1.id);
              const team2Standing = getTeamStanding(team2.id);
              const h2h = calculateHeadToHead(team1.id, team2.id, games);

              return (
                <div key={game.id} className="match-section break-inside-avoid">
                  {/* Page Header - appears on each page */}
                  <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{league.name}</h1>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">{season.name}</h2>
                    <div className="flex justify-center gap-6 text-base text-gray-600">
                      <span>📅 {t('schedule.round')} {round}</span>
                      <span>🎳 {t('seasons.matchDay')} {matchDay}</span>
                      {scheduleInfo?.date && (
                        <span>📆 {formatMatchDate(scheduleInfo.date)}</span>
                      )}
                    </div>
                    {season.useHandicap && (
                      <div className="mt-2 text-sm text-gray-600">
                        ⚖️ {t('leagues.handicapDisplay')
                          .replace('{{percentage}}', String(season.handicapPercentage || 100))
                          .replace('{{basis}}', String(season.handicapBasis))}
                      </div>
                    )}
                  </div>

                  {/* Match Header */}
                  <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold">
                        {t('schedule.match')} {index + 1}
                      </h3>
                      {game.status === 'completed' && (
                        <span className="px-3 py-1 bg-green-500 rounded text-sm font-semibold">
                          {t('common.completed')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teams Face-off */}
                  <div className="border-x-2 border-b-2 border-gray-800 p-6">
                    <div className="grid grid-cols-5 gap-6 items-center mb-6">
                      {/* Team 1 */}
                      <div className="col-span-2 text-right">
                        <h4 className="text-3xl font-bold text-gray-900 mb-2">{team1.name}</h4>
                        {team1Standing && (
                          <div className="text-sm text-gray-600">
                            <div>#{team1Standing.rank} • {team1Standing.wins}-{team1Standing.losses}-{team1Standing.draws} ({team1Standing.points} {t('common.pts')})</div>
                          </div>
                        )}
                      </div>

                      {/* VS */}
                      <div className="col-span-1 text-center">
                        <div className="text-5xl font-bold text-gray-400">VS</div>
                        {h2h.gamesPlayed > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            {t('seasons.headToHead')}: {h2h.team1Wins}-{h2h.team2Wins}
                          </div>
                        )}
                      </div>

                      {/* Team 2 */}
                      <div className="col-span-2">
                        <h4 className="text-3xl font-bold text-gray-900 mb-2">{team2.name}</h4>
                        {team2Standing && (
                          <div className="text-sm text-gray-600">
                            <div>#{team2Standing.rank} • {team2Standing.wins}-{team2Standing.losses}-{team2Standing.draws} ({team2Standing.points} {t('common.pts')})</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Player Rosters */}
                    <div className="grid grid-cols-2 gap-8">
                      {/* Team 1 Players */}
                      <div>
                        <h5 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-blue-500 pb-2">
                          {team1.name} {t('common.roster')}
                        </h5>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className={`${isRTL ? 'text-right' : 'text-left'} px-2 py-2 font-semibold`}>{t('common.player')}</th>
                              <th className="text-center px-2 py-2 font-semibold">{t('common.average')}</th>
                              <th className="text-center px-2 py-2 font-semibold">{t('common.handicap')}</th>
                              <th className="text-center px-2 py-2 font-semibold">{t('seasons.gamesPlayed')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {team1Players.map((player: any, idx: number) => (
                              <tr key={player.id} className="border-b border-gray-200">
                                <td className="px-2 py-2">
                                  <div className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{idx + 1}. {player.name}</div>
                                </td>
                                <td className="text-center px-2 py-2 font-semibold">
                                  {player.average > 0 ? player.average.toFixed(1) : '-'}
                                </td>
                                <td className="text-center px-2 py-2 text-blue-600 font-bold">
                                  {player.handicap > 0 ? player.handicap : '-'}
                                </td>
                                <td className="text-center px-2 py-2 text-gray-600">
                                  {player.gamesPlayed}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td className={`px-2 py-2 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('common.total')}</td>
                              <td className="text-center px-2 py-2 font-bold">
                                {(team1Players.reduce((sum: number, p: any) => sum + p.average, 0) / team1Players.length || 0).toFixed(1)}
                              </td>
                              <td className="text-center px-2 py-2 font-bold text-blue-600">
                                {team1Players.reduce((sum: number, p: any) => sum + p.handicap, 0)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Team 2 Players */}
                      <div>
                        <h5 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-purple-500 pb-2">
                          {team2.name} {t('common.roster')}
                        </h5>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className={`${isRTL ? 'text-right' : 'text-left'} px-2 py-2 font-semibold`}>{t('common.player')}</th>
                              <th className="text-center px-2 py-2 font-semibold">{t('common.average')}</th>
                              <th className="text-center px-2 py-2 font-semibold">{t('common.handicap')}</th>
                              <th className="text-center px-2 py-2 font-semibold">{t('seasons.gamesPlayed')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {team2Players.map((player: any, idx: number) => (
                              <tr key={player.id} className="border-b border-gray-200">
                                <td className="px-2 py-2">
                                  <div className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{idx + 1}. {player.name}</div>
                                </td>
                                <td className="text-center px-2 py-2 font-semibold">
                                  {player.average > 0 ? player.average.toFixed(1) : '-'}
                                </td>
                                <td className="text-center px-2 py-2 text-purple-600 font-bold">
                                  {player.handicap > 0 ? player.handicap : '-'}
                                </td>
                                <td className="text-center px-2 py-2 text-gray-600">
                                  {player.gamesPlayed}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td className={`px-2 py-2 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('common.total')}</td>
                              <td className="text-center px-2 py-2 font-bold">
                                {(team2Players.reduce((sum: number, p: any) => sum + p.average, 0) / team2Players.length || 0).toFixed(1)}
                              </td>
                              <td className="text-center px-2 py-2 font-bold text-purple-600">
                                {team2Players.reduce((sum: number, p: any) => sum + p.handicap, 0)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>{t('common.printedOn')}: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          <p className="mt-1">{league.name} • {season.name}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          body * {
            visibility: hidden;
            position: static !important;
          }
          
          .print-modal-root,
          .print-modal-root * {
            visibility: visible;
          }
          
          .print-modal-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-content {
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          
          .match-section {
            page-break-after: always;
            page-break-inside: avoid;
          }
          
          .match-section:last-child {
            page-break-after: auto;
          }
          
          @page {
            margin: 1cm;
            size: A4 portrait;
          }
        }
        
        .break-inside-avoid {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `}</style>
    </div>
  );
};
