/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}', './app/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#f5f8f7',
        foreground: '#023048',

        primary: '#229ebd',
        primaryForeground: '#ffffff',

        secondary: '#023048',
        secondaryForeground: '#ffffff',

        muted: '#f5f8f7',
        mutedForeground: '#64748b',

        neutral: '#8fcae6',
        neutralForeground: '#ffffff',

        accent: '#ffb702',
        accentForeground: '#023048',

        destructive: '#ef4444',
        success: '#4cbb17',

        card: '#ffffff',
        border: '#e2e8f0',
      },
      borderRadius: {
        lg: '12px', // ~0.75rem
      },
    },
  },
  plugins: [],
};
