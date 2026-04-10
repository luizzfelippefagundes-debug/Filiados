/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf1',
          100: '#f9f3d5',
          200: '#f3e4a6',
          300: '#ead06d',
          400: '#e1b93d',
          500: '#d4af37', // Ouro Real
          600: '#b78c2a',
          700: '#946a22',
          800: '#7a5620',
          900: '#68481e',
        },
        slate: {
          900: '#0f172a',
          800: '#1e293b',
        }
      },
      animation: {
        'entrance': 'entrance 1s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
