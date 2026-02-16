// Centralized sort options for players (extendable for other entities)
import type { SortOption } from '../utils/sortUtils';
import type { Player } from '../types';

export const PLAYER_SORT_OPTIONS: SortOption<Player>[] = [
  { key: 'lastName', labelKey: 'sort.lastNameAsc', direction: 'asc' },
  { key: 'lastName', labelKey: 'sort.lastNameDesc', direction: 'desc' },
  { key: 'firstName', labelKey: 'sort.firstNameAsc', direction: 'asc' },
  { key: 'firstName', labelKey: 'sort.firstNameDesc', direction: 'desc' },
];
