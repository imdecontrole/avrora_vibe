import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        muted: "#767676",
        line: "#e9e9e9",
        bg: "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-geologica)", "-apple-system", "BlinkMacSystemFont", "Inter", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["var(--font-geologica)", "sans-serif"],
      },
      borderRadius: {
        pin: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
