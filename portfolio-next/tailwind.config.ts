import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#DaC8A5', // fundo (um tom abaixo do creme pra o feixe de luz aparecer)
        cream: '#E8DCC0',
        ink: '#0A0A0A',
        warm: '#6B6050',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
