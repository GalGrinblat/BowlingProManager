import React, { useState } from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { calculateMatchResults, calculateBonusPoints } from '../../../utils/matchUtils';
import { calculateGrandTotalPoints } from '../../../utils/statsUtils';
import type { Game, GameMatch, GamePlayer } from '../../../types/index';

interface Props {
  game: Game;
  onApply: (updatedGame: Game) => void;
  onDismiss: () => void;
}

export const PendingSubmissionPanel: React.FC<Props> = ({ game, onApply, onDismiss }) => {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const sub = game.pendingSubmission!;

  const submittedDate = new Date(sub.submittedAt).toLocaleString();

  const absentTeam1 = game.team1?.players.filter((_, i) => sub.team1AbsentFlags[i]) ?? [];
  const absentTeam2 = game.team2?.players.filter((_, i) => sub.team2AbsentFlags[i]) ?? [];
  const anyAbsent = absentTeam1.length > 0 || absentTeam2.length > 0;

  const handleApply = () => {
    if (!game.team1 || !game.team2 || !game.matches) return;

    // Apply absent flags to game players
    const updatedTeam1Players: GamePlayer[] = game.team1.players.map((p, i) => ({
      ...p,
      absent: sub.team1AbsentFlags[i] ?? p.absent,
    }));
    const updatedTeam2Players: GamePlayer[] = game.team2.players.map((p, i) => ({
      ...p,
      absent: sub.team2AbsentFlags[i] ?? p.absent,
    }));

    // Apply pin scores and recalculate bonus points for each match
    const updatedMatches: GameMatch[] = game.matches.map((m, mi) => {
      const ms = sub.matchScores[mi];
      if (!ms) return m;
      return {
        ...m,
        team1: {
          ...m.team1,
          players: m.team1.players.map((p, pi) => {
            const raw = ms.team1Pins[pi];
            const pins = raw == null ? '' : String(raw);
            const player = updatedTeam1Players[pi];
            return {
              ...p,
              pins,
              bonusPoints: player
                ? calculateBonusPoints(pins, player.average, player.absent, game.bonusRules ?? [])
                : p.bonusPoints,
            };
          }),
        },
        team2: {
          ...m.team2,
          players: m.team2.players.map((p, pi) => {
            const raw = ms.team2Pins[pi];
            const pins = raw == null ? '' : String(raw);
            const player = updatedTeam2Players[pi];
            return {
              ...p,
              pins,
              bonusPoints: player
                ? calculateBonusPoints(pins, player.average, player.absent, game.bonusRules ?? [])
                : p.bonusPoints,
            };
          }),
        },
      };
    });

    const updated: Game = {
      ...game,
      team1: { ...game.team1, players: updatedTeam1Players },
      team2: { ...game.team2, players: updatedTeam2Players },
      matches: updatedMatches,
      pendingSubmission: undefined,
      status: 'in-progress',
    };

    // Recalculate match results for all matches
    for (let i = 0; i < updatedMatches.length; i++) {
      calculateMatchResults(updated, i);
    }
    updated.grandTotalPoints = calculateGrandTotalPoints(updated);

    onApply(updated);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-yellow-900/40 border border-yellow-500 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-yellow-300">{t('pending.title')}</h2>
              <p className="text-sm text-yellow-400/70 mt-1">
                {t('pending.submittedAt')}: {submittedDate}
              </p>
              {sub.submitterName && (
                <p className="text-sm text-yellow-300/80 mt-0.5">
                  {t('pending.submittedBy')}: <span className="font-semibold">{sub.submitterName}</span>
                </p>
              )}
            </div>
            <span className="text-3xl">📋</span>
          </div>

          {/* Absences */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              {t('pending.absences')}
            </h3>
            {anyAbsent ? (
              <div className="flex flex-wrap gap-2">
                {absentTeam1.map(p => (
                  <span key={p.playerId} className="bg-red-800/60 text-red-300 text-sm px-3 py-1 rounded-full">
                    {p.name} ({game.team1?.name})
                  </span>
                ))}
                {absentTeam2.map(p => (
                  <span key={p.playerId} className="bg-red-800/60 text-red-300 text-sm px-3 py-1 rounded-full">
                    {p.name} ({game.team2?.name})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">{t('pending.noAbsences')}</p>
            )}
          </div>

          {/* Score grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              {t('pending.scores')}
            </h3>
            <div className="space-y-3">
              {sub.matchScores.map((ms, mi) => (
                <div key={mi} className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2 font-semibold">
                    {t('print.match')} {mi + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-blue-400 mb-1">{game.team1?.name}</div>
                      {ms.team1Pins.map((pins, pi) => (
                        <div key={pi} className="flex justify-between text-sm py-0.5">
                          <span className="text-gray-300">{game.team1?.players[pi]?.name}</span>
                          <span className={`font-mono font-bold ${pins == null ? 'text-gray-500' : 'text-white'}`}>
                            {pins == null ? '-' : pins}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs text-green-400 mb-1">{game.team2?.name}</div>
                      {ms.team2Pins.map((pins, pi) => (
                        <div key={pi} className="flex justify-between text-sm py-0.5">
                          <span className="text-gray-300">{game.team2?.players[pi]?.name}</span>
                          <span className={`font-mono font-bold ${pins == null ? 'text-gray-500' : 'text-white'}`}>
                            {pins == null ? '-' : pins}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        {confirming ? (
          <div className="bg-red-900/40 border border-red-500 rounded-xl p-5">
            <p className="text-red-300 mb-4">{t('pending.dismissConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={onDismiss}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {t('pending.dismiss')}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              {t('pending.apply')}
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('pending.dismiss')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
