import type { Player } from '../types/index';

export function getPlayerDisplayName(player: Pick<Player, 'firstName' | 'lastName'>): string {
  return `${player.firstName} ${player.lastName}`.trim();
}

export function getPlayerFullName(player: Pick<Player, 'firstName' | 'middleName' | 'lastName'>): string {
  if (player.middleName) {
    return `${player.firstName} ${player.middleName} ${player.lastName}`.trim();
  }
  return getPlayerDisplayName(player);
}
