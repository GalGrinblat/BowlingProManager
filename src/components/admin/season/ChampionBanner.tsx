import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { useDateFormat } from '../../../hooks/useDateFormat';

interface ChampionBannerProps {
  champion: {
    teamName: string;
    points: number;
    wins: number;
    losses: number;
    draws: number;
    totalPinsWithHandicap: number;
  };
}

export const ChampionBanner: React.FC<ChampionBannerProps> = ({ champion }) => {
  const { t } = useTranslation();
  const { locale } = useDateFormat();

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 text-white">
      <div className="text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-4xl font-bold mb-2">{t('seasons.champion')}</h2>
        <h3 className="text-3xl font-bold mb-4">{champion.teamName}</h3>
        <div className="flex justify-center gap-8 text-lg">
          <div>
            <div className="text-2xl font-bold">{champion.points}</div>
            <div className="text-sm opacity-90">{t('common.points')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{champion.wins}-{champion.losses}-{champion.draws}</div>
            <div className="text-sm opacity-90">{t('seasons.wld')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{champion.totalPinsWithHandicap.toLocaleString(locale)}</div>
            <div className="text-sm opacity-90">{t('seasons.totalPins')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
