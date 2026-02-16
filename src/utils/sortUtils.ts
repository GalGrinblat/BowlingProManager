// Generic sort utility for consistent sorting across the app
export interface SortOption<T> {
  key: keyof T;
  labelKey: string;
  direction: 'asc' | 'desc';
}

export function sortByOption<T>(arr: T[], option: SortOption<T>) {
  return [...arr].sort((a, b) => {
    const key = option.key;
    if (option.direction === 'asc') {
      return String(a[key]).localeCompare(String(b[key]), undefined, { sensitivity: 'base' });
    } else {
      return String(b[key]).localeCompare(String(a[key]), undefined, { sensitivity: 'base' });
    }
  });
}
