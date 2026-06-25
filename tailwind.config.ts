import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // These map to CSS variables injected by app/layout.tsx from DB theme settings.
        // The rgb(var / <alpha-value>) format preserves Tailwind opacity utilities
        // like bg-gold/20, text-brown/50, etc.
        cream: "rgb(var(--theme-bg) / <alpha-value>)",
        ink:   "rgb(var(--theme-text) / <alpha-value>)",
        gold: {
          DEFAULT: "rgb(var(--theme-primary) / <alpha-value>)",
          dark:    "rgb(var(--theme-primary-dark) / <alpha-value>)",
          light:   "rgb(var(--theme-primary-light) / <alpha-value>)",
        },
        brown: {
          DEFAULT: "rgb(var(--theme-secondary) / <alpha-value>)",
          dark:    "rgb(var(--theme-secondary-dark) / <alpha-value>)",
          light:   "rgb(var(--theme-secondary-light) / <alpha-value>)",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
