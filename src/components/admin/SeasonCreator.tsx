import React, { useState, useEffect } from 'react';
import { HandicapConfigurationForm } from './shared/HandicapConfigurationForm';
import { PointsConfiguration } from './shared/PointsConfiguration';
import { GeneralConfiguration } from './shared/GeneralConfiguration';
import { BonusRulesConfiguration } from './shared/BonusRulesConfiguration';
import { playersApi, leaguesApi } from '../../services/api';
import { useTranslation } from '../../contexts/LanguageContext';
import { getPlayerDisplayName } from '../../utils/playerUtils';
import type { SeasonCreatorProps, BonusRule, LineupStrategy, LineupRule, League, CurrentPlayerAverages } from '../../types/index';
import { DEFAULT_HANDICAP_BASIS, DEFAULT_HANDICAP_PERCENTAGE, DEFAULT_NUMBER_OF_TEAMS, DEFAULT_NUMBER_OF_ROUNDS, DEFAULT_PLAYERS_PER_TEAM, DEFAULT_MATCHES_PER_GAME, DEFAULT_PLAYER_MATCH_POINTS, DEFAULT_TEAM_MATCH_POINTS, DEFAULT_TEAM_GAME_POINTS, DEFAULT_USE_HANDICAP, DEFAULT_LINEUP_STRATEGY, DEFAULT_LINEUP_RULE, DEFAULT_TEAM_ALL_PRESENT_BONUS_ENABLED, DEFAULT_TEAM_ALL_PRESENT_BONUS_POINTS } from '../../constants/bowling';
import { PlayerMatchupConfiguration } from './shared/PlayerMatchupConfiguration';

// Explicit types for formData, teams, and availablePlayers
type SeasonFormData = {
  name: string;
  description?: string;
  numberOfTeams: number;
  playersPerTeam: number;
  numberOfRounds: number;
  matchesPerGame: number;
  lineupStrategy?: LineupStrategy;
  lineupRule?: LineupRule;
  playerMatchPointsPerWin: number;
  teamMatchPointsPerWin: number;
  teamGamePointsPerWin: number;
  useHandicap: boolean;
  handicapBasis: number;
  handicapPercentage: number;
  teamAllPresentBonusEnabled: boolean;
  teamAllPresentBonusPoints: number;
  bonusRules: BonusRule[];
  dayOfWeek?: string;
};

type Team = {
  name: string;
  playerIds: string[];
};

type Player = {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  [key: string]: any;
};

export const SeasonCreator: React.FC<SeasonCreatorProps> = ({ leagueId, onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [league, setLeague] = useState<League | null>(null);
  const [formData, setFormData] = useState<SeasonFormData>({
    name: '',
    description: '',
    numberOfTeams: DEFAULT_NUMBER_OF_TEAMS,
    playersPerTeam: DEFAULT_PLAYERS_PER_TEAM,
    numberOfRounds: DEFAULT_NUMBER_OF_ROUNDS,
    matchesPerGame: DEFAULT_MATCHES_PER_GAME,
    lineupStrategy: DEFAULT_LINEUP_STRATEGY,
    lineupRule: DEFAULT_LINEUP_RULE,
    playerMatchPointsPerWin: DEFAULT_PLAYER_MATCH_POINTS,
    teamMatchPointsPerWin: DEFAULT_TEAM_MATCH_POINTS,
    teamGamePointsPerWin: DEFAULT_TEAM_GAME_POINTS,
    useHandicap: DEFAULT_USE_HANDICAP,
    handicapBasis: DEFAULT_HANDICAP_BASIS,
    handicapPercentage: DEFAULT_HANDICAP_PERCENTAGE,
    teamAllPresentBonusEnabled: DEFAULT_TEAM_ALL_PRESENT_BONUS_ENABLED,
    teamAllPresentBonusPoints: DEFAULT_TEAM_ALL_PRESENT_BONUS_POINTS,
    bonusRules: [],
    dayOfWeek: '',
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [inheritLeagueConfig, setInheritLeagueConfig] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [playerAverages, setPlayerAverages] = useState<CurrentPlayerAverages>({});

  useEffect(() => {
    const fetchData = async () => {
      const leagueData = await leaguesApi.getById(leagueId);
      setLeague(leagueData ?? null);
      const cfg = leagueData?.defaultSeasonConfigurations;
      setFormData((prev: any) => ({
        ...prev,
        numberOfTeams: cfg?.numberOfTeams || DEFAULT_NUMBER_OF_TEAMS,
        playersPerTeam: cfg?.playersPerTeam || DEFAULT_PLAYERS_PER_TEAM,
        numberOfRounds: cfg?.numberOfRounds || DEFAULT_NUMBER_OF_ROUNDS,
        matchesPerGame: cfg?.matchesPerGame || DEFAULT_MATCHES_PER_GAME,
        lineupStrategy: cfg?.lineupStrategy || DEFAULT_LINEUP_STRATEGY,
        lineupRule: cfg?.lineupRule || DEFAULT_LINEUP_RULE,
        playerMatchPointsPerWin: cfg?.playerMatchPointsPerWin || DEFAULT_PLAYER_MATCH_POINTS,
        teamMatchPointsPerWin: cfg?.teamMatchPointsPerWin || DEFAULT_TEAM_MATCH_POINTS,
        teamGamePointsPerWin: cfg?.teamGamePointsPerWin || DEFAULT_TEAM_GAME_POINTS,
        useHandicap: cfg?.useHandicap ?? DEFAULT_USE_HANDICAP,
        handicapBasis: cfg?.handicapBasis ?? DEFAULT_HANDICAP_BASIS,
        handicapPercentage: cfg?.handicapPercentage ?? DEFAULT_HANDICAP_PERCENTAGE,
        teamAllPresentBonusEnabled: cfg?.teamAllPresentBonusEnabled ?? DEFAULT_TEAM_ALL_PRESENT_BONUS_ENABLED,
        teamAllPresentBonusPoints: cfg?.teamAllPresentBonusPoints ?? DEFAULT_TEAM_ALL_PRESENT_BONUS_POINTS,
        bonusRules: cfg?.bonusRules ? JSON.parse(JSON.stringify(cfg.bonusRules)) : [],
      }));
      const players = await playersApi.getAll();
      setAvailablePlayers(players);
    };
    fetchData();
  }, [leagueId]);

  // --- Team assignment logic ---
  const handleTeamNameChange = (teamIndex: number, name: string) => {
    const newTeams = [...teams];
    if (newTeams[teamIndex]) {
      newTeams[teamIndex].name = name;
      setTeams(newTeams);
    }
  };

  const handleAssignPlayer = (teamIndex: number, playerId: string) => {
    const newTeams = [...teams];
    if (newTeams[teamIndex] && !newTeams[teamIndex].playerIds.includes(playerId)) {
      newTeams[teamIndex].playerIds.push(playerId);
      setTeams(newTeams);
    }
  };

  const handleRemovePlayer = (teamIndex: number, playerId: string) => {
    const newTeams = [...teams];
    if (newTeams[teamIndex]) {
      newTeams[teamIndex].playerIds = newTeams[teamIndex].playerIds.filter((id: string) => id !== playerId);
      setTeams(newTeams);
    }
  };
  
  const getAssignedPlayers = (excludeTeamIndex: number) => {
    return new Set(
      teams
        .filter((_, i) => i !== excludeTeamIndex)
        .flatMap(t => t.playerIds)
    );
  };

    // --- Final submit handler ---
  const handleFinalSubmit = async () => {
    // Basic validation
    if (!formData.name || teams.length < 2 || teams.some(t => t.playerIds.length !== formData.playersPerTeam)) {
      alert(t('validation.incompleteTeams') || 'Please complete all teams and fill in all required fields.');
      return;
    }
    // Prepare season data (all required fields for Season)
    const today = new Date().toISOString();
    const leagueCfg = league?.defaultSeasonConfigurations;
    const seasonData = {
      leagueId,
      name: formData.name,
      startDate: today,
      endDate: today,
      seasonConfigurations: {
        numberOfTeams: teams.length,
        playersPerTeam: formData.playersPerTeam,
        numberOfRounds: formData.numberOfRounds,
        matchesPerGame: formData.matchesPerGame,
        lineupStrategy: leagueCfg?.lineupStrategy || 'flexible' as LineupStrategy,
        lineupRule: leagueCfg?.lineupRule || 'standard' as LineupRule,
        playerMatchPointsPerWin: leagueCfg?.playerMatchPointsPerWin || 1,
        teamMatchPointsPerWin: leagueCfg?.teamMatchPointsPerWin || 1,
        teamGamePointsPerWin: leagueCfg?.teamGamePointsPerWin || 2,
        useHandicap: formData.useHandicap,
        handicapBasis: formData.handicapBasis,
        handicapPercentage: formData.handicapPercentage,
        teamAllPresentBonusEnabled: formData.teamAllPresentBonusEnabled,
        teamAllPresentBonusPoints: formData.teamAllPresentBonusPoints,
        bonusRules: leagueCfg?.bonusRules || [],
      },
      status: "active" as const,
      teams: teams.map(team => ({
        name: team.name,
        playerIds: team.playerIds,
      })),
      playerAverages,
    };

    // Save via API
    try {
      const { seasonsApi, gamesApi, teamsApi } = await import('../../services/api');
      const { generateRoundRobinSchedule } = await import('../../utils/scheduleUtils');
      
      // 1. Create the season
      const created = await seasonsApi.create(seasonData);

      // 2. Create teams in DB and collect their IDs
      type TeamType = { name: string; playerIds: string[] };
      const createdTeams: { id: string; name: string }[] = [];
      for (const team of teams as TeamType[]) {
        const newTeam = await teamsApi.create({
          name: team.name,
          seasonId: created.id,
          playerIds: team.playerIds,
          rosterChanges: [],
        });
        createdTeams.push({ id: newTeam.id, name: newTeam.name });
      }

      // Map team names to IDs (for schedule)
      const teamIdMap: Record<string, string> = {};
      createdTeams.forEach((team) => {
        teamIdMap[team.name] = team.id;
      });

      // Use the actual team IDs for schedule
      const teamIds = createdTeams.map(team => team.id);
      const createdCfg = created.seasonConfigurations;
      const schedule = generateRoundRobinSchedule(
        teamIds,
        createdCfg.numberOfRounds,
        created.startDate,
        league?.dayOfWeek || null
      );

      // 3. Create games for each match in the schedule
      for (const day of schedule) {
        for (const match of day.matches) {
          await gamesApi.create({
            seasonId: created.id,
            round: day.round,
            matchDay: day.matchDay,
            team1Id: match.team1Id,
            team2Id: match.team2Id,
            matchesPerGame: createdCfg.matchesPerGame,
            useHandicap: createdCfg.useHandicap,
            playerMatchPointsPerWin: createdCfg.playerMatchPointsPerWin,
            teamMatchPointsPerWin: createdCfg.teamMatchPointsPerWin,
            teamGamePointsPerWin: createdCfg.teamGamePointsPerWin,
            scheduledDate: day.date || undefined,
            postponed: false,
            lineupStrategy: createdCfg.lineupStrategy,
            lineupRule: createdCfg.lineupRule,
            bonusRules: createdCfg.bonusRules,
            teamAllPresentBonusEnabled: createdCfg.teamAllPresentBonusEnabled,
            teamAllPresentBonusPoints: createdCfg.teamAllPresentBonusPoints,
          });
        }
      }
      
      // 4. Update season with schedule
      await seasonsApi.update(created.id, { schedule });
      if (typeof onSuccess === 'function') onSuccess(created.id);
    } catch (err) {
      alert(t('validation.saveError') || 'Error saving season.');
    }
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
    const getValue = (key: keyof SeasonFormData) => {
      if (inheritLeagueConfig) {
        const cfg = league?.defaultSeasonConfigurations;
        switch (key) {
          case 'numberOfTeams':
            return cfg?.numberOfTeams || DEFAULT_NUMBER_OF_TEAMS;
          case 'playersPerTeam':
            return cfg?.playersPerTeam || DEFAULT_PLAYERS_PER_TEAM;
          case 'numberOfRounds':
            return cfg?.numberOfRounds || DEFAULT_NUMBER_OF_ROUNDS;
          case 'matchesPerGame':
            return cfg?.matchesPerGame || DEFAULT_MATCHES_PER_GAME;
          case 'lineupStrategy':
            return cfg?.lineupStrategy || DEFAULT_LINEUP_STRATEGY;
          case 'lineupRule':
            return cfg?.lineupRule || DEFAULT_LINEUP_RULE;
          case 'playerMatchPointsPerWin':
            return cfg?.playerMatchPointsPerWin || DEFAULT_PLAYER_MATCH_POINTS;
          case 'teamMatchPointsPerWin':
            return cfg?.teamMatchPointsPerWin || DEFAULT_TEAM_MATCH_POINTS;
          case 'teamGamePointsPerWin':
            return cfg?.teamGamePointsPerWin || DEFAULT_TEAM_GAME_POINTS;
          case 'useHandicap':
            return cfg?.useHandicap ?? DEFAULT_USE_HANDICAP;
          case 'handicapBasis':
            return cfg?.handicapBasis ?? DEFAULT_HANDICAP_BASIS;
          case 'handicapPercentage':
            return cfg?.handicapPercentage ?? DEFAULT_HANDICAP_PERCENTAGE;
          case 'teamAllPresentBonusEnabled':
            return cfg?.teamAllPresentBonusEnabled ?? DEFAULT_TEAM_ALL_PRESENT_BONUS_ENABLED;
          case 'teamAllPresentBonusPoints':
            return cfg?.teamAllPresentBonusPoints ?? DEFAULT_TEAM_ALL_PRESENT_BONUS_POINTS;
          case 'bonusRules':
            return cfg?.bonusRules ? JSON.parse(JSON.stringify(cfg.bonusRules)) : [];
          default:
            return formData[key];
        }
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
                      const cfg = league?.defaultSeasonConfigurations;
                      setFormData((prev: any) => ({
                        ...prev,
                        lineupStrategy: cfg?.lineupStrategy || 'flexible',
                        lineupRule: cfg?.lineupRule || 'standard',
                        playerMatchPointsPerWin: cfg?.playerMatchPointsPerWin || 1,
                        teamMatchPointsPerWin: cfg?.teamMatchPointsPerWin || 1,
                        teamGamePointsPerWin: cfg?.teamGamePointsPerWin || 2,
                        useHandicap: cfg?.useHandicap ?? true,
                        handicapBasis: cfg?.handicapBasis ?? 160,
                        handicapPercentage: cfg?.handicapPercentage ?? 100,
                        bonusRules: cfg?.bonusRules ? JSON.parse(JSON.stringify(cfg.bonusRules)) : [],
                        teamAllPresentBonusEnabled: cfg?.teamAllPresentBonusEnabled || DEFAULT_TEAM_ALL_PRESENT_BONUS_ENABLED,
                        teamAllPresentBonusPoints: cfg?.teamAllPresentBonusPoints || DEFAULT_TEAM_ALL_PRESENT_BONUS_POINTS,
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
            <GeneralConfiguration
              numberOfTeams={getValue('numberOfTeams')}
              playersPerTeam={getValue('playersPerTeam')}
              numberOfRounds={getValue('numberOfRounds')}
              matchesPerGame={getValue('matchesPerGame')}
              dayOfWeek={league?.dayOfWeek || ''}
              onNumberOfTeamsChange={value => setFormData({ ...formData, numberOfTeams: value })}
              onPlayersPerTeamChange={value => setFormData({ ...formData, playersPerTeam: value })}
              onNumberOfRoundsChange={value => setFormData({ ...formData, numberOfRounds: value })}
              onMatchesPerGameChange={value => setFormData({ ...formData, matchesPerGame: value })}
              onDayOfWeekChange={value => setFormData({ ...formData, dayOfWeek: value })}
              disabled={inheritLeagueConfig}
            />

            {/* Player Matchup Configuration Section */}
            <PlayerMatchupConfiguration
              lineupStrategy={getValue('lineupStrategy')}
              lineupRule={getValue('lineupRule')}
              onLineupStrategyChange={value => setFormData({ ...formData, lineupStrategy: value as LineupStrategy })}
              onLineupRuleChange={value => setFormData({ ...formData, lineupRule: value as LineupRule })}
              disabled={inheritLeagueConfig}
            />

            {/* Points Configuration Section */}
            <PointsConfiguration
              playerMatchPointsPerWin={getValue('playerMatchPointsPerWin') || 1}
              teamMatchPointsPerWin={getValue('teamMatchPointsPerWin') || 1}
              teamGamePointsPerWin={getValue('teamGamePointsPerWin') || 2}
              onPlayerMatchPointsPerWinChange={value => setFormData({ ...formData, playerMatchPointsPerWin: value })}
              onTeamMatchPointsPerWinChange={value => setFormData({ ...formData, teamMatchPointsPerWin: value })}
              onTeamGamePointsPerWinChange={value => setFormData({ ...formData, teamGamePointsPerWin: value })}
              disabled={inheritLeagueConfig}
            />

            {/* Handicap Configuration Section */}
            <div className="border-t pt-4 mt-4">
              <HandicapConfigurationForm
                useHandicap={getValue('useHandicap')}
                handicapBasis={getValue('handicapBasis')}
                handicapPercentage={getValue('handicapPercentage')}
                onUseHandicapChange={(value: boolean) => setFormData({ ...formData, useHandicap: value })}
                onHandicapBasisChange={(value: number) => setFormData({ ...formData, handicapBasis: value })}
                onHandicapPercentageChange={(value: number) => setFormData({ ...formData, handicapPercentage: value })}
                showDescription={true}
                disabled={inheritLeagueConfig}
              />
            </div>


            {/* Bonus Rules Configuration Section */}
            <div className="border-t pt-4 mt-4">
              <BonusRulesConfiguration
                bonusRules={inheritLeagueConfig ? (league?.defaultSeasonConfigurations.bonusRules || []) : formData.bonusRules}
                teamAllPresentBonusEnabled={inheritLeagueConfig ? (league?.defaultSeasonConfigurations.teamAllPresentBonusEnabled ?? DEFAULT_TEAM_ALL_PRESENT_BONUS_ENABLED) : formData.teamAllPresentBonusEnabled}
                teamAllPresentBonusPoints={inheritLeagueConfig ? (league?.defaultSeasonConfigurations.teamAllPresentBonusPoints ?? DEFAULT_TEAM_ALL_PRESENT_BONUS_POINTS) : formData.teamAllPresentBonusPoints}
                onBonusRulesChange={rules => setFormData({ ...formData, bonusRules: rules })}
                onTeamAllPresentBonusEnabledChange={enabled => setFormData({ ...formData, teamAllPresentBonusEnabled: enabled })}
                onTeamAllPresentBonusPointsChange={points => setFormData({ ...formData, teamAllPresentBonusPoints: points })}
                disabled={inheritLeagueConfig}
              />
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
                      const player = availablePlayers.find((p: Player) => p.id === playerId);
                      return (
                        <li key={playerId} className="flex items-center justify-between mb-1">
                          <span>{player ? getPlayerDisplayName(player) : 'Unknown'}</span>
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
                    {availablePlayers.filter(p => !getAssignedPlayers(teamIdx).has(p.id)).map((player: Player) => (
                      <option key={player.id} value={player.id}>{getPlayerDisplayName(player)}</option>
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

  // Step 3: Review/edit player averages
  const allPlayersWithTeams = teams.flatMap(team =>
    team.playerIds.map((playerId: string) => {
      const player = availablePlayers.find((p: Player) => p.id === playerId);
      const avgObj = playerAverages[playerId] || { average: 0, gamesPlayed: 0, totalPins: 0 };
      return {
        playerId,
        playerName: player ? getPlayerDisplayName(player) : 'Unknown',
        teamName: team.name,
        average: avgObj.average,
        gamesPlayed: avgObj.gamesPlayed
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
                        setPlayerAverages(prev => {
                          return {
                            ...prev,
                            [player.playerId]: {
                              average: newAvg,
                              totalPins: 0,
                              gamesPlayed: 0
                            }
                          };
                        });
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
