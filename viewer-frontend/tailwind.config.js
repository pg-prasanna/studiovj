/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#a9824a',
          dark: '#7a5f37',
          light: '#e9d9bc',
        },
        ink: '#2b2b2b',
        muted: '#6b6b6b',
        hairline: '#ece4d6',
        cream: '#f7f3ec',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Lato', '"Jost"', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
}
