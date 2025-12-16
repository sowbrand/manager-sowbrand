/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'sow-green': '#72bf03',
        'sow-dark': '#1a1a1a',
        'sow-black': '#000000',
      },
    },
  },
  plugins: [],
};
