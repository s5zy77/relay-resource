/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          lavender: "#E8E5F6",
          lavenderDark: "#7C3AED",
          softBlue: "#E0F2FE",
          softBlueDark: "#0284C7",
          warmWhite: "#FAF9F6",
          subtlePink: "#FCE7F3",
          subtlePinkDark: "#DB2777",
          cardBg: "#FFFFFF",
          textPrimary: "#1F2937",
          textSecondary: "#6B7280",
          border: "#E5E7EB"
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(124, 58, 237, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'soft-hover': '0 10px 25px -3px rgba(124, 58, 237, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
