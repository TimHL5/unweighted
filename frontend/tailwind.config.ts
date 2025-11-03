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
        // Unweighted Brand Colors
        'coral-red': '#FF4444',
        'coral-red-hover': '#FF3333',
        'coral-light': '#FF6B6B',
        'navy-blue': '#0A1E3D',
        'royal-blue': '#2563EB',
        'soft-blue': '#60A5FA',
        'light-gray': '#F3F4F6',
        'medium-gray': '#9CA3AF',
        'dark-gray': '#374151',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-navy-blue': 'linear-gradient(135deg, #0A1E3D 0%, #2563EB 100%)',
        'gradient-coral': 'linear-gradient(135deg, #FF4444 0%, #FF6B6B 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%)',
        'gradient-card-hover': 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 12px 24px rgba(0, 0, 0, 0.15)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
