import { logger } from '../../utils/logger';

export const handleError = (error: any, context: string): void => {
  logger.error(`Error in ${context}:`, error);
};
