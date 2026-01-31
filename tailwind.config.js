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
          bg: "#0B0D10",        // main background
          surface: "#11141A",   // cards / sections
          border: "#1F2937",    // dividers
          text: "#FFFFFF",      // primary text
          muted: "#9CA3AF",     // secondary text
          accent: "#6366F1",    // indigo accent (CTA, highlights)
        },
      },
    },
  },
  plugins: [],
}