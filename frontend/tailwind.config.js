/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1", // Indigo 500
        secondary: "#FACC15", // Amber 400
        info: "#38BDF8", // Sky
        success: "#10B981", // Emerald
        warning: "#F59E0B", // Amber
        error: "#F43F5E", // Rose
        background: "#F9FAFB", // Zinc
        border: "#CBD5E1", // Slate
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Sora", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}