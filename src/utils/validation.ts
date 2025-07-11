import { useLogger } from '../hooks/useLogger';

export const useValidation = () => {
  const logger = useLogger();

  const validateUrl = (url: string): { isValid: boolean; message: string } => {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (!url.trim()) {
      logger.warn('URL validation failed: empty URL');
      return { isValid: false, message: 'URL is required' };
    }

    if (!urlPattern.test(url)) {
      logger.warn('URL validation failed: invalid format', { url });
      return { isValid: false, message: 'Please enter a valid URL' };
    }

    logger.info('URL validation passed', { url });
    return { isValid: true, message: '' };
  };

  const validateValidityPeriod = (period: number): { isValid: boolean; message: string } => {
    if (period <= 0) {
      logger.warn('Validity period validation failed: non-positive value', { period });
      return { isValid: false, message: 'Validity period must be positive' };
    }

    if (period > 525600) { // 1 year in minutes
      logger.warn('Validity period validation failed: too long', { period });
      return { isValid: false, message: 'Validity period cannot exceed 1 year' };
    }

    logger.info('Validity period validation passed', { period });
    return { isValid: true, message: '' };
  };

  const validateShortcode = (shortcode: string): { isValid: boolean; message: string } => {
    if (!shortcode.trim()) {
      return { isValid: true, message: '' }; // Optional field
    }

    const shortcodePattern = /^[a-zA-Z0-9]+$/;
    
    if (!shortcodePattern.test(shortcode)) {
      logger.warn('Shortcode validation failed: invalid characters', { shortcode });
      return { isValid: false, message: 'Shortcode must contain only letters and numbers' };
    }

    if (shortcode.length < 4 || shortcode.length > 10) {
      logger.warn('Shortcode validation failed: invalid length', { shortcode });
      return { isValid: false, message: 'Shortcode must be 4-10 characters long' };
    }

    logger.info('Shortcode validation passed', { shortcode });
    return { isValid: true, message: '' };
  };

  return {
    validateUrl,
    validateValidityPeriod,
    validateShortcode
  };
};