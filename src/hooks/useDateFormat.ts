import { useTranslation } from '../contexts/LanguageContext';

/**
 * Custom hook for locale-aware date formatting
 * Provides various date formatting functions that automatically use the current locale
 */
export const useDateFormat = () => {
  const { locale } = useTranslation();

  return {
    /**
     * Format a date string to locale-specific format
     * @param dateString - ISO date string
     * @returns Formatted date string (e.g., "1/15/2024" or "15.1.2024")
     */
    formatDate: (dateString: string): string => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString(locale);
    },

    /**
     * Format a date and time string to locale-specific format
     * @param dateString - ISO date string
     * @returns Formatted date and time string
     */
    formatDateTime: (dateString: string): string => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString(locale);
    },

    /**
     * Format a match date with full details (weekday, month, day, year)
     * @param dateString - ISO date string or null
     * @returns Formatted match date (e.g., "Mon, Jan 15, 2024") or "TBD"
     */
    formatMatchDate: (dateString: string | null): string => {
      if (!dateString) return 'TBD';
      return new Date(dateString).toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    /**
     * Format a date in short format (month, day, year)
     * @param dateString - ISO date string
     * @returns Formatted short date (e.g., "Jan 15, 2024")
     */
    formatShortDate: (dateString: string): string => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    /**
     * Format time only
     * @param dateString - ISO date string
     * @returns Formatted time string
     */
    formatTime: (dateString: string): string => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleTimeString(locale);
    },

    /**
     * Get the current locale being used
     */
    locale
  };
};
