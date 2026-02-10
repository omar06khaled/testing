/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0b1026',
          800: '#11183b',
          700: '#1b2350',
          600: '#28306b',
          500: '#34408a',
          400: '#4c59a6',
          300: '#6b78c3'
        },
        accent: {
          500: '#f6c453',
          600: '#e7a93a'
        }
      },
      fontFamily: {
        display: ['"Outfit"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
