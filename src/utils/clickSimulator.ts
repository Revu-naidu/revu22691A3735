import { ClickEvent } from '../types';

const SOURCES = [
  'Direct',
  'Google Search',
  'Social Media',
  'Email',
  'Referral',
  'Other'
];

const GEOS = [
  'North America',
  'Europe',
  'Asia',
  'South America',
  'Africa',
  'Oceania'
];

export const generateClickEvent = (): ClickEvent => {
  return {
    timestamp: Date.now(),
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    geo: GEOS[Math.floor(Math.random() * GEOS.length)]
  };
};