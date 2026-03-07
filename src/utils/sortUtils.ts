// Generic sort utility for consistent sorting across the app
export interface SortOption<T> {
  key: keyof T;
  labelKey: string;
  direction: 'asc' | 'desc';
}

export function sortByOption<T>(arr: T[], option: SortOption<T>) {
  return [...arr].sort((a, b) => {
    const aVal = a[option.key];
    const bVal = b[option.key];

    // Numeric sort — preserves correct numeric order (10 > 2, not "10" < "2")
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return option.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // String / fallback sort (null/undefined coerced to "null"/"undefined" by String())
    return option.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
      : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
  });
}
