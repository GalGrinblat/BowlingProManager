import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { useDateFormat } from '../../../hooks/useDateFormat';
import type { ScheduleMatchDay } from '../../../types/index';

interface PostponeModalProps {
  selectedMatchDay: number | null;
  schedule: ScheduleMatchDay[] | undefined;
  postponeWeeks: number;
  onPostponeWeeksChange: (weeks: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PostponeModal: React.FC<PostponeModalProps> = ({
  selectedMatchDay, schedule, postponeWeeks,
  onPostponeWeeksChange, onConfirm, onCancel
}) => {
  const { t } = useTranslation();
  const { formatMatchDate } = useDateFormat();

  const scheduleEntry = schedule?.find((s: ScheduleMatchDay) => s.matchDay === selectedMatchDay);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('seasons.postponeMatchDay').replace('{{matchDay}}', String(selectedMatchDay))}</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {t('seasons.currentDate')}: {scheduleEntry?.date
              ? formatMatchDate(scheduleEntry.date)
              : t('seasons.notScheduled')}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {t('seasons.subsequentShift')}
          </p>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('seasons.postponeByWeeks')}
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={postponeWeeks}
            onChange={(e) => onPostponeWeeksChange(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />

          {postponeWeeks > 0 && scheduleEntry?.date && (
            <p className="text-sm text-gray-500 mt-2">
              {t('seasons.newDate')}: {(() => {
                const newDate = new Date(new Date(scheduleEntry.date).getTime() + postponeWeeks * 7 * 24 * 60 * 60 * 1000);
                return formatMatchDate(newDate.toISOString());
              })()}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
          >
            {t('seasons.postpone')}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
