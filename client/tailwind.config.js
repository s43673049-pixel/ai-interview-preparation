/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0f1535",
          800: "#161c42",
          700: "#1e2650",
        },
        brand: {
          50: "#eef0ff",
          100: "#e0e4ff",
          500: "#6a5cf0",
          600: "#5b4de0",
          700: "#4c3fc7",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

