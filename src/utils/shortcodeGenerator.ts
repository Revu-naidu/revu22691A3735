import { useLogger } from '../hooks/useLogger';

export const useShortcodeGenerator = () => {
  const logger = useLogger();

  const generateShortcode = (length: number = 6): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    logger.info('Generated shortcode', { shortcode: result, length });
    return result;
  };

  const generateUniqueShortcode = (existingCodes: string[], length: number = 6): string => {
    let shortcode = generateShortcode(length);
    let attempts = 0;
    const maxAttempts = 100;

    while (existingCodes.includes(shortcode) && attempts < maxAttempts) {
      shortcode = generateShortcode(length);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      logger.warn('Max attempts reached for unique shortcode generation, trying longer length');
      return generateUniqueShortcode(existingCodes, length + 1);
    }

    logger.info('Generated unique shortcode', { shortcode, attempts });
    return shortcode;
  };

  return {
    generateShortcode,
    generateUniqueShortcode
  };
};