import { TimeRange } from '../types';

export const ROOMS = ['Wohnzimmer', 'Arbeitszimmer', 'Schlafzimmer', 'Küche', 'Esszimmer', 'Badezimmer'];

export const ROOM_SENSOR_MAP: Record<string, string> = {
  'Wohnzimmer': 'sens_0',
  'Arbeitszimmer': 'sens_1',
  'Schlafzimmer': 'sens_2',
  'Küche': 'sens_3',
  'Esszimmer': 'sens_4',
  'Badezimmer': 'sens_5'
};

export const TIME_RANGES: TimeRange[] = [
  { label: '30m', hours: 0.5 },
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '12h', hours: 12 },
  { label: '1d', hours: 24 },
  { label: '3d', hours: 72 },
  { label: '1w', hours: 168 },
  { label: '2w', hours: 336 },
  { label: '1m', hours: 720 }
];

