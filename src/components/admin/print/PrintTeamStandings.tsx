import React, { useEffect, useState } from 'react';
import { seasonsApi, teamsApi, gamesApi, leaguesApi } from '../../../services/api';
import { calculateTeamStandings } from '../../../utils/standingsUtils';
import { useTranslation } from '../../../contexts/LanguageContext';
import { useDateFormat } from '../../../hooks/useDateFormat';
import { TeamStandingsTable } from '../config/TeamStandingsTable';

import type { Game, League, Season, Team, TeamStanding } from '../../../types/index';

interface PrintTeamStandingsProps {
  seasonId: string;
  onClose: () => void;
}

export const PrintTeamStandings: React.FC<PrintTeamStandingsProps> = ({
  seasonId,
  onClose
}) => {
  const { t, direction } = useTranslation();
  const { formatDate, formatTime } = useDateFormat();
  const [season, setSeason] = useState<Season | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teamStandings, setTeamStandings] = useState<TeamStanding[]>([]);

  const loadData = async () => {
    const seasonData = await seasonsApi.getById(seasonId);
    if (!seasonData) return;
    setSeason(seasonData);

    const leagueData = await leaguesApi.getById(seasonData.leagueId);
    if (!leagueData) return;
    setLeague(leagueData);

    const teamsData = await teamsApi.getBySeason(seasonId);
    setTeams(teamsData);

    const gamesData = await gamesApi.getBySeason(seasonId);
    setGames(gamesData);

    const standings = calculateTeamStandings(teamsData, gamesData);
    setTeamStandings(standings);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId]);

  const handlePrint = () => {
    window.print();
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || teamId;
  };

  if (!season || !league) {
    return <div>{t('common.loading')}</div>;
  }

  const completedGames = games.filter(g => g.status === 'completed');

  return (
    <div className="print-modal-root fixed inset-0 bg-white z-50 overflow-auto">
      {/* No-print controls */}
      <div className="no-print bg-gray-100 p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {t('seasons.teamStandings')}
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
      <div className="print-content p-8 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{league.name}</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{season.name}</h2>
          <h3 className="text-xl font-semibold text-blue-600">{t('seasons.teamStandings')}</h3>
          <div className="mt-4 text-sm text-gray-600">
            <span>{t('common.gamesPlayed')}: {completedGames.length}</span>
          </div>
        </div>

        {/* Team Standings Table */}
        {teamStandings.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {t('seasons.noStandings')}
          </div>
        ) : (
          <TeamStandingsTable
            standings={teamStandings}
            direction={direction}
            t={t}
            getTeamName={getTeamName}
            showHeader={true}
            compact={false}
          />
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>{t('common.printedOn')}: {formatDate(new Date().toISOString())} {formatTime(new Date().toISOString())}</p>
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
            padding: 2cm !important;
            max-width: 100% !important;
            margin: 0 !important;
          }

          @page {
            margin: 1cm;
            size: A4 portrait;
          }
        }
      `}</style>
    </div>
  );
};
