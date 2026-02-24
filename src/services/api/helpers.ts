import { logger } from '../../utils/logger';

export const handleError = (error: unknown, context: string): void => {
  logger.error(`Error in ${context}:`, error);
};
