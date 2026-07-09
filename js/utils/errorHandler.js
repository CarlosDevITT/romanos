import { logger } from './logger.js';

export function handleError(error, context = '') {
  logger.error(context, error);
  return { ok: false, message: 'Algo deu errado. Tente novamente.' };
}
