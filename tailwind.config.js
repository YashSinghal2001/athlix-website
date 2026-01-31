/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FFFFFF",        // main background
          surface: "#FFFFFF",   // cards / sections
          border: "#E5E7EB",    // light gray border
          text: "#111827",      // dark neutral text
          muted: "#6B7280",     // medium gray muted text
          accent: "#02ABFF",    // bright blue accent
        },
      },
    },
  },
  plugins: [],
}