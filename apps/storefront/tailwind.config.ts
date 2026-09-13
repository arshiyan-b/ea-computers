import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdeff',
          300: '#8ecaff',
          400: '#59acff',
          500: '#3389ff',
          600: '#1c67f5',
          700: '#1651e1',
          800: '#1942b6',
          900: '#1a3c8f',
          950: '#142752',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
