import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { scoreApi } from '../../services/api/scoreApi';
import { boardApi } from '../../services/api/boardApi';
import { getPlayerDisplayName } from '../../utils/playerUtils';
import { useTranslation } from '../../contexts/LanguageContext';
import type { Game, Player, ScoreSubmission } from '../../types/index';

type PageState = 'loading' | 'error' | 'closed' | 'no-roster' | 'prematch' | 'match' | 'success';

interface TeamPlayer { name: string; }

const buildEmptyScores = (matchCount: number, t1Size: number, t2Size: number) =>
  Array.from({ length: matchCount }, () => ({
    team1Pins: Array<string>(t1Size).fill(''),
    team2Pins: Array<string>(t2Size).fill(''),
  }));

/** Generate a UUID, with a timestamp-based fallback for older browsers */
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

export const PlayerScoreEntry: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { t } = useTranslation();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [game, setGame] = useState<Game | null>(null);
  const [team1Players, setTeam1Players] = useState<TeamPlayer[]>([]);
  const [team2Players, setTeam2Players] = useState<TeamPlayer[]>([]);
  const [team1Absent, setTeam1Absent] = useState<boolean[]>([]);
  const [team2Absent, setTeam2Absent] = useState<boolean[]>([]);
  const [scores, setScores] = useState<{ team1Pins: string[]; team2Pins: string[] }[]>([]);
  const [activeMatch, setActiveMatch] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!gameId) { setPageState('error'); return; }
    const load = async () => {
      const gameData = await scoreApi.getGame(gameId);
      if (!gameData) { setPageState('error'); return; }
      if (gameData.status === 'completed') { setPageState('closed'); return; }
      setGame(gameData);

      const buildPlayers = async (
        playerIds: string[],
        gameTeamPlayers?: { name: string }[],
      ): Promise<TeamPlayer[]> => {
        if (gameTeamPlayers && gameTeamPlayers.length > 0) {
          return gameTeamPlayers.map(p => ({ name: p.name }));
        }
        const players: Player[] = await boardApi.getPlayersByIds(playerIds);
        const idMap: Record<string, Player> = {};
        players.forEach(p => { idMap[p.id] = p; });
        return playerIds.map((id, i) => ({
          name: idMap[id] ? getPlayerDisplayName(idMap[id]) : `Player ${i + 1}`,
        }));
      };

      const teamsData = await boardApi.getTeamsBySeason(gameData.seasonId);
      const t1 = teamsData.find(tm => tm.id === gameData.team1Id);
      const t2 = teamsData.find(tm => tm.id === gameData.team2Id);
      if (!t1 || !t2) { setPageState('no-roster'); return; }

      const [p1, p2] = await Promise.all([
        buildPlayers(t1.playerIds, gameData.team1?.players),
        buildPlayers(t2.playerIds, gameData.team2?.players),
      ]);
      if (p1.length === 0 || p2.length === 0) { setPageState('no-roster'); return; }

      setTeam1Players(p1);
      setTeam2Players(p2);
      setTeam1Absent(Array<boolean>(p1.length).fill(false));
      setTeam2Absent(Array<boolean>(p2.length).fill(false));
      setScores(buildEmptyScores(gameData.matchesPerGame, p1.length, p2.length));
      setPageState('prematch');
    };
    load().catch(() => setPageState('error'));
  }, [gameId]);

  const toggleAbsent = (team: 'team1' | 'team2', idx: number) => {
    if (team === 'team1') setTeam1Absent(prev => prev.map((v, i) => i === idx ? !v : v));
    else setTeam2Absent(prev => prev.map((v, i) => i === idx ? !v : v));
  };

  const handlePinChange = (matchIdx: number, team: 'team1' | 'team2', playerIdx: number, value: string) => {
    setScores(prev => prev.map((m, i) => i !== matchIdx ? m : {
      team1Pins: team === 'team1' ? m.team1Pins.map((p, j) => j === playerIdx ? value : p) : m.team1Pins,
      team2Pins: team === 'team2' ? m.team2Pins.map((p, j) => j === playerIdx ? value : p) : m.team2Pins,
    }));
    setErrorMsg('');
  };

  const validate = (): boolean => {
    for (let mIdx = 0; mIdx < scores.length; mIdx++) {
      const m = scores[mIdx];
      if (!m) return false;
      for (let pIdx = 0; pIdx < team1Players.length; pIdx++) {
        if (team1Absent[pIdx]) continue;
        const v = m.team1Pins[pIdx] ?? '';
        const n = parseInt(v);
        if (v === '' || isNaN(n) || n < 0 || n > 300) return false;
      }
      for (let pIdx = 0; pIdx < team2Players.length; pIdx++) {
        if (team2Absent[pIdx]) continue;
        const v = m.team2Pins[pIdx] ?? '';
        const n = parseInt(v);
        if (v === '' || isNaN(n) || n < 0 || n > 300) return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!gameId || !game) return;
    if (!validate()) { setErrorMsg(t('scoreEntry.invalidScore')); return; }
    const submission: ScoreSubmission = {
      id: generateId(),
      submittedAt: new Date().toISOString(),
      team1Absent,
      team2Absent,
      matches: scores,
    };
    setSubmitting(true);
    const ok = await scoreApi.submitScores(gameId, submission);
    setSubmitting(false);
    if (ok) setPageState('success');
    else setErrorMsg(t('scoreEntry.loadError'));
  };

  const resetForm = () => {
    if (!game) return;
    setTeam1Absent(Array<boolean>(team1Players.length).fill(false));
    setTeam2Absent(Array<boolean>(team2Players.length).fill(false));
    setScores(buildEmptyScores(game.matchesPerGame, team1Players.length, team2Players.length));
    setActiveMatch(0);
    setErrorMsg('');
    setPageState('prematch');
  };

  // ─── Static screens ─────────────────────────────────────────────────────────
  if (pageState === 'loading') return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    </div>
  );
  if (pageState === 'error') return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-700">{t('scoreEntry.gameNotFound')}</p>
      </div>
    </div>
  );
  if (pageState === 'closed') return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <p className="text-gray-700">{t('scoreEntry.gameClosed')}</p>
      </div>
    </div>
  );
  if (pageState === 'no-roster') return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-gray-700">{t('scoreEntry.teamNotSetUp')}</p>
      </div>
    </div>
  );
  if (pageState === 'success') return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
        <div className="text-5xl mb-4">🎳</div>
        <h2 className="text-2xl font-bold text-green-600 mb-3">{t('scoreEntry.successTitle')}</h2>
        <p className="text-gray-600 mb-6">{t('scoreEntry.successMessage')}</p>
        <button onClick={resetForm} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
          {t('scoreEntry.submitAnother')}
        </button>
      </div>
    </div>
  );

  // ─── Common UI ──────────────────────────────────────────────────────────────
  const team1Name = game?.team1?.name || t('scoreEntry.team1Label');
  const team2Name = game?.team2?.name || t('scoreEntry.team2Label');
  const totalMatches = game?.matchesPerGame ?? scores.length;
  const totalSteps = 1 + totalMatches;
  const currentStep = pageState === 'prematch' ? 0 : activeMatch + 1;

  const header = (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-5 mb-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-xl font-bold">🎳 {t('scoreEntry.title')}</div>
        {game && (
          <p className="text-blue-200 text-sm">
            {t('scoreEntry.subtitle')
              .replace('{{matchDay}}', String(game.matchDay))
              .replace('{{round}}', String(game.round))}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
        <span className="bg-orange-500 rounded-lg px-3 py-1">{team1Name}</span>
        <span className="text-blue-300">{t('print.vs')}</span>
        <span className="bg-indigo-500 rounded-lg px-3 py-1">{team2Name}</span>
      </div>
      <div className="flex gap-1 overflow-x-auto">
        {Array.from({ length: totalSteps }, (_, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          const label = i === 0
            ? t('scoreEntry.stepPreMatch')
            : t('scoreEntry.stepMatch').replace('{{num}}', String(i));
          return (
            <div key={i} className={`shrink-0 px-2 py-1 rounded text-xs font-semibold ${isActive ? 'bg-white text-blue-700' : isDone ? 'bg-blue-400 text-white' : 'bg-blue-800 text-blue-300'}`}>
              {isDone ? '✓ ' : ''}{label}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Pre-match ──────────────────────────────────────────────────────────────
  if (pageState === 'prematch') return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        {header}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{t('scoreEntry.preMatchTitle')}</h2>
          <p className="text-sm text-gray-500 mb-5">{t('scoreEntry.preMatchDesc')}</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-bold text-orange-600 mb-3 pb-1 border-b border-orange-200">{team1Name}</div>
              <div className="space-y-2">
                {team1Players.map((player, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${team1Absent[idx] ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <span className={`text-sm font-medium truncate flex-1 mr-2 ${team1Absent[idx] ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {idx + 1}. {player.name}
                    </span>
                    <button
                      onClick={() => toggleAbsent('team1', idx)}
                      className={`shrink-0 text-xs px-2 py-1 rounded font-semibold transition-colors ${team1Absent[idx] ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                      {team1Absent[idx] ? t('scoreEntry.markAbsent') : t('scoreEntry.markPresent')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-indigo-600 mb-3 pb-1 border-b border-indigo-200">{team2Name}</div>
              <div className="space-y-2">
                {team2Players.map((player, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${team2Absent[idx] ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <span className={`text-sm font-medium truncate flex-1 mr-2 ${team2Absent[idx] ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {idx + 1}. {player.name}
                    </span>
                    <button
                      onClick={() => toggleAbsent('team2', idx)}
                      className={`shrink-0 text-xs px-2 py-1 rounded font-semibold transition-colors ${team2Absent[idx] ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                      {team2Absent[idx] ? t('scoreEntry.markAbsent') : t('scoreEntry.markPresent')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setActiveMatch(0); setPageState('match'); }}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          {t('common.next')} →
        </button>
      </div>
    </div>
  );

  // ─── Match scoring ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        {header}
        {totalMatches > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {Array.from({ length: totalMatches }, (_, i) => (
              <button key={i} onClick={() => setActiveMatch(i)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeMatch === i ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}
              >
                {t('scoreEntry.matchNumber').replace('{{num}}', String(i + 1))}
              </button>
            ))}
          </div>
        )}
        {scores[activeMatch] && (
          <div className="bg-white rounded-xl shadow-lg p-5 mb-4">
            <h2 className="text-center text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
              {t('scoreEntry.matchNumber').replace('{{num}}', String(activeMatch + 1))}
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-center text-sm font-bold text-orange-600 mb-3 pb-1 border-b border-orange-200">{team1Name}</div>
                <div className="space-y-2">
                  {team1Players.map((player, pIdx) => (
                    <div key={pIdx} className={team1Absent[pIdx] ? 'opacity-40' : ''}>
                      <label className="text-xs text-gray-500 mb-0.5 block truncate">{team1Absent[pIdx] ? '🚫 ' : ''}{player.name}</label>
                      <input
                        type="number" min={0} max={300}
                        disabled={!!team1Absent[pIdx]}
                        value={scores[activeMatch]?.team1Pins[pIdx] ?? ''}
                        onChange={e => handlePinChange(activeMatch, 'team1', pIdx, e.target.value)}
                        placeholder={team1Absent[pIdx] ? '—' : '0–300'}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-lg font-bold focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-center text-sm font-bold text-indigo-600 mb-3 pb-1 border-b border-indigo-200">{team2Name}</div>
                <div className="space-y-2">
                  {team2Players.map((player, pIdx) => (
                    <div key={pIdx} className={team2Absent[pIdx] ? 'opacity-40' : ''}>
                      <label className="text-xs text-gray-500 mb-0.5 block truncate">{team2Absent[pIdx] ? '🚫 ' : ''}{player.name}</label>
                      <input
                        type="number" min={0} max={300}
                        disabled={!!team2Absent[pIdx]}
                        value={scores[activeMatch]?.team2Pins[pIdx] ?? ''}
                        onChange={e => handlePinChange(activeMatch, 'team2', pIdx, e.target.value)}
                        placeholder={team2Absent[pIdx] ? '—' : '0–300'}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-lg font-bold focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => activeMatch === 0 ? setPageState('prematch') : setActiveMatch(m => m - 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-blue-300 transition-colors"
          >
            ← {t('common.previous')}
          </button>
          {activeMatch < totalMatches - 1 && (
            <button
              onClick={() => setActiveMatch(m => m + 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-blue-300 transition-colors"
            >
              {t('common.next')} →
            </button>
          )}
        </div>
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{errorMsg}</div>
        )}
        {activeMatch === totalMatches - 1 && (
          <button
            onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
          >
            {submitting ? t('scoreEntry.submitting') : t('scoreEntry.submit')}
          </button>
        )}
      </div>
    </div>
  );
};
