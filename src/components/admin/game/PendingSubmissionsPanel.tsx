import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { calculateBonusPoints } from '../../../utils/matchUtils';
import type { Game, ScoreSubmission, GameMatch, MatchPlayer } from '../../../types/index';

interface PendingSubmissionsPanelProps {
  game: Game;
  onApply: (updatedGame: Game, remainingSubmissions: ScoreSubmission[]) => void;
  onSkip: () => void;
}

export const PendingSubmissionsPanel: React.FC<PendingSubmissionsPanelProps> = ({
  game, onApply, onSkip,
}) => {
  const { t } = useTranslation();
  const pending = game.pendingScores ?? [];

  const applySubmission = (submission: ScoreSubmission): Game => {
    if (!game.matches || !game.team1 || !game.team2) return game;

    const updatedMatches: GameMatch[] = game.matches.map((match, matchIdx) => {
      const pins = submission.scores[matchIdx] ?? '';
      const teamData = submission.team === 'team1' ? match.team1 : match.team2;
      const playerObj = submission.team === 'team1'
        ? game.team1!.players[submission.playerIndex]
        : game.team2!.players[submission.playerIndex];

      const updatedPlayers: MatchPlayer[] = teamData.players.map((p, pIdx) =>
        pIdx === submission.playerIndex
          ? {
              ...p,
              pins,
              bonusPoints: playerObj
                ? calculateBonusPoints(pins, playerObj.average, playerObj.absent, game.bonusRules ?? [])
                : 0,
            }
          : p
      );

      if (submission.team === 'team1') {
        return { ...match, team1: { ...match.team1, players: updatedPlayers } };
      }
      return { ...match, team2: { ...match.team2, players: updatedPlayers } };
    });

    return { ...game, matches: updatedMatches };
  };

  const handleApplyOne = (submission: ScoreSubmission) => {
    const updatedGame = applySubmission(submission);
    const remaining = pending.filter(s => s.id !== submission.id);
    onApply({ ...updatedGame, pendingScores: remaining }, remaining);
  };

  const handleDismissOne = (submission: ScoreSubmission) => {
    const remaining = pending.filter(s => s.id !== submission.id);
    onApply({ ...game, pendingScores: remaining }, remaining);
  };

  const handleApplyAll = () => {
    let updatedGame = game;
    for (const sub of pending) {
      updatedGame = applySubmission(sub);
    }
    onApply({ ...updatedGame, pendingScores: [] }, []);
  };

  const handleDismissAll = () => {
    onApply({ ...game, pendingScores: [] }, []);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-amber-500 text-white px-6 py-4">
          <h2 className="text-xl font-bold">{t('games.pendingSubmissions')}</h2>
          <p className="text-amber-100 text-sm mt-1">
            {t('games.pendingSubmissionsDesc').replace('{{count}}', String(pending.length))}
          </p>
        </div>

        {/* Bulk actions */}
        {pending.length > 0 && (
          <div className="flex gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
            <button
              onClick={handleApplyAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              ✓ {t('games.applyAllScores')}
            </button>
            <button
              onClick={handleDismissAll}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
            >
              ✕ {t('games.dismissAll')}
            </button>
            <button
              onClick={onSkip}
              className="ml-auto px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('games.skipReview')}
            </button>
          </div>
        )}

        {/* Submissions list */}
        <div className="divide-y divide-gray-100">
          {pending.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('games.noSubmissions')}</p>
          ) : (
            pending.map(sub => {
              const teamLabel = sub.team === 'team1'
                ? game.team1?.name || t('games.team1Default')
                : game.team2?.name || t('games.team2Default');
              const submittedDate = new Date(sub.submittedAt).toLocaleString();

              return (
                <div key={sub.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{sub.playerName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          sub.team === 'team1'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {teamLabel}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {t('games.submittedAt')}: {submittedDate}
                      </div>
                      {/* Scores per match */}
                      <div className="flex gap-2 flex-wrap">
                        {sub.scores.map((sc, i) => (
                          <div key={i} className="text-center">
                            <div className="text-xs text-gray-400">
                              {t('games.matchScore').replace('{{num}}', String(i + 1))}
                            </div>
                            <div className="bg-gray-100 rounded px-3 py-1 text-sm font-bold text-gray-800">
                              {sc || '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApplyOne(sub)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-semibold transition-colors"
                      >
                        {t('games.applyScores')}
                      </button>
                      <button
                        onClick={() => handleDismissOne(sub)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                      >
                        {t('games.dismissSubmission')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onSkip}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            {t('games.skipReview')} →
          </button>
        </div>
      </div>
    </div>
  );
};
