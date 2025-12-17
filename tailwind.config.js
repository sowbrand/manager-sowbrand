/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sow-green': '#65D30F', // Verde Neon solicitado
        'sow-dark': '#111827',  // Preto suave
        'sow-black': '#000000',
        'sow-light': '#F3F4F6', // Cinza claro de fundo
      }
    },
  },
  plugins: [],
}