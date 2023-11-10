import scrollbar from "tailwind-scrollbar";
import solar from "@crabnebula/solar"

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        toolbar: 'var(--toolbar-height)',
      },
    }
  },
  plugins: [solar, scrollbar({ nocompatible: true })],
};
