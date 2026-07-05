import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        beauty: {
          primary: "rgb(var(--color-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-secondary) / <alpha-value>)",
          background: "rgb(var(--color-background) / <alpha-value>)",
          surface: "rgb(var(--color-surface) / <alpha-value>)",
          card: "rgb(var(--color-card) / <alpha-value>)",
          elevated: "rgb(var(--color-elevated) / <alpha-value>)",
          text: "rgb(var(--color-text) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-subtle) / <alpha-value>)",
          border: "rgb(var(--color-border) / <alpha-value>)",
          ring: "rgb(var(--color-ring) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          gold: "rgb(var(--color-gold) / <alpha-value>)",
          mint: "rgb(var(--color-mint) / <alpha-value>)",
          lavender: "rgb(var(--color-lavender) / <alpha-value>)",
          danger: "rgb(var(--color-danger) / <alpha-value>)",
          success: "rgb(var(--color-success) / <alpha-value>)"
        }
      },
      borderRadius: {
        beauty: "var(--radius-md)",
        "beauty-sm": "var(--radius-sm)",
        "beauty-lg": "var(--radius-lg)",
        "beauty-xl": "var(--radius-xl)"
      },
      boxShadow: {
        beauty: "var(--shadow-card)",
        "beauty-soft": "var(--shadow-soft)",
        "beauty-floating": "var(--shadow-floating)"
      },
      spacing: {
        "beauty-page": "var(--space-page)",
        "beauty-section": "var(--space-section)"
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "Arial", "sans-serif"]
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "0.72" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        "fade-up": "fade-up 420ms ease-out both",
        "soft-pulse": "soft-pulse 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
