import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Book Colors
        coral: {
          DEFAULT: '#FF4444',
          50: '#FFE5E5',
          100: '#FFD1D1',
          200: '#FFA8A8',
          300: '#FF7F7F',
          400: '#FF5656',
          500: '#FF4444',
          600: '#FF1111',
          700: '#DD0000',
          800: '#AA0000',
          900: '#770000',
        },
        navy: {
          DEFAULT: '#0A1E3D',
          50: '#E8EBF0',
          100: '#D1D8E1',
          200: '#A3B1C3',
          300: '#758AA5',
          400: '#476387',
          500: '#193C69',
          600: '#0A1E3D',
          700: '#081833',
          800: '#061228',
          900: '#040C1E',
        },
        royal: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1E3A8A',
        },
        softblue: {
          DEFAULT: '#60A5FA',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'brand': '12px',
      },
      boxShadow: {
        'brand': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'brand-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
