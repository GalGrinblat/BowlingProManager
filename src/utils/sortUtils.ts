// Generic sort utility for consistent sorting across the app
export interface SortOption<T> {
  key: keyof T;
  labelKey: string;
  direction: 'asc' | 'desc';
}

export function sortByOption<T>(arr: T[], option: SortOption<T>) {
  return [...arr].sort((a, b) => {
    const key = option.key;
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return option.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    if (option.direction === 'asc') {
      return String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });
    } else {
      return String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
    }
  });
}
