import { useTranslation } from '../contexts/LanguageContext';

export function useNavLabel() {
  const { t, isRTL } = useTranslation();

  // "← Label" in LTR,  "Label →" in RTL
  const back = (label: string) =>
    isRTL ? `${label} ${t('common.rightArrow')}` : `${t('common.leftArrow')} ${label}`;

  // "Label →" in LTR,  "← Label" in RTL
  const forward = (label: string) =>
    isRTL ? `${t('common.leftArrow')} ${label}` : `${label} ${t('common.rightArrow')}`;

  return { back, forward };
}
