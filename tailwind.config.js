/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lavender: {
          50:  '#F7F3FD',
          100: '#EDE5FA',
          200: '#DDD0F5',
          300: '#C9B1E8',
          400: '#B48EDA',
          500: '#9A6CCB',
          600: '#7F4FB5',
          700: '#5B3F7A',
          800: '#3E2A54',
          900: '#261A33',
        },
        teal: {
          50:  '#EDF7FA',
          100: '#C8E9F0',
          200: '#9DD5E3',
          300: '#6FBFCF',
          400: '#4A9FB5',
          500: '#357D8F',
          600: '#235D6A',
        },
        peach: {
          50:  '#FFF8F2',
          100: '#FFEEDD',
          200: '#FFE0C4',
          300: '#FFD4B3',
          400: '#FFC08A',
          500: '#FFAB61',
        },
      },
      animation: {
        'pulse-mic': 'pulse-mic 1.2s ease-in-out infinite',
        'fade-up':   'fade-up 0.3s ease-out',
        'slide-in':  'slide-in 0.25s ease-out',
        'pop':       'pop 0.2s ease-out',
      },
      keyframes: {
        'pulse-mic': {
          '0%, 100%': { transform: 'scale(1)',    opacity: '1'    },
          '50%':       { transform: 'scale(1.12)', opacity: '0.85' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)'    },
        },
        'pop': {
          '0%':   { transform: 'scale(0.9)' },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)'   },
        },
      },
    },
  },
  plugins: [],
};
