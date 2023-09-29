import scrollbar from "tailwind-scrollbar";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0C1326"
      }
    },
  },
  plugins: [scrollbar({ nocompatible: true })],
};
