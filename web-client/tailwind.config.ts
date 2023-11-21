import type { Config } from "tailwindcss";
import scrollbar from "tailwind-scrollbar";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    // split.js classes
    "gutter",
    "gutter-horizontal",
  ],
  theme: {
    extend: {
      spacing: {
        toolbar: "var(--toolbar-height)",
      },
      fontFamily: {
        sans: ["Euclid Circular B", "Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "nearly-invisible": "#ffffff09",
        navy: {
          50: "#DCE2F4",
          100: "#B9C6E9",
          200: "#738DD3",
          300: "#3859B2",
          400: "#22366D",
          500: "#0C1326",
          600: "#0A0F1F",
          700: "#070C17",
          800: "#050810",
          900: "#020408",
          950: "#010204",
        },
      },
    },
  },
  plugins: [scrollbar({ nocompatible: true })],
} satisfies Config;
