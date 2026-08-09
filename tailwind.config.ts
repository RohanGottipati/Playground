import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14110f",
        paper: "#f6efe2",
        cabinet: "#1d1a26",
        marquee: "#ff5d73",
        marqueeDeep: "#c62b47",
        token: "#ffcf5c",
        screen: "#7ce7c8",
        cable: "#5f7adb",
        appleInk: "#1d1d1f",
        appleGray: "#6e6e73",
        appleBg: "#f5f5f7",
        appleBlue: "#0068c9",
        appleRed: "#ff3b30",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        sticker: "4px 4px 0 0 rgba(20, 17, 15, 0.9)",
        stickerSm: "2px 2px 0 0 rgba(20, 17, 15, 0.9)",
        inset: "inset 0 0 0 3px rgba(20, 17, 15, 0.9)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(rgba(20,17,15,0.16) 1px, transparent 1px), radial-gradient(rgba(20,17,15,0.1) 1px, transparent 1px)",
      },
      backgroundSize: {
        grain: "16px 16px, 24px 24px",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-10%)", opacity: "0.15" },
          "50%": { opacity: "0.8" },
          "100%": { transform: "translateY(110%)", opacity: "0.15" },
        },
        wobble: {
          "0%, 100%": { transform: "rotate(-1.2deg)" },
          "50%": { transform: "rotate(1.2deg)" },
        },
      },
      animation: {
        scanline: "scanline 2.2s linear infinite",
        wobble: "wobble 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
