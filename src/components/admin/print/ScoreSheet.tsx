import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';

interface PlayerData {
  id: string;
  name: string;
}

interface ScoreSheetProps {
  teamName: string;
  players: PlayerData[];
  matchesPerGame: number;
  accentColor: 'blue' | 'purple';
}

export const ScoreSheet: React.FC<ScoreSheetProps> = ({ teamName, players, matchesPerGame, accentColor }) => {
  const { t } = useTranslation();
  const headerColor = accentColor === 'blue' ? 'text-blue-700' : 'text-purple-700';
  const borderColor = accentColor === 'blue' ? 'border-blue-500' : 'border-purple-500';
  const totalRowBg = accentColor === 'blue' ? 'bg-blue-50' : 'bg-purple-50';
  const totalCellBg = accentColor === 'blue' ? 'bg-blue-100' : 'bg-purple-100';

  return (
    <div>
      <h6 className={`text-md font-bold ${headerColor} mb-3 text-center border-b-2 ${borderColor} pb-2`}>
        {teamName}
      </h6>
      <table className="w-full border-2 border-gray-800">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-800 px-2 py-2 text-sm font-bold">{t('common.match')}</th>
            {Array.from({ length: matchesPerGame }, (_, i) => (
              <th key={i + 1} className="border border-gray-800 px-2 py-2 text-sm font-bold">{i + 1}</th>
            ))}
            <th className="border border-gray-800 px-2 py-2 text-sm font-bold bg-gray-300">{t('common.total')}</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, idx) => (
            <tr key={player.id}>
              <td className="border border-gray-800 px-2 py-2 text-xs font-semibold">
                {idx + 1}. {player.name.split(' ')[0]}
              </td>
              {Array.from({ length: matchesPerGame }, (_, i) => (
                <td key={i + 1} className="border border-gray-800 px-2 py-6"></td>
              ))}
              <td className="border border-gray-800 px-2 py-6 bg-gray-100"></td>
            </tr>
          ))}
          <tr className={`${totalRowBg} font-bold`}>
            <td className="border border-gray-800 px-2 py-2 text-sm">{t('common.total')}</td>
            {Array.from({ length: matchesPerGame }, (_, i) => (
              <td key={i} className="border border-gray-800 px-2 py-6"></td>
            ))}
            <td className={`border border-gray-800 px-2 py-6 ${totalCellBg}`}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
