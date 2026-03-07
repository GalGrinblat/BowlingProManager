import { sortByOption } from '../../../src/utils/sortUtils';
import type { SortOption } from '../../../src/utils/sortUtils';

interface Item {
  name: string;
  score: string;
}

interface NumericItem {
  name: string;
  average: number;
}

const items: Item[] = [
  { name: 'Charlie', score: '150' },
  { name: 'Alice', score: '200' },
  { name: 'Bob', score: '180' },
];

const numericItems: NumericItem[] = [
  { name: 'Charlie', average: 150 },
  { name: 'Alice', average: 10 },
  { name: 'Bob', average: 100 },
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

  it('sorts numeric fields in correct numeric order (not lexicographic)', () => {
    const option: SortOption<NumericItem> = { key: 'average', labelKey: 'average', direction: 'asc' };
    const sorted = sortByOption(numericItems, option);
    // Numeric order: 10, 100, 150 (not lexicographic "10", "100", "150" which is the same, but vs "150" < "10" would be wrong)
    expect(sorted.map(i => i.average)).toEqual([10, 100, 150]);
  });

  it('sorts numeric fields descending in correct numeric order', () => {
    const option: SortOption<NumericItem> = { key: 'average', labelKey: 'average', direction: 'desc' };
    const sorted = sortByOption(numericItems, option);
    expect(sorted.map(i => i.average)).toEqual([150, 100, 10]);
  });

  it('treats lexicographically-misleading numbers correctly', () => {
    // Lexicographic sort would give: 10, 100, 2 (wrong); numeric gives 2, 10, 100
    const tricky: NumericItem[] = [
      { name: 'A', average: 100 },
      { name: 'B', average: 2 },
      { name: 'C', average: 10 },
    ];
    const option: SortOption<NumericItem> = { key: 'average', labelKey: 'average', direction: 'asc' };
    const sorted = sortByOption(tricky, option);
    expect(sorted.map(i => i.average)).toEqual([2, 10, 100]);
  });
});
