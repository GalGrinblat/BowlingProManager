import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../../src/contexts/LanguageContext';
import { PreMatchSetup } from '../../../src/components/common/game/PreMatchSetup';
import type { Game, GamePlayer } from '../../../src/types/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makePlayer(overrides: Partial<GamePlayer> & { playerId: string; average: number }): GamePlayer {
  return {
    name: overrides.playerId,
    rank: 1,
    handicap: 0,
    absent: false,
    pins: '',
    bonusPoints: 0,
    ...overrides,
  };
}

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: 'g1',
    seasonId: 's1',
    round: 1,
    matchDay: 1,
    team1Id: 't1',
    team2Id: 't2',
    status: 'pending',
    matchesPerGame: 3,
    bonusRules: [],
    lineupStrategy: 'fixed',
    matches: [],
    ...overrides,
  } as Game;
}

function renderSetup(props: {
  game: Game;
  initialTeam1Players: GamePlayer[];
  initialTeam2Players: GamePlayer[];
  onContinue?: jest.Mock;
  onBack?: jest.Mock;
}) {
  const onContinue = props.onContinue ?? jest.fn();
  const onBack = props.onBack ?? jest.fn();
  render(
    <LanguageProvider>
      <PreMatchSetup
        game={props.game}
        initialTeam1Players={props.initialTeam1Players}
        initialTeam2Players={props.initialTeam2Players}
        onContinue={onContinue}
        onBack={onBack}
      />
    </LanguageProvider>
  );
  return { onContinue, onBack };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PreMatchSetup — absent toggle correctness', () => {
  // Players loaded in original order: low-avg first, high-avg second.
  // In rule-based mode the display is sorted: high-avg first, low-avg second.
  // Clicking "Mark Absent" for the first DISPLAYED player must toggle the
  // HIGH-avg player (PlayerB), not the low-avg player (PlayerA).

  const playerA = makePlayer({ playerId: 'player-a', name: 'Player A', average: 150, rank: 1 });
  const playerB = makePlayer({ playerId: 'player-b', name: 'Player B', average: 180, rank: 2 });

  describe('rule-based strategy', () => {
    it('toggles the correct player absent when display order differs from load order', () => {
      const game = makeGame({ lineupStrategy: 'rule-based', lineupRule: 'standard' });
      const { onContinue } = renderSetup({
        game,
        // Original load order: A (low avg) first, B (high avg) second
        initialTeam1Players: [playerA, playerB],
        initialTeam2Players: [playerA, playerB],
        onContinue: jest.fn(),
      });

      // Display order is sorted by average desc: PlayerB appears first
      const absentButtons = screen.getAllByRole('button', { name: /mark absent/i });
      // First button corresponds to PlayerB (highest avg, shown first)
      fireEvent.click(absentButtons[0]!);

      // Click Continue
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      const [calledTeam1] = onContinue.mock.calls[0] as [GamePlayer[], GamePlayer[]];
      const absentPlayers = calledTeam1.filter(p => p.absent);

      expect(absentPlayers).toHaveLength(1);
      // PlayerB (high avg) must be the absent one — NOT PlayerA
      expect(absentPlayers[0]!.playerId).toBe('player-b');
    });

    it('does NOT toggle the wrong player when display order differs from load order', () => {
      const game = makeGame({ lineupStrategy: 'rule-based', lineupRule: 'standard' });
      const { onContinue } = renderSetup({
        game,
        initialTeam1Players: [playerA, playerB],
        initialTeam2Players: [playerA, playerB],
        onContinue: jest.fn(),
      });

      const absentButtons = screen.getAllByRole('button', { name: /mark absent/i });
      fireEvent.click(absentButtons[0]!);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      const [calledTeam1] = onContinue.mock.calls[0] as [GamePlayer[], GamePlayer[]];
      const absentPlayers = calledTeam1.filter(p => p.absent);

      // PlayerA must NOT be marked absent
      expect(absentPlayers.some(p => p.playerId === 'player-a')).toBe(false);
    });

    it('applies applyLineupRule on continue and calls onContinue with sorted players', () => {
      const game = makeGame({ lineupStrategy: 'rule-based', lineupRule: 'standard' });
      const { onContinue } = renderSetup({
        game,
        initialTeam1Players: [playerA, playerB], // low first, high second
        initialTeam2Players: [playerA, playerB],
        onContinue: jest.fn(),
      });

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      const [calledTeam1] = onContinue.mock.calls[0] as [GamePlayer[], GamePlayer[]];
      // After applyLineupRule (standard), team1 is sorted high→low
      expect(calledTeam1[0]!.playerId).toBe('player-b'); // 180 avg first
      expect(calledTeam1[1]!.playerId).toBe('player-a'); // 150 avg second
    });
  });

  describe('fixed strategy', () => {
    it('toggles the correct player absent by playerId', () => {
      const game = makeGame({ lineupStrategy: 'fixed' });
      const { onContinue } = renderSetup({
        game,
        initialTeam1Players: [playerA, playerB],
        initialTeam2Players: [playerA, playerB],
        onContinue: jest.fn(),
      });

      // In fixed mode display order = load order: PlayerA first
      const absentButtons = screen.getAllByRole('button', { name: /mark absent/i });
      fireEvent.click(absentButtons[0]!); // click PlayerA's button (first in list)
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      const [calledTeam1] = onContinue.mock.calls[0] as [GamePlayer[], GamePlayer[]];
      const absentPlayers = calledTeam1.filter(p => p.absent);
      expect(absentPlayers).toHaveLength(1);
      expect(absentPlayers[0]!.playerId).toBe('player-a');
    });
  });

  describe('flexible strategy', () => {
    it('toggles the correct player absent after the continue button is clicked', () => {
      const game = makeGame({ lineupStrategy: 'flexible' });
      const { onContinue } = renderSetup({
        game,
        initialTeam1Players: [playerA, playerB],
        initialTeam2Players: [playerA, playerB],
        onContinue: jest.fn(),
      });

      // Click the second player's absent button (PlayerB in flexible, no sorting)
      const absentButtons = screen.getAllByRole('button', { name: /mark absent/i });
      fireEvent.click(absentButtons[1]!);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      const [calledTeam1] = onContinue.mock.calls[0] as [GamePlayer[], GamePlayer[]];
      const absentPlayers = calledTeam1.filter(p => p.absent);
      expect(absentPlayers).toHaveLength(1);
      expect(absentPlayers[0]!.playerId).toBe('player-b');
    });

    it('moves a player up and the moved player remains correct after toggle', () => {
      const game = makeGame({ lineupStrategy: 'flexible' });
      const { onContinue } = renderSetup({
        game,
        initialTeam1Players: [playerA, playerB],
        initialTeam2Players: [playerA, playerB],
        onContinue: jest.fn(),
      });

      // Move PlayerB up (from index 1 to index 0)
      const upButtons = screen.getAllByTitle('Move Up');
      // team1 up buttons: index 0 (PlayerA, disabled), index 1 (PlayerB, enabled)
      // team2 up buttons: index 2 (PlayerA, disabled), index 3 (PlayerB, enabled)
      fireEvent.click(upButtons[1]!); // PlayerB (team1) moves up

      // Now display order for team1: [PlayerB, PlayerA]
      // Mark the first button absent — should be PlayerB
      const absentButtons = screen.getAllByRole('button', { name: /mark absent/i });
      fireEvent.click(absentButtons[0]!);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      const [calledTeam1] = onContinue.mock.calls[0] as [GamePlayer[], GamePlayer[]];
      const absentPlayers = calledTeam1.filter(p => p.absent);
      expect(absentPlayers).toHaveLength(1);
      expect(absentPlayers[0]!.playerId).toBe('player-b');
    });
  });

  describe('toggle present', () => {
    it('toggles a player back to present', () => {
      const game = makeGame({ lineupStrategy: 'fixed' });
      const { onContinue } = renderSetup({
        game,
        initialTeam1Players: [playerA, playerB],
        initialTeam2Players: [playerA, playerB],
        onContinue: jest.fn(),
      });

      // Mark PlayerA absent
      const absentButtons = screen.getAllByRole('button', { name: /mark absent/i });
      fireEvent.click(absentButtons[0]!);

      // Mark PlayerA present again
      const presentButton = screen.getAllByRole('button', { name: /mark present/i });
      fireEvent.click(presentButton[0]!);

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      const [calledTeam1] = onContinue.mock.calls[0] as [GamePlayer[], GamePlayer[]];
      expect(calledTeam1.every(p => !p.absent)).toBe(true);
    });
  });

  describe('onBack', () => {
    it('calls onBack when back button is clicked', () => {
      const game = makeGame({ lineupStrategy: 'fixed' });
      const onBack = jest.fn();
      renderSetup({
        game,
        initialTeam1Players: [playerA],
        initialTeam2Players: [playerA],
        onBack,
      });

      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });
});
