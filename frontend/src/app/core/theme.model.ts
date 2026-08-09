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
    '--paper': '#84816b',
    '--black': '#1c1d19',
    '--ink': '#1c1d19',
    '--white': '#f2eee4',
    '--muted': '#efebe0',
    '--muted-ink': '#5a5b52',
    '--orange-500': '#d4783a',
    '--orange-600': '#b85f28',
    '--orange-400': '#e4a06a',
    '--green-950': '#1e2218',
    '--green-900': '#2a3024',
    '--green-800': '#3d4633',
    '--green-500': '#b3bf86',
    '--green-300': '#d5d9c0',
    '--green-100': '#ece9df',
  },
  fonts: {
    display: "'Fraunces', Georgia, serif",
    body: "'Manrope', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap',
  },
};

export const FONT_PAIRS: FontPair[] = [
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
    id: 'libre-dm',
    label: 'Libre Baskerville + DM Sans',
    display: "'Libre Baskerville', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    googleUrl:
      'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap',
    previewDisplay: 'Libre Baskerville',
    previewBody: 'DM Sans',
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
  { key: '--black', labelEs: 'Negro / títulos', labelEn: 'Black / headings' },
  { key: '--ink', labelEs: 'Texto principal', labelEn: 'Body text' },
  { key: '--muted', labelEs: 'Texto suave (sobre fondo)', labelEn: 'Soft text (on page)' },
  { key: '--muted-ink', labelEs: 'Texto secundario (sobre cream)', labelEn: 'Secondary text (on cream)' },
  { key: '--orange-500', labelEs: 'Acento naranja', labelEn: 'Orange accent' },
  { key: '--orange-600', labelEs: 'Naranja oscuro', labelEn: 'Dark orange' },
  { key: '--orange-400', labelEs: 'Naranja claro', labelEn: 'Light orange' },
  { key: '--green-950', labelEs: 'Verde profundo', labelEn: 'Deep green' },
  { key: '--green-900', labelEs: 'Verde oscuro', labelEn: 'Dark green' },
  { key: '--green-800', labelEs: 'Verde medio', labelEn: 'Mid green' },
  { key: '--green-500', labelEs: 'Verde sage', labelEn: 'Sage green' },
  { key: '--green-300', labelEs: 'Verde claro', labelEn: 'Light green' },
  { key: '--green-100', labelEs: 'Verde muy claro', labelEn: 'Pale green' },
];
