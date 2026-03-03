import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { scoreApi } from '../../services/api/scoreApi';
import { boardApi } from '../../services/api/boardApi';
import { getPlayerDisplayName } from '../../utils/playerUtils';
import { useTranslation } from '../../contexts/LanguageContext';
import type { Game, Player, ScoreSubmission } from '../../types/index';

type Step = 'loading' | 'error' | 'closed' | 'no-roster' | 'select' | 'enter' | 'success';

interface TeamPlayer {
  index: number;
  name: string;
}

export const PlayerScoreEntry: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('loading');
  const [game, setGame] = useState<Game | null>(null);
  const [team1Players, setTeam1Players] = useState<TeamPlayer[]>([]);
  const [team2Players, setTeam2Players] = useState<TeamPlayer[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | ''>('');
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(-1);
  const [scores, setScores] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!gameId) { setStep('error'); return; }

    const load = async () => {
      const gameData = await scoreApi.getGame(gameId);
      if (!gameData) { setStep('error'); return; }
      if (gameData.status === 'completed') { setStep('closed'); return; }

      setGame(gameData);

      // Build team player lists from game data or fall back to players API
      const buildPlayers = async (playerIds: string[], gameTeamPlayers?: { name: string }[]): Promise<TeamPlayer[]> => {
        if (gameTeamPlayers && gameTeamPlayers.length > 0) {
          return gameTeamPlayers.map((p, i) => ({ index: i, name: p.name }));
        }
        // Fall back: load from players API
        const players: Player[] = await boardApi.getPlayersByIds(playerIds);
        const idMap: Record<string, Player> = {};
        players.forEach(p => { idMap[p.id] = p; });
        return playerIds.map((id, i) => ({
          index: i,
          name: idMap[id] ? getPlayerDisplayName(idMap[id]) : `Player ${i + 1}`,
        }));
      };

      // Load both teams
      const teamsData = await boardApi.getTeamsBySeason(gameData.seasonId);
      const t1 = teamsData.find(t => t.id === gameData.team1Id);
      const t2 = teamsData.find(t => t.id === gameData.team2Id);

      if (!t1 || !t2) { setStep('no-roster'); return; }

      const [p1, p2] = await Promise.all([
        buildPlayers(t1.playerIds, gameData.team1?.players),
        buildPlayers(t2.playerIds, gameData.team2?.players),
      ]);

      if (p1.length === 0 || p2.length === 0) { setStep('no-roster'); return; }

      setTeam1Players(p1);
      setTeam2Players(p2);
      setScores(Array(gameData.matchesPerGame).fill(''));
      setStep('select');
    };

    load().catch(() => setStep('error'));
  }, [gameId]);

  const teamPlayers = selectedTeam === 'team1' ? team1Players : team2Players;
  const teamName = selectedTeam === 'team1' ? game?.team1?.name || t('games.team1Default')
    : selectedTeam === 'team2' ? game?.team2?.name || t('games.team2Default') : '';

  const handleTeamSelect = (team: 'team1' | 'team2') => {
    setSelectedTeam(team);
    setSelectedPlayerIndex(-1);
    setErrorMsg('');
  };

  const handleContinueToScores = () => {
    if (!selectedTeam || selectedPlayerIndex < 0) return;
    // Check for duplicate submission
    const existing = game?.pendingScores ?? [];
    const duplicate = existing.some(
      s => s.team === selectedTeam && s.playerIndex === selectedPlayerIndex
    );
    if (duplicate) {
      setErrorMsg(t('scoreEntry.alreadySubmitted'));
      return;
    }
    setErrorMsg('');
    setStep('enter');
  };

  const handleScoreChange = (matchIdx: number, value: string) => {
    const updated = [...scores];
    updated[matchIdx] = value;
    setScores(updated);
  };

  const handleSubmit = async () => {
    if (!gameId || !game || !selectedTeam || selectedPlayerIndex < 0) return;

    // Validate
    for (const sc of scores) {
      const n = parseInt(sc);
      if (sc === '' || isNaN(n) || n < 0 || n > 300) {
        setErrorMsg(t('scoreEntry.invalidScore'));
        return;
      }
    }

    const playerName = teamPlayers[selectedPlayerIndex]?.name ?? '';
    const submission: ScoreSubmission = {
      id: crypto.randomUUID(),
      playerName,
      team: selectedTeam,
      playerIndex: selectedPlayerIndex,
      scores: [...scores],
      submittedAt: new Date().toISOString(),
    };

    setSubmitting(true);
    const ok = await scoreApi.submitScores(gameId, submission);
    setSubmitting(false);

    if (ok) {
      setStep('success');
    } else {
      setErrorMsg(t('scoreEntry.loadError'));
    }
  };

  const handleReset = () => {
    setSelectedTeam('');
    setSelectedPlayerIndex(-1);
    setScores(Array(game?.matchesPerGame ?? 3).fill(''));
    setErrorMsg('');
    setStep('select');
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-700">{t('scoreEntry.gameNotFound')}</p>
        </div>
      </div>
    );
  }

  if (step === 'closed') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-gray-700">{t('scoreEntry.gameClosed')}</p>
        </div>
      </div>
    );
  }

  if (step === 'no-roster') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-700">{t('scoreEntry.teamNotSetUp')}</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="text-5xl mb-4">🎳</div>
          <h2 className="text-2xl font-bold text-green-600 mb-3">{t('scoreEntry.successTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('scoreEntry.successMessage')}</p>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            {t('scoreEntry.submitAnother')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6 mb-6 text-center shadow-lg">
          <div className="text-3xl mb-2">🎳</div>
          <h1 className="text-2xl font-bold mb-1">{t('scoreEntry.title')}</h1>
          {game && (
            <p className="text-blue-200 text-sm">
              {t('scoreEntry.subtitle')
                .replace('{{matchDay}}', String(game.matchDay))
                .replace('{{round}}', String(game.round))}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Step 1: Select team */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('scoreEntry.selectTeam')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['team1', 'team2'] as const).map(teamKey => {
                const name = teamKey === 'team1'
                  ? game?.team1?.name || t('games.team1Default')
                  : game?.team2?.name || t('games.team2Default');
                return (
                  <button
                    key={teamKey}
                    onClick={() => handleTeamSelect(teamKey)}
                    className={`py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                      selectedTeam === teamKey
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select player */}
          {selectedTeam && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('scoreEntry.selectPlayer')}
              </label>
              <select
                value={selectedPlayerIndex >= 0 ? String(selectedPlayerIndex) : ''}
                onChange={e => setSelectedPlayerIndex(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">— {t('scoreEntry.selectPlayer')} —</option>
                {teamPlayers.map(p => (
                  <option key={p.index} value={p.index}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Enter scores */}
          {step === 'enter' && selectedTeam && selectedPlayerIndex >= 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3">
                {t('scoreEntry.enterScores')} — <span className="text-blue-600">{teamName} · {teamPlayers[selectedPlayerIndex]?.name}</span>
              </div>
              <div className="space-y-3">
                {scores.map((sc, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">
                      {t('scoreEntry.matchNumber').replace('{{num}}', String(i + 1))}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={sc}
                      onChange={e => handleScoreChange(i, e.target.value)}
                      placeholder="0–300"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Action buttons */}
          {step === 'select' && selectedTeam && selectedPlayerIndex >= 0 && (
            <button
              onClick={handleContinueToScores}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('common.next')} →
            </button>
          )}

          {step === 'enter' && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? t('scoreEntry.submitting') : t('scoreEntry.submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
