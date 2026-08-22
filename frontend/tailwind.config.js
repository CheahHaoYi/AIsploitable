/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          'blue-hover': '#1557b0',
          'blue-light': '#e8f0fe',
          red: '#ea4335',
          'red-light': '#fce8e6',
          yellow: '#fbbc04',
          'yellow-light': '#fef7e0',
          green: '#34a853',
          'green-light': '#e6f4ea',
          gray: '#5f6368',
          'gray-light': '#f8f9fa',
          'border': '#dadce0',
        },
      },
      fontFamily: {
        sans: ['Google Sans', 'Roboto', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'google-card': '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
        'google-hover': '0 1px 3px 0 rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)',
        'google-focus': '0 1px 6px rgba(32,33,36,.28)',
      },
    },
  },
  plugins: [],
};
