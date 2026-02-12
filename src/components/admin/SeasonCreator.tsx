import React, { useState, useEffect } from 'react';
import { HandicapConfigurationForm } from './HandicapConfigurationForm';
import { playersApi, leaguesApi } from '../../services/api';
import { useTranslation } from '../../contexts/LanguageContext';
import type { SeasonCreatorProps } from '../../types/index';

export const SeasonCreator: React.FC<SeasonCreatorProps> = ({ leagueId, onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [league, setLeague] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    numberOfTeams: 2,
    playersPerTeam: 3,
    numberOfRounds: 1,
    matchesPerGame: 1,
    useHandicap: true,
    handicapBasis: 160,
    handicapPercentage: 100,
    bonusRules: [
      { threshold: 50, points: 1 },
      { threshold: 70, points: 2 },
    ],
    teamAllPresentBonusEnabled: false,
    teamAllPresentBonusPoints: 1,
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [inheritLeagueConfig, setInheritLeagueConfig] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [playerAverages, setPlayerAverages] = useState<{ [playerId: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      const leagueData = await leaguesApi.getById(leagueId);
      setLeague(leagueData);
      setFormData((prev: any) => ({
        ...prev,
        playersPerTeam: leagueData?.defaultPlayersPerTeam || 3,
        matchesPerGame: leagueData?.defaultMatchesPerGame || 1,
        useHandicap: leagueData?.useHandicap ?? true,
        handicapBasis: (leagueData as any)?.handicapBasis ?? 160,
        handicapPercentage: leagueData?.handicapPercentage ?? 100,
        teamAllPresentBonusEnabled: leagueData?.teamAllPresentBonusEnabled || false,
        teamAllPresentBonusPoints: leagueData?.teamAllPresentBonusPoints || 1,
      }));
      const players = await playersApi.getAll();
      setAvailablePlayers(players);
    };
    fetchData();
  }, [leagueId]);

  // --- Team assignment logic ---
  const handleTeamNameChange = (teamIndex: number, name: string) => {
    const newTeams = [...teams];
    newTeams[teamIndex].name = name;
    setTeams(newTeams);
  };
  const handleAssignPlayer = (teamIndex: number, playerId: string) => {
    const newTeams = [...teams];
    if (!newTeams[teamIndex].playerIds.includes(playerId)) {
      newTeams[teamIndex].playerIds.push(playerId);
      setTeams(newTeams);
    }
  };
  const handleRemovePlayer = (teamIndex: number, playerId: string) => {
    const newTeams = [...teams];
    newTeams[teamIndex].playerIds = newTeams[teamIndex].playerIds.filter((id: string) => id !== playerId);
    setTeams(newTeams);
  };
  const getAssignedPlayers = (excludeTeamIndex: number) => {
    return new Set(
      teams
        .filter((_, i) => i !== excludeTeamIndex)
        .flatMap(t => t.playerIds)
    );
  };

  // --- Step 1: Season details ---
  if (!league) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading league data...</p>
      </div>
    );
  }
  if (step === 1) {
    // Helper: get value from league or formData depending on inheritLeagueConfig
    const getValue = (key: string) => {
      if (inheritLeagueConfig) {
        if (key === 'numberOfTeams') return league?.numberOfTeams || 8;
        if (key === 'numberOfRounds') return league?.numberOfRounds || 2;
        return league?.[key];
      }
      return formData[key];
    };
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('seasons.createSeason')}</h1>
              <p className="text-gray-600">{league.name}</p>
            </div>
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
              {t('common.leftArrow')} {t('seasons.backToLeague')}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={e => { e.preventDefault();
            const newTeams = Array.from({ length: getValue('numberOfTeams') }, (_, i) => ({ name: `Team ${i + 1}`, playerIds: [] }));
            setTeams(newTeams);
            setStep(2);
          }} className="space-y-4">

            {/* Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('seasons.seasonName')} *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Spring 2026, Fall Season" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.description')}</label>
                <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t('leagues.briefDescription')} rows={2} />
              </div>
              <div className="md:col-span-2 flex items-center mb-4">
                <input
                  type="checkbox"
                  id="inheritLeagueConfig"
                  checked={inheritLeagueConfig}
                  onChange={e => {
                    setInheritLeagueConfig(e.target.checked);
                    if (e.target.checked) {
                      // Reset formData to league values for all inheritable fields
                      setFormData((prev: any) => ({
                        ...prev,
                        lineupStrategy: league?.lineupStrategy || 'flexible',
                        lineupRule: league?.lineupRule || 'standard',
                        playerMatchPointsPerWin: league?.playerMatchPointsPerWin || 1,
                        teamMatchPointsPerWin: league?.teamMatchPointsPerWin || 1,
                        teamGamePointsPerWin: league?.teamGamePointsPerWin || 2,
                        useHandicap: league?.useHandicap ?? true,
                        handicapBasis: league?.handicapBasis ?? 160,
                        handicapPercentage: league?.handicapPercentage ?? 100,
                        bonusRules: league?.bonusRules ? JSON.parse(JSON.stringify(league.bonusRules)) : [ { threshold: 50, points: 1 }, { threshold: 70, points: 2 } ],
                        teamAllPresentBonusEnabled: league?.teamAllPresentBonusEnabled || false,
                        teamAllPresentBonusPoints: league?.teamAllPresentBonusPoints || 1,
                      }));
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor="inheritLeagueConfig" className="text-sm font-semibold text-gray-700">
                  {t('seasons.inheritFromLeagueConfig')}
                </label>
              </div>
            </div>

            {/* General Configurations */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.generalConfiguration')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('seasons.numberOfTeams')} *</label>
                  <input type="number" min="2" max="20" value={getValue('numberOfTeams')} onChange={e => setFormData({ ...formData, numberOfTeams: parseInt(e.target.value) })} className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent${inheritLeagueConfig ? ' bg-gray-100 cursor-not-allowed' : ''}`} required disabled={inheritLeagueConfig} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('seasons.playersPerTeam')} *</label>
                  <input type="number" min="1" max="10" value={formData.playersPerTeam} onChange={e => setFormData({ ...formData, playersPerTeam: parseInt(e.target.value) })} className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent${inheritLeagueConfig ? ' bg-gray-100 cursor-not-allowed' : ''}`} required disabled={inheritLeagueConfig} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('seasons.numberOfRounds')} *</label>
                  <input type="number" min="1" max="10" value={getValue('numberOfRounds')} onChange={e => setFormData({ ...formData, numberOfRounds: parseInt(e.target.value) })} className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent${inheritLeagueConfig ? ' bg-gray-100 cursor-not-allowed' : ''}`} required disabled={inheritLeagueConfig} />
                  <p className="text-xs text-gray-500 mt-1">{t('seasons.roundExplanation')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('seasons.matchesPerGame')}</label>
                  <input type="number" min="1" max="5" value={formData.matchesPerGame} onChange={e => setFormData({ ...formData, matchesPerGame: parseInt(e.target.value) })} className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent${inheritLeagueConfig ? ' bg-gray-100 cursor-not-allowed' : ''}`} disabled={inheritLeagueConfig} />
                  <p className="text-xs text-gray-500 mt-1">{t('seasons.matchesExplanation')}</p>
                </div>
                {league?.dayOfWeek && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.leagueDay')}</label>
                    <input type="text" value={league.dayOfWeek} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" disabled />
                    <p className="text-xs text-gray-500 mt-1">{t('leagues.dayPlayed')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Player Matchup Strategy Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.playerMatchupConfiguration')}</h3>
              <p className="text-sm text-gray-600 mb-3">{t('leagues.lineup.strategyDesc')}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.lineup.strategyLabel')}</label>
                  <select
                    value={getValue('lineupStrategy') || 'flexible'}
                    onChange={e => setFormData({ ...formData, lineupStrategy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={inheritLeagueConfig}
                  >
                    <option value="flexible">{t('leagues.lineup.flexible')}</option>
                    <option value="fixed">{t('leagues.lineup.fixed')}</option>
                    <option value="rule-based">{t('leagues.lineup.ruleBased')}</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.lineupStrategy === 'flexible' && t('leagues.lineup.flexibleDesc')}
                    {formData.lineupStrategy === 'rule-based' && t('leagues.lineup.ruleBasedDesc')}
                  </p>
                </div>
                {formData.lineupStrategy === 'rule-based' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.lineup.rankingRuleLabel')}</label>
                    <select
                      value={getValue('lineupRule') || 'standard'}
                      onChange={e => setFormData({ ...formData, lineupRule: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={inheritLeagueConfig}
                    >
                      <option value="standard">{t('leagues.lineup.standard')}</option>
                      <option value="balanced">{t('leagues.lineup.balanced')}</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.lineupRule === 'standard' && t('leagues.lineup.standardDesc')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Points Configuration Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.points.config')}</h3>
              <p className="text-sm text-gray-600 mb-3">{t('leagues.points.configDesc')}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.points.playerMatchPerWin')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={getValue('playerMatchPointsPerWin') || 1}
                    onChange={e => setFormData({ ...formData, playerMatchPointsPerWin: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={inheritLeagueConfig}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('leagues.points.playerMatchPerWinDesc')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.points.teamMatchPerWin')}</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={getValue('teamMatchPointsPerWin') || 1}
                    onChange={e => setFormData({ ...formData, teamMatchPointsPerWin: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={inheritLeagueConfig}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('leagues.points.teamMatchPerWinDesc')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.points.teamGamePerWin')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={getValue('teamGamePointsPerWin') || 2}
                    onChange={e => setFormData({ ...formData, teamGamePointsPerWin: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={inheritLeagueConfig}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('leagues.points.teamGamePerWinDesc')}</p>
                </div>
              </div>
            </div>

            {/* Handicap Settings Section */}
            <div className="border-t pt-4 mt-4">
              <HandicapConfigurationForm
                useHandicap={getValue('useHandicap')}
                handicapBasis={getValue('handicapBasis')}
                handicapPercentage={getValue('handicapPercentage')}
                onUseHandicapChange={(value: boolean) => setFormData({ ...formData, useHandicap: value })}
                onHandicapBasisChange={(value: number) => setFormData({ ...formData, handicapBasis: value })}
                onHandicapPercentageChange={(value: number) => setFormData({ ...formData, handicapPercentage: value })}
                basisFieldName="handicapBasis"
                showDescription={true}
                disabled={inheritLeagueConfig}
              />
            </div>


            {/* Bonus Rules Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.bonus.bonusPointsConfiguration')}</h3>
              <p className="text-sm text-gray-600 mb-3">{t('leagues.bonus.rulesDesc')}</p>
              <div className="space-y-2">
                {/* Team All Present Bonus Option */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="teamAllPresentBonusEnabled"
                    checked={inheritLeagueConfig ? league?.teamAllPresentBonusEnabled : formData.teamAllPresentBonusEnabled}
                    onChange={e => {
                      if (inheritLeagueConfig) return;
                      setFormData({ ...formData, teamAllPresentBonusEnabled: e.target.checked });
                    }}
                    className="mr-2"
                    disabled={inheritLeagueConfig}
                  />
                  <label htmlFor="teamAllPresentBonusEnabled" className="text-sm font-semibold text-gray-700">
                    {t('leagues.bonus.allPresentLabel')}
                  </label>
                  {(inheritLeagueConfig ? league?.teamAllPresentBonusEnabled : formData.teamAllPresentBonusEnabled) && (
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={inheritLeagueConfig ? league?.teamAllPresentBonusPoints : formData.teamAllPresentBonusPoints}
                      onChange={e => {
                        if (inheritLeagueConfig) return;
                        setFormData({ ...formData, teamAllPresentBonusPoints: Number(e.target.value) });
                      }}
                      className="ml-4 w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      disabled={inheritLeagueConfig}
                    />
                  )}
                  {(inheritLeagueConfig ? league?.teamAllPresentBonusEnabled : formData.teamAllPresentBonusEnabled) && (
                    <span className="ml-2 text-xs text-gray-500">{t('leagues.bonus.allPresentPoints')}</span>
                  )}
                </div>
                {/* Player/Team Bonus Rules */}
                {(inheritLeagueConfig ? (league?.bonusRules || []) : formData.bonusRules).map((rule: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">{t('leagues.bonusRules.bonusIfScoreAtLeast')}</label>
                    <input
                      type="number"
                      min="0"
                      value={rule.threshold}
                      onChange={e => {
                        if (inheritLeagueConfig) return;
                        const newRules = [...formData.bonusRules];
                        newRules[idx].threshold = parseInt(e.target.value);
                        setFormData({ ...formData, bonusRules: newRules });
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded"
                      disabled={inheritLeagueConfig}
                    />
                    <span className="text-sm text-gray-700">{t('leagues.bonusRules.bonusPins')}</span>
                    <input
                      type="number"
                      min="1"
                      value={rule.points}
                      onChange={e => {
                        if (inheritLeagueConfig) return;
                        const newRules = [...formData.bonusRules];
                        newRules[idx].points = parseInt(e.target.value);
                        setFormData({ ...formData, bonusRules: newRules });
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                      disabled={inheritLeagueConfig}
                    />
                    <span className="text-sm text-gray-700">{t('leagues.bonusRules.bonusPoints')}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (inheritLeagueConfig) return;
                        const newRules = formData.bonusRules.filter((_: any, i: number) => i !== idx);
                        setFormData({ ...formData, bonusRules: newRules });
                      }}
                      title={t('common.remove')}
                      disabled={inheritLeagueConfig}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {!inheritLeagueConfig && (
                  <button
                    type="button"
                    className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    onClick={() => setFormData({ ...formData, bonusRules: [...formData.bonusRules, { threshold: 0, points: 1 }] })}
                  >
                    {t('leagues.bonus.addRule')}
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">{t('common.cancel')}</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">{t('common.next')}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Team assignment
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('seasons.assignPlayers')}</h1>
              <p className="text-gray-600">{t('seasons.assignPlayersDesc').replace('{{count}}', String(formData.playersPerTeam))}</p>
            </div>
            <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-800">{t('common.leftArrow')} {t('common.back')}</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={e => { e.preventDefault(); setStep(3); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((team, teamIdx) => (
                <div key={teamIdx} className="border rounded-lg p-4 bg-gray-50">
                  <input type="text" value={team.name} onChange={e => handleTeamNameChange(teamIdx, e.target.value)} className="mb-2 w-full px-2 py-1 border border-gray-300 rounded" />
                  <div className="mb-2 text-xs text-gray-500">{t('seasons.teamRoster')}</div>
                  <ul className="mb-2">
                    {team.playerIds.map((playerId: string) => {
                      const player = availablePlayers.find((p: any) => p.id === playerId);
                      return (
                        <li key={playerId} className="flex items-center justify-between mb-1">
                          <span>{player?.name || 'Unknown'}</span>
                          <button type="button" onClick={() => handleRemovePlayer(teamIdx, playerId)} className="text-xs text-red-500 ml-2">{t('common.remove')}</button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mb-1 text-xs text-gray-500">{t('seasons.addPlayer')}</div>
                  <select
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    value=""
                    onChange={e => {
                      if (e.target.value) handleAssignPlayer(teamIdx, e.target.value);
                    }}
                  >
                    <option value="">{t('seasons.selectPlayer')}</option>
                    {availablePlayers.filter(p => !getAssignedPlayers(teamIdx).has(p.id)).map((player: any) => (
                      <option key={player.id} value={player.id}>{player.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">{t('common.back')}</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">{t('common.next')}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Review/edit player averages (already present)

  // --- Final submit handler ---
  const handleFinalSubmit = async () => {
    // Basic validation
    if (!formData.name || teams.length < 2 || teams.some(t => t.playerIds.length !== formData.playersPerTeam)) {
      alert(t('validation.incompleteTeams') || 'Please complete all teams and fill in all required fields.');
      return;
    }
    // Prepare season data (all required fields for Season)
    const today = new Date().toISOString();
    const seasonData = {
      leagueId,
      name: formData.name,
      startDate: today,
      endDate: today,
      numberOfTeams: teams.length,
      numberOfRounds: inheritLeagueConfig ? (league?.numberOfRounds || 1) : formData.numberOfRounds,
      teamAllPresentBonusEnabled: inheritLeagueConfig ? league?.teamAllPresentBonusEnabled : formData.teamAllPresentBonusEnabled,
      teamAllPresentBonusPoints: inheritLeagueConfig ? league?.teamAllPresentBonusPoints : formData.teamAllPresentBonusPoints,
      playersPerTeam: formData.playersPerTeam,
      matchesPerGame: formData.matchesPerGame,
      useHandicap: formData.useHandicap,
      handicapBasis: formData.handicapBasis,
      handicapPercentage: formData.handicapPercentage,
      lineupStrategy: league?.lineupStrategy || 'flexible',
      lineupRule: league?.lineupRule || 'standard',
      bonusRules: league?.bonusRules || [],
      playerMatchPointsPerWin: league?.playerMatchPointsPerWin || 1,
      teamMatchPointsPerWin: league?.teamMatchPointsPerWin || 1,
      teamGamePointsPerWin: league?.teamGamePointsPerWin || 2,
      status: "setup" as const,
      teams: teams.map(team => ({
        name: team.name,
        playerIds: team.playerIds,
      })),
      playerAverages,
    };
    // Save via API
    try {
      const { seasonsApi } = await import('../../services/api');
      const created = await seasonsApi.create(seasonData);
      if (typeof onSuccess === 'function') onSuccess(created.id);
    } catch (err) {
      alert(t('validation.saveError') || 'Error saving season.');
    }
  };
  const allPlayersWithTeams = teams.flatMap(team =>
    team.playerIds.map((playerId: string) => {
      const player = availablePlayers.find((p: any) => p.id === playerId);
      return {
        playerId,
        playerName: player?.name || 'Unknown',
        teamName: team.name,
        average: playerAverages[playerId] || 0
      };
    })
  );
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('seasons.createSeason')}</h1>
            <p className="text-gray-600">{league.name}</p>
          </div>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">{t('common.leftArrow')} {t('seasons.backToLeague')}</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('seasons.reviewPlayerAverages')}</h2>
        <p className="text-gray-600 mb-6">{t('seasons.reviewPlayerAveragesDesc')}</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('seasons.playerName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.team')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('seasons.average')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allPlayersWithTeams.map((player) => (
                <tr key={player.playerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.playerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.teamName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      step="0.1"
                      value={player.average}
                      onChange={e => {
                        const newAvg = parseFloat(e.target.value) || 0;
                        setPlayerAverages(prev => ({ ...prev, [player.playerId]: newAvg }));
                      }}
                      className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => setStep(2)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">{t('common.leftArrow')} {t('common.back')}</button>
          <button type="button" onClick={handleFinalSubmit} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">{t('seasons.createSeason')}</button>
          <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
};
