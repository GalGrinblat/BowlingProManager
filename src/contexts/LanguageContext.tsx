import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import translations from '../translations';
import type { LanguageContextType } from '../types';

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'he'>('en');

  // Load language preference from organization settings
  useEffect(() => {
    const loadLanguage = () => {
      try {
        const orgData = localStorage.getItem('bowling_organization');
        if (orgData) {
          const org = JSON.parse(orgData);
          if (org.language && (org.language === 'en' || org.language === 'he')) {
            setLanguage(org.language);
          }
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    // Load initially
    loadLanguage();

    // Listen for storage changes (when language is updated in Settings)
    const handleStorageChange = (e) => {
      if (e.key === 'bowling_organization' || e.key === null) {
        loadLanguage();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update HTML dir attribute when language changes
  useEffect(() => {
    const direction = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Key not found, return the key itself as fallback
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return value || key;
  };

  const direction = language === 'he' ? 'rtl' : 'ltr';

  // Custom setLanguage that also updates localStorage
  const updateLanguage = (newLang: 'en' | 'he'): void => {
    if (newLang === 'en' || newLang === 'he') {
      setLanguage(newLang);
      // Also update organization in localStorage to keep it in sync
      try {
        const orgData = localStorage.getItem('bowling_organization');
        if (orgData) {
          const org = JSON.parse(orgData);
          org.language = newLang;
          localStorage.setItem('bowling_organization', JSON.stringify(org));
        }
      } catch (error) {
        console.error('Error updating language in localStorage:', error);
      }
    }
  };

  const value = {
    language,
    setLanguage: updateLanguage,
    t,
    direction,
    isRTL: language === 'he'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
