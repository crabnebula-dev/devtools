/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        heading: "cn",
      },
      colors: {
        navy: "#051024",
        gray: {
          950: "#1B1B1B",
        },
        brand: {
          200: "#84DCF0",
          900: "#071F34",
        },
      },
    },
  },
  plugins: [],
};
