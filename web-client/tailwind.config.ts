import scrollbar from "tailwind-scrollbar";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        toolbar: 'var(--toolbar-height)',
      },
      colors: {
        navy: "#0C1326"
      }
    },
  },
  plugins: [scrollbar({ nocompatible: true })],
};
