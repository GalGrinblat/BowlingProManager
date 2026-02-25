import { sortByOption } from '../../../src/utils/sortUtils';
import type { SortOption } from '../../../src/utils/sortUtils';

interface Item {
  name: string;
  score: string;
}

const items: Item[] = [
  { name: 'Charlie', score: '150' },
  { name: 'Alice', score: '200' },
  { name: 'Bob', score: '180' },
];

describe('sortByOption', () => {
  it('sorts ascending by string key', () => {
    const option: SortOption<Item> = { key: 'name', labelKey: 'name', direction: 'asc' };
    const sorted = sortByOption(items, option);
    expect(sorted.map(i => i.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('sorts descending by string key', () => {
    const option: SortOption<Item> = { key: 'name', labelKey: 'name', direction: 'desc' };
    const sorted = sortByOption(items, option);
    expect(sorted.map(i => i.name)).toEqual(['Charlie', 'Bob', 'Alice']);
  });

  it('does not mutate the original array', () => {
    const original = [...items];
    const option: SortOption<Item> = { key: 'name', labelKey: 'name', direction: 'asc' };
    sortByOption(items, option);
    expect(items).toEqual(original);
  });

  it('sorts ascending by numeric-string key', () => {
    const option: SortOption<Item> = { key: 'score', labelKey: 'score', direction: 'asc' };
    const sorted = sortByOption(items, option);
    // localeCompare on strings: '150' < '180' < '200'
    expect(sorted[0]?.score).toBe('150');
    expect(sorted[2]?.score).toBe('200');
  });
});
