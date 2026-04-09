import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}","./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'Inter'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink:   { DEFAULT:"#0A0A0F", 50:"#F4F4F8", 100:"#E8E8F0", 200:"#C8C8DC", 300:"#9898B8", 400:"#6060A0", 500:"#3A3A6A", 600:"#252548", 700:"#181830", 800:"#101020", 900:"#0A0A0F" },
        day:   { DEFAULT:"#FFFFFF", 50:"#FAFAFA", 100:"#F5F5F5", 200:"#EBEBEB" },
        red:   { DEFAULT:"#FF3333", 50:"#FFF0F0", 100:"#FFD6D6", 400:"#FF6666", 500:"#FF3333", 600:"#CC0000", 700:"#990000" },
        gold:  { DEFAULT:"#FFB800", 50:"#FFFAEB", 100:"#FFF0B3", 300:"#FFCC33", 400:"#FFB800", 500:"#CC9200", 600:"#996D00" },
        green: { DEFAULT:"#00CC66", 50:"#EDFFF5", 100:"#C3FFE0", 400:"#33DD88", 500:"#00CC66", 600:"#009944" },
        blue:  { DEFAULT:"#3399FF", 50:"#EFF7FF", 100:"#DBEEFF", 400:"#66B3FF", 500:"#3399FF", 600:"#0066CC" },
        slate: { 50:"#F8F9FC", 100:"#F0F1F8", 200:"#D8DAF0", 300:"#B0B3D8", 400:"#7880C0", 500:"#4A5090", 600:"#2E3478" },
      },
      animation: {
        "fade-in":   "fadeIn 0.4s ease-out both",
        "slide-up":  "slideUp 0.5s ease-out both",
        "pulse-red": "pulseRed 2s ease-in-out infinite",
        "ticker":    "ticker 20s linear infinite",
        "glow-gold": "glowGold 2s ease-in-out infinite",
        "count-up":  "countUp 0.6s ease-out both",
      },
      keyframes: {
        fadeIn:    { from:{ opacity:"0" }, to:{ opacity:"1" } },
        slideUp:   { from:{ opacity:"0", transform:"translateY(12px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        pulseRed:  { "0%,100%":{ boxShadow:"0 0 0 0 rgba(255,51,51,0.4)" }, "50%":{ boxShadow:"0 0 0 8px rgba(255,51,51,0)" } },
        glowGold:  { "0%,100%":{ boxShadow:"0 0 0 0 rgba(255,184,0,0.3)" }, "50%":{ boxShadow:"0 0 0 6px rgba(255,184,0,0)" } },
        ticker:    { from:{ transform:"translateX(0)" }, to:{ transform:"translateX(-50%)" } },
        countUp:   { from:{ opacity:"0", transform:"translateY(8px) scale(0.9)" }, to:{ opacity:"1", transform:"translateY(0) scale(1)" } },
      },
    },
  },
  plugins: [],
};
export default config;
