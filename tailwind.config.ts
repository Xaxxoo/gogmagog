import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cinzel Decorative'", "serif"],
        body: ["'Cinzel'", "serif"],
        mono: ["'Share Tech Mono'", "monospace"],
      },
      colors: {
        ash: {
          950: "#0a0805",
          900: "#110e07",
          800: "#1c1710",
          700: "#2a2015",
          600: "#3a2e1e",
        },
        ember: {
          900: "#4a1a00",
          800: "#7a2e00",
          700: "#a84000",
          600: "#c85800",
          500: "#e07020",
          400: "#f09040",
          300: "#f5b870",
          200: "#fad4a0",
          100: "#fdecd0",
        },
        bone: {
          200: "#e8dfc8",
          300: "#d8cdb0",
          400: "#c0b090",
          500: "#a09070",
        },
        blood: {
          700: "#5a0a0a",
          600: "#8b1a1a",
          500: "#c02020",
          400: "#e04040",
        },
        moss: {
          700: "#1a3010",
          600: "#2a4818",
          500: "#3a6020",
          400: "#5a8a30",
          300: "#7ab848",
        },
      },
      backgroundImage: {
        "parchment": "url('/textures/parchment.svg')",
        "noise": "url('/textures/noise.svg')",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        march: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-8px)" },
        },
        pulse_glow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(200,88,32,0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(200,88,32,0.8)" },
        },
        wall_crack: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        flicker: "flicker 3s ease-in-out infinite",
        march: "march 0.4s ease-in-out infinite alternate",
        pulse_glow: "pulse_glow 2s ease-in-out infinite",
        sway: "sway 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
