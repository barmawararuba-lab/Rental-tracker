/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4338ca",
          dark: "#3730a3",
        },
        status: {
          success: "#16a34a",
          warning: "#d97706",
          danger: "#dc2626",
        },
        neutral: {
          base: "#f8fafc",
          heading: "#1e293b",
          text: "#64748b",
        }
      }
    }
  },
  plugins: [],
};
