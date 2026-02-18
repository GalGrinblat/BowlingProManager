import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';

interface RecordEntry {
  playerRecordEntry?: { playerId: string; value: number };
  teamRecordEntry?: { teamId: string; value: number };
  teamId?: string;
  round: number;
  matchDay: number;
}

interface SeasonRecords {
  highestPlayerMatchScores: RecordEntry[];
  highestPlayerSeries: RecordEntry[];
  highestTeamMatchScores: RecordEntry[];
  highestTeamGameTotals: RecordEntry[];
}

interface SeasonRecordsViewProps {
  seasonRecords: SeasonRecords;
  hasCompletedGames: boolean;
}

const RecordCard: React.FC<{
  title: string;
  icon: string;
  colorScheme: 'purple' | 'blue' | 'green' | 'orange';
  records: RecordEntry[];
  type: 'player' | 'team';
  t: (key: string) => string;
}> = ({ title, icon, colorScheme, records, type, t }) => {
  const colors = {
    purple: { border: 'border-purple-200', bg: 'from-purple-50', text: 'text-purple-800', value: 'text-purple-600', itemBorder: 'border-purple-100' },
    blue: { border: 'border-blue-200', bg: 'from-blue-50', text: 'text-blue-800', value: 'text-blue-600', itemBorder: 'border-blue-100' },
    green: { border: 'border-green-200', bg: 'from-green-50', text: 'text-green-800', value: 'text-green-600', itemBorder: 'border-green-100' },
    orange: { border: 'border-orange-200', bg: 'from-orange-50', text: 'text-orange-800', value: 'text-orange-600', itemBorder: 'border-orange-100' },
  };
  const c = colors[colorScheme];
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className={`border-2 ${c.border} rounded-xl p-4 bg-gradient-to-br ${c.bg} to-white`}>
      <h4 className={`text-base font-bold ${c.text} mb-3 flex items-center gap-2`}>
        {icon} {title}
      </h4>
      {records.length > 0 ? (
        <div className="space-y-2">
          {records.map((record, index) => (
            <div key={index} className={`flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border ${c.itemBorder}`}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={`text-xl font-bold ${c.value}`}>{medals[index]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {type === 'player' ? record.playerRecordEntry?.playerId : record.teamRecordEntry?.teamId}
                  </p>
                  {type === 'player' && <p className="text-xs text-gray-600 truncate">{record.teamId}</p>}
                </div>
              </div>
              <div className="text-right ml-2">
                <p className={`text-xl font-bold ${c.value}`}>
                  {type === 'player' ? record.playerRecordEntry?.value : record.teamRecordEntry?.value}
                </p>
                <p className="text-xs text-gray-500">
                  {t('common.round')}{record.round}, {type === 'player' && record.matchDay ? t('records.day') : t('common.matchDay')}{record.matchDay}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-3 text-sm">{t('records.noRecords')}</p>
      )}
    </div>
  );
};

export const SeasonRecordsView: React.FC<SeasonRecordsViewProps> = ({ seasonRecords, hasCompletedGames }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏅 {t('records.title')}</h2>

      {!hasCompletedGames ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('records.noCompletedGames')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-gray-300">👤 {t('records.personalRecords')}</h3>
            <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-gray-300">🏆 {t('records.teamRecords')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <RecordCard
              title={t('records.matchScore')}
              icon="🎯"
              colorScheme="purple"
              records={seasonRecords.highestPlayerMatchScores}
              type="player"
              t={t}
            />
            <RecordCard
              title={t('records.series')}
              icon="🎳"
              colorScheme="blue"
              records={seasonRecords.highestPlayerSeries}
              type="player"
              t={t}
            />
            <RecordCard
              title={t('records.teamMatch')}
              icon="💪"
              colorScheme="green"
              records={seasonRecords.highestTeamMatchScores}
              type="team"
              t={t}
            />
            <RecordCard
              title={t('records.gameTotal')}
              icon="🔥"
              colorScheme="orange"
              records={seasonRecords.highestTeamGameTotals}
              type="team"
              t={t}
            />
          </div>
        </div>
      )}
    </div>
  );
};
