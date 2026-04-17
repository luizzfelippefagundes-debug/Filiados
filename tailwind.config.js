/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        background: 'hsl(30 40% 98%)',
        foreground: 'hsl(260 25% 12%)',
        card: { DEFAULT: 'hsl(0 0% 100%)', foreground: 'hsl(260 25% 12%)' },
        primary: { DEFAULT: 'hsl(280 75% 55%)', foreground: 'hsl(0 0% 100%)' },
        secondary: { DEFAULT: 'hsl(330 85% 60%)', foreground: 'hsl(0 0% 100%)' },
        accent: { DEFAULT: 'hsl(22 95% 58%)', foreground: 'hsl(0 0% 100%)' },
        gold: { DEFAULT: 'hsl(42 95% 55%)', foreground: 'hsl(30 40% 12%)', soft: 'hsl(45 100% 92%)' },
        muted: { DEFAULT: 'hsl(270 20% 96%)', foreground: 'hsl(260 10% 42%)' },
        border: 'hsl(270 20% 90%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
