export type ThemeColors = {
  '--paper': string;
  '--black': string;
  '--ink': string;
  '--white': string;
  '--muted': string;
  '--muted-ink': string;
  '--orange-500': string;
  '--orange-600': string;
  '--orange-400': string;
  '--green-950': string;
  '--green-900': string;
  '--green-800': string;
  '--green-500': string;
  '--green-300': string;
  '--green-100': string;
};

export type ThemeFonts = {
  display: string;
  body: string;
  googleUrl: string;
};

export type ThemeConfig = {
  colors: ThemeColors;
  fonts: ThemeFonts;
};

export type FontPair = {
  id: string;
  label: string;
  display: string;
  body: string;
  googleUrl: string;
  previewDisplay: string;
  previewBody: string;
};

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    '--paper': '#1f1f21',
    '--black': '#f4efe6',
    '--ink': '#ebe4d8',
    '--white': '#2a2a2e',
    '--muted': '#b9b2a6',
    '--muted-ink': '#6a6560',
    '--orange-500': '#f05a28',
    '--orange-600': '#d4451a',
    '--orange-400': '#ff7a4d',
    '--green-950': '#121314',
    '--green-900': '#1a1b1d',
    '--green-800': '#2a2c30',
    '--green-500': '#5fbf3a',
    '--green-300': '#8fd96a',
    '--green-100': '#d8f0c8',
  },
  fonts: {
    display: "'Oswald', 'Arial Narrow', sans-serif",
    body: "'Nunito Sans', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,500;6..12,600;6..12,700&family=Oswald:wght@500;600;700&display=swap',
  },
};

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'oswald-nunito',
    label: 'Oswald + Nunito Sans',
    display: "'Oswald', 'Arial Narrow', sans-serif",
    body: "'Nunito Sans', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,500;6..12,600;6..12,700&family=Oswald:wght@500;600;700&display=swap',
    previewDisplay: 'Oswald',
    previewBody: 'Nunito Sans',
  },
  {
    id: 'fraunces-manrope',
    label: 'Fraunces + Manrope',
    display: "'Fraunces', Georgia, serif",
    body: "'Manrope', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap',
    previewDisplay: 'Fraunces',
    previewBody: 'Manrope',
  },
  {
    id: 'cormorant-source',
    label: 'Cormorant + Source Sans 3',
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Source Sans 3', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap',
    previewDisplay: 'Cormorant Garamond',
    previewBody: 'Source Sans 3',
  },
  {
    id: 'literata-outfit',
    label: 'Literata + Outfit',
    display: "'Literata', Georgia, serif",
    body: "'Outfit', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,500;7..72,600;7..72,700&family=Outfit:wght@400;500;600;700&display=swap',
    previewDisplay: 'Literata',
    previewBody: 'Outfit',
  },
  {
    id: 'bitter-karla',
    label: 'Bitter + Karla',
    display: "'Bitter', Georgia, serif",
    body: "'Karla', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Bitter:wght@500;600;700&family=Karla:wght@400;500;600;700&display=swap',
    previewDisplay: 'Bitter',
    previewBody: 'Karla',
  },
];

export const COLOR_FIELDS: Array<{ key: keyof ThemeColors; labelEs: string; labelEn: string }> = [
  { key: '--paper', labelEs: 'Fondo de página', labelEn: 'Page background' },
  { key: '--white', labelEs: 'Superficies / cards', labelEn: 'Surfaces / cards' },
  { key: '--black', labelEs: 'Títulos / crema', labelEn: 'Headings / cream' },
  { key: '--ink', labelEs: 'Texto principal', labelEn: 'Body text' },
  { key: '--muted', labelEs: 'Texto suave (sobre fondo)', labelEn: 'Soft text (on page)' },
  { key: '--muted-ink', labelEs: 'Texto secundario', labelEn: 'Secondary text' },
  { key: '--orange-500', labelEs: 'Acento naranja', labelEn: 'Orange accent' },
  { key: '--orange-600', labelEs: 'Naranja oscuro', labelEn: 'Dark orange' },
  { key: '--orange-400', labelEs: 'Naranja claro', labelEn: 'Light orange' },
  { key: '--green-950', labelEs: 'Carbón profundo', labelEn: 'Deep charcoal' },
  { key: '--green-900', labelEs: 'Carbón oscuro', labelEn: 'Dark charcoal' },
  { key: '--green-800', labelEs: 'Carbón medio', labelEn: 'Mid charcoal' },
  { key: '--green-500', labelEs: 'Verde penca', labelEn: 'Agave green' },
  { key: '--green-300', labelEs: 'Verde claro', labelEn: 'Light green' },
  { key: '--green-100', labelEs: 'Verde muy claro', labelEn: 'Pale green' },
];
