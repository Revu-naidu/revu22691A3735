import { ShortenedUrl, ClickEvent } from '../types';
import { useLogger } from '../hooks/useLogger';

const STORAGE_KEY = 'shortened_urls';

export class DataStore {
  private static instance: DataStore;
  private logger = useLogger();

  private constructor() {}

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  getAllUrls(): ShortenedUrl[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const urls = data ? JSON.parse(data) : [];
      this.logger.info('Retrieved all URLs from storage', { count: urls.length });
      return urls;
    } catch (error) {
      this.logger.error('Failed to retrieve URLs from storage', { error });
      return [];
    }
  }

  addUrl(url: ShortenedUrl): void {
    try {
      const urls = this.getAllUrls();
      urls.push(url);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
      this.logger.info('Added new URL to storage', { id: url.id, shortCode: url.shortCode });
    } catch (error) {
      this.logger.error('Failed to add URL to storage', { error, url });
      throw error;
    }
  }

  getUrlByShortCode(shortCode: string): ShortenedUrl | null {
    try {
      const urls = this.getAllUrls();
      const url = urls.find(u => u.shortCode === shortCode);
      
      if (url) {
        this.logger.info('Found URL by shortcode', { shortCode, id: url.id });
        return url;
      } else {
        this.logger.warn('URL not found by shortcode', { shortCode });
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to get URL by shortcode', { error, shortCode });
      return null;
    }
  }

  updateUrl(url: ShortenedUrl): void {
    try {
      const urls = this.getAllUrls();
      const index = urls.findIndex(u => u.id === url.id);
      
      if (index !== -1) {
        urls[index] = url;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
        this.logger.info('Updated URL in storage', { id: url.id, shortCode: url.shortCode });
      } else {
        this.logger.warn('URL not found for update', { id: url.id });
      }
    } catch (error) {
      this.logger.error('Failed to update URL in storage', { error, url });
      throw error;
    }
  }

  deleteUrl(id: string): void {
    try {
      const urls = this.getAllUrls();
      const filtered = urls.filter(u => u.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      this.logger.info('Deleted URL from storage', { id });
    } catch (error) {
      this.logger.error('Failed to delete URL from storage', { error, id });
      throw error;
    }
  }

  isShortCodeUnique(shortCode: string): boolean {
    const urls = this.getAllUrls();
    const exists = urls.some(u => u.shortCode === shortCode);
    this.logger.info('Checked shortcode uniqueness', { shortCode, isUnique: !exists });
    return !exists;
  }

  addClick(shortCode: string, clickEvent: ClickEvent): void {
    try {
      const url = this.getUrlByShortCode(shortCode);
      if (url) {
        url.clicks.push(clickEvent);
        this.updateUrl(url);
        this.logger.info('Added click event to URL', { shortCode, clickEvent });
      }
    } catch (error) {
      this.logger.error('Failed to add click event', { error, shortCode, clickEvent });
      throw error;
    }
  }
}

export const useDataStore = () => {
  return DataStore.getInstance();
};