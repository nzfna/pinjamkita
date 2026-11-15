import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: '#1E7F4F', dark: '#14633B' }, mint: { DEFAULT: '#E6F5EC', deep: '#CDEBD9' }, ink: '#13211A', paper: '#FAFBF7' },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;
