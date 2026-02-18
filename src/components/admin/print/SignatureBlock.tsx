import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';

interface SignatureBlockProps {
  teamName: string;
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({ teamName }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {teamName} - {t('print.teamCaptainSignature')}:
        </label>
        <div className="border-b-2 border-gray-400 pb-8"></div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('print.date')}:
        </label>
        <div className="border-b-2 border-gray-400 w-48"></div>
      </div>
    </div>
  );
};
