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
