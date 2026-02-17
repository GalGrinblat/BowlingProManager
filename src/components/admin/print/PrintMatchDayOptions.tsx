import React, { useState } from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { PrintCombined } from './PrintCombined';

interface PrintMatchDayOptionsProps {
  seasonId: string;
  matchDay: number;
  onClose: () => void;
}

export const PrintMatchDayOptions: React.FC<PrintMatchDayOptionsProps> = ({
  seasonId,
  matchDay,
  onClose
}) => {
  const { t } = useTranslation();
  const [showPrint, setShowPrint] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    matchDay: true,
    teamStandings: false,
    playerStandings: false
  });

  const handleCheckboxChange = (option: keyof typeof selectedOptions) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handlePrint = () => {
    // Check if at least one option is selected
    if (!selectedOptions.matchDay && !selectedOptions.teamStandings && !selectedOptions.playerStandings) {
      alert(t('print.selectAtLeastOne'));
      return;
    }
    setShowPrint(true);
  };

  const handleClosePrint = () => {
    setShowPrint(false);
  };

  if (showPrint) {
    return (
      <PrintCombined
        seasonId={seasonId}
        matchDay={matchDay}
        includeMatchDay={selectedOptions.matchDay}
        includeTeamStandings={selectedOptions.teamStandings}
        includePlayerStandings={selectedOptions.playerStandings}
        onClose={handleClosePrint}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold">
            {t('print.printOptions')}
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            {t('print.selectWhatToPrint')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Match Day Option */}
            <label className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={selectedOptions.matchDay}
                onChange={() => handleCheckboxChange('matchDay')}
                className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {t('print.matchDayDetails')}
                </div>
                <div className="text-sm text-gray-600">
                  {t('print.matchDayDetailsDesc')}
                </div>
              </div>
            </label>

            {/* Team Standings Option */}
            <label className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={selectedOptions.teamStandings}
                onChange={() => handleCheckboxChange('teamStandings')}
                className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {t('seasons.teamStandings')}
                </div>
                <div className="text-sm text-gray-600">
                  {t('print.teamStandingsDesc')}
                </div>
              </div>
            </label>

            {/* Player Standings Option */}
            <label className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={selectedOptions.playerStandings}
                onChange={() => handleCheckboxChange('playerStandings')}
                className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {t('seasons.playerStandings')}
                </div>
                <div className="text-sm text-gray-600">
                  {t('print.playerStandingsDesc')}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
          >
            🖨️ {t('print.printSelected')}
          </button>
        </div>
      </div>
    </div>
  );
};
