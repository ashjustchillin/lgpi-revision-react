/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        accent: 'var(--accent)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        fadeIn: 'fadeIn .2s ease',
        slideUp: 'slideUp .2s ease',
        deleteCard: 'deleteCard .3s ease forwards',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(5px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        deleteCard: { '0%': { opacity: 1, transform: 'scale(1)' }, '100%': { opacity: 0, transform: 'scale(.94) translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}
