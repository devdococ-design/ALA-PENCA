export type LightLevel = 'shade' | 'partial' | 'sun';
export type WaterLevel = 'low' | 'moderate' | 'constant';
export type HumidityLevel = 'low' | 'medium' | 'high';

export const LIGHT_OPTIONS: ReadonlyArray<{ value: LightLevel; labelEs: string }> = [
  { value: 'shade', labelEs: 'Sombra' },
  { value: 'partial', labelEs: 'Semisombra' },
  { value: 'sun', labelEs: 'Sol' },
];

export const WATER_OPTIONS: ReadonlyArray<{ value: WaterLevel; labelEs: string }> = [
  { value: 'low', labelEs: 'Poco riego' },
  { value: 'moderate', labelEs: 'Riego moderado' },
  { value: 'constant', labelEs: 'Riego constante' },
];

export const HUMIDITY_OPTIONS: ReadonlyArray<{ value: HumidityLevel; labelEs: string }> = [
  { value: 'low', labelEs: 'Poca humedad' },
  { value: 'medium', labelEs: 'Humedad media' },
  { value: 'high', labelEs: 'Mucha humedad' },
];

const LIGHT_VALUES = new Set<string>(LIGHT_OPTIONS.map((o) => o.value));
const WATER_VALUES = new Set<string>(WATER_OPTIONS.map((o) => o.value));
const HUMIDITY_VALUES = new Set<string>(HUMIDITY_OPTIONS.map((o) => o.value));

export function normalizeLight(value: string | null | undefined): LightLevel {
  const raw = (value ?? '').trim().toLowerCase();
  if (LIGHT_VALUES.has(raw)) return raw as LightLevel;
  if (/sol|sun|direct/.test(raw)) return 'sun';
  if (/sombra(?!.*semi)|shade|baja|low/.test(raw) && !/semi|partial|filtr|indirect/.test(raw)) {
    return 'shade';
  }
  return 'partial';
}

export function normalizeWater(value: string | null | undefined): WaterLevel {
  const raw = (value ?? '').trim().toLowerCase();
  if (WATER_VALUES.has(raw)) return raw as WaterLevel;
  if (/constante|constant|húmedo|humedo|moist|frecuente/.test(raw)) return 'constant';
  if (/poco|low|escaso|secar|dry|2-3|olvid/.test(raw)) return 'low';
  return 'moderate';
}

export function normalizeHumidity(value: string | null | undefined): HumidityLevel {
  const raw = (value ?? '').trim().toLowerCase();
  if (HUMIDITY_VALUES.has(raw)) return raw as HumidityLevel;
  if (/alta|high|mucha/.test(raw)) return 'high';
  if (/baja|low|poca/.test(raw)) return 'low';
  return 'medium';
}
