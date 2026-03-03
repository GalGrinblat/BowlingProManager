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

  /** Apply a full-game submission: absent flags + match scores */
  const applySubmission = (submission: ScoreSubmission): Game => {
    if (!game.team1 || !game.team2) return game;

    // Apply absent flags
    const updatedTeam1 = {
      ...game.team1,
      players: game.team1.players.map((p, i) => ({
        ...p,
        absent: submission.team1Absent[i] ?? p.absent,
      })),
    };
    const updatedTeam2 = {
      ...game.team2,
      players: game.team2.players.map((p, i) => ({
        ...p,
        absent: submission.team2Absent[i] ?? p.absent,
      })),
    };

    if (!game.matches) return { ...game, team1: updatedTeam1, team2: updatedTeam2 };

    // Apply match scores
    const updatedMatches: GameMatch[] = game.matches.map((match, matchIdx) => {
      const submittedMatch = submission.matches[matchIdx];
      if (!submittedMatch) return match;

      const applyTeamPins = (
        currentPlayers: MatchPlayer[],
        pins: string[],
        teamPlayers: typeof updatedTeam1.players,
      ): MatchPlayer[] =>
        currentPlayers.map((p, pIdx) => {
          const pinStr = pins[pIdx] ?? '';
          const playerObj = teamPlayers[pIdx];
          return {
            ...p,
            pins: pinStr,
            bonusPoints: playerObj
              ? calculateBonusPoints(pinStr, playerObj.average, playerObj.absent, game.bonusRules ?? [])
              : 0,
          };
        });

      return {
        ...match,
        team1: { ...match.team1, players: applyTeamPins(match.team1.players, submittedMatch.team1Pins, updatedTeam1.players) },
        team2: { ...match.team2, players: applyTeamPins(match.team2.players, submittedMatch.team2Pins, updatedTeam2.players) },
      };
    });

    return { ...game, team1: updatedTeam1, team2: updatedTeam2, matches: updatedMatches };
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
    // Only apply the latest submission (last in array); earlier ones are overwritten
    const last = pending[pending.length - 1];
    const updatedGame = last ? applySubmission(last) : game;
    onApply({ ...updatedGame, pendingScores: [] }, []);
  };

  const handleDismissAll = () => {
    onApply({ ...game, pendingScores: [] }, []);
  };

  const team1Name = game.team1?.name || t('games.team1Default');
  const team2Name = game.team2?.name || t('games.team2Default');

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
            pending.map((sub, subIdx) => {
              const submittedDate = new Date(sub.submittedAt).toLocaleString();
              return (
                <div key={sub.id} className="px-6 py-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="font-semibold text-gray-700">
                        {t('games.submittedAt')}: {submittedDate}
                      </span>
                      {pending.length > 1 && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                          #{subIdx + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
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

                  {/* Per-match scores with absent info */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                      {t('games.preMatchTitle')}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-orange-600">{team1Name}: </span>
                        {sub.team1Absent.some(Boolean)
                          ? sub.team1Absent.map((absent, i) =>
                              absent ? <span key={i} className="text-red-500">🚫 {game.team1?.players[i]?.name?.split(' ')[0] ?? `P${i + 1}`} </span> : null
                            )
                          : <span className="text-green-600">{t('games.allPresent')}</span>
                        }
                      </div>
                      <div>
                        <span className="font-bold text-indigo-600">{team2Name}: </span>
                        {sub.team2Absent.some(Boolean)
                          ? sub.team2Absent.map((absent, i) =>
                              absent ? <span key={i} className="text-red-500">🚫 {game.team2?.players[i]?.name?.split(' ')[0] ?? `P${i + 1}`} </span> : null
                            )
                          : <span className="text-green-600">{t('games.allPresent')}</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {sub.matches.map((matchData, mIdx) => (
                      <div key={mIdx} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                          {t('games.matchScore').replace('{{num}}', String(mIdx + 1))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Team 1 */}
                          <div>
                            <div className="text-xs font-bold text-orange-600 mb-1">{team1Name}</div>
                            <div className="flex gap-1 flex-wrap">
                              {matchData.team1Pins.map((pins, pIdx) => (
                                <div key={pIdx} className="text-center">
                                  <div className="text-xs text-gray-400 truncate max-w-12">
                                    {game.team1?.players[pIdx]?.name?.split(' ')[0] ?? `P${pIdx + 1}`}
                                  </div>
                                  <div className="bg-orange-100 border border-orange-200 rounded px-2 py-1 text-sm font-bold text-gray-800 min-w-10">
                                    {pins || '—'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Team 2 */}
                          <div>
                            <div className="text-xs font-bold text-indigo-600 mb-1">{team2Name}</div>
                            <div className="flex gap-1 flex-wrap">
                              {matchData.team2Pins.map((pins, pIdx) => (
                                <div key={pIdx} className="text-center">
                                  <div className="text-xs text-gray-400 truncate max-w-12">
                                    {game.team2?.players[pIdx]?.name?.split(' ')[0] ?? `P${pIdx + 1}`}
                                  </div>
                                  <div className="bg-indigo-100 border border-indigo-200 rounded px-2 py-1 text-sm font-bold text-gray-800 min-w-10">
                                    {pins || '—'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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

