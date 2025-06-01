/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 60% - Primary beige colors
        'beige': {
          50: '#faf6f1',
          100: '#f5ede3',
          200: '#ebe0d1',
          300: '#dfd0ba',
          400: '#d0bc9e',
          500: '#c2a883', // Main beige
          600: '#b39570',
          700: '#a07b57',
          800: '#8c6a4d',
          900: '#735843',
          950: '#3d2e22',
        },
        // 30% - Secondary colors
        'navy': {
          50: '#f0f5fa',
          100: '#dce8f5',
          200: '#c0d7ed',
          300: '#94bde0',
          400: '#619cd0',
          500: '#3f7dbc',
          600: '#30639f',
          700: '#295082',
          800: '#26456c',
          900: '#243c5c',
          950: '#17263d',
        },
        // 10% - Accent colors
        'coral': {
          50: '#fff1f0',
          100: '#ffe0dd',
          200: '#ffc7c0',
          300: '#ffa195',
          400: '#ff7061',
          500: '#ff4530', // Accent color
          600: '#ed2309',
          700: '#c81807',
          800: '#a5160c',
          900: '#881a10',
          950: '#4b0802',
        },
      },
      fontFamily: {
        'sans': ['Inter var', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
