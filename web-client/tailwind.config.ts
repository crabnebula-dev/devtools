import scrollbar from "tailwind-scrollbar";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        toolbar: 'var(--toolbar-height)',
      },
      fontFamily: {
        'sans': ['Euclid Circular B', 'Inter', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        navy: "#0C1326"
      }
    },
  },
  plugins: [scrollbar({ nocompatible: true })],
};
