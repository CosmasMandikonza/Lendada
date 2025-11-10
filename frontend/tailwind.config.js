/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 500: '#0ea5e9' },
        cardano: { blue: '#0033AD', cyan: '#00D4FF' }
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        display: ['Poppins','system-ui','sans-serif'],
      }
    },
  },
  plugins: [],
}
