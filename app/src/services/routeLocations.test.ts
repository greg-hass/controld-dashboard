import { describe, expect, it } from 'vitest';
import {
  formatRouteLocation,
  normalizeRouteLocationRecords,
} from './routeLocations';

describe('route location labels', () => {
  it('formats known proxy identifiers as readable city and country labels', () => {
    expect(formatRouteLocation('LON')).toEqual({
      code: 'LON',
      flag: '🇬🇧',
      label: 'London, United Kingdom',
      shortLabel: 'London',
    });
  });

  it('uses API proxy metadata before falling back to the built-in code map', () => {
    const locations = normalizeRouteLocationRecords({
      proxies: [{ PK: 'YYZ', city: 'Toronto', country: 'Canada' }],
    });

    expect(formatRouteLocation('YYZ', locations).label).toBe('Toronto, Canada');
  });
});
