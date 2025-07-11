export interface ClickEvent {
  timestamp: number;
  source: string;
  geo: string;
}

export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  creationDate: number;
  expiryDate: number | null;
  clicks: ClickEvent[];
}

export interface UrlFormData {
  originalUrl: string;
  validityPeriod: number;
  preferredShortcode: string;
}