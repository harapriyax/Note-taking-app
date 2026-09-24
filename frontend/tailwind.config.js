/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 16px 42px rgba(124, 92, 252, 0.10)',
        lift: '0 22px 48px rgba(124, 92, 252, 0.16)',
      },
      colors: {
        ink: '#1E1938',
        cocoa: '#7C5CFC', // Brand Lavender
        cream: '#FAF9FF', // Lavender mist
        lavender: {
          DEFAULT: '#7C5CFC',
          hover: '#6946EC',
          light: '#F0ECFD',
          border: '#E8E2FA',
          deep: '#4E32B6',
        },
      },
    },
  },
  plugins: [],
}
