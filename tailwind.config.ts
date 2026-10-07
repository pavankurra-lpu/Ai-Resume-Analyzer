import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "lt-blue": {
          DEFAULT: "var(--lt-blue, #2B3A92)",
          dark: "var(--lt-blue-dark, #1E2A6B)",
          light: "#3A4CB8",
        },
        "lt-yellow": {
          DEFAULT: "var(--lt-yellow, #FBDD05)",
          hover: "var(--lt-yellow-hover, #F2D000)",
          light: "#FEF7C2",
        },
        "lt-bg-soft": "var(--lt-bg-soft, #F5F7FF)",
        "lt-text": "var(--lt-text, #1F2937)",
        "lt-muted": "var(--lt-muted, #6B7280)",
        score: {
          red: "#EF4444",
          orange: "#F59E0B",
          teal: "#14B8A6",
          green: "#22C55E",
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(43, 58, 146, 0.08)",
        hover: "0 10px 25px -3px rgba(43, 58, 146, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
