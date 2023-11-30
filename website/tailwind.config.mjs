/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      backgroundImage: {
        section:
          "image-set(url('/images/section-bg.webp') type('image/webp'), url('/images/section-bg.png') type('image/png'))",
      },
      fontFamily: {
        heading: "cn",
      },
      colors: {
        navy: "#051024",
        gray: {
          950: "#1B1B1B",
        },
        brand: {
          50: "#051024",
          100: "#A4E5F4",
          200: "#84DCF0",
          300: "#67D3EB",
          800: "#14394F",
          900: "#071F34",
        },
      },
    },
  },
  plugins: [],
};
