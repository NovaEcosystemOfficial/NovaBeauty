export const designTokens = {
  color: {
    primary: "rgb(var(--color-primary))",
    secondary: "rgb(var(--color-secondary))",
    background: "rgb(var(--color-background))",
    surface: "rgb(var(--color-surface))",
    card: "rgb(var(--color-card))",
    elevated: "rgb(var(--color-elevated))",
    text: "rgb(var(--color-text))",
    muted: "rgb(var(--color-muted))",
    border: "rgb(var(--color-border))",
    accent: "rgb(var(--color-accent))",
    gold: "rgb(var(--color-gold))",
    mint: "rgb(var(--color-mint))",
    lavender: "rgb(var(--color-lavender))"
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)"
  },
  shadow: {
    card: "var(--shadow-card)",
    soft: "var(--shadow-soft)",
    floating: "var(--shadow-floating)"
  },
  motion: {
    fast: "var(--duration-fast)",
    base: "var(--duration-base)",
    slow: "var(--duration-slow)",
    ease: "var(--ease-premium)"
  }
} as const;
