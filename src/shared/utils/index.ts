export * from './merge'
export * from './renderError'

/**
 * Генерирует уникальный хеш для онлайн игры
 * @returns строка с хешем
 */
export const generateGameHash = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
};