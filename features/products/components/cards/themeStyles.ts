export function cardStyleProps(): React.CSSProperties {
  return {
    backgroundColor: "var(--store-card-bg)",
    borderRadius: "var(--store-radius)",
    border: "var(--store-card-border, 1px solid var(--store-border))",
    boxShadow: "var(--store-card-shadow, none)",
    padding: "var(--store-card-padding, 1rem)",
    color: "var(--store-text)",
  };
}

export function cardTitleStyle(): React.CSSProperties {
  return {
    color: "var(--store-text)",
    fontSize: "var(--store-heading-size, 1.125rem)",
  };
}

export function cardSubtitleStyle(): React.CSSProperties {
  return {
    color: "var(--store-text-muted)",
    fontSize: "var(--store-body-size, 0.875rem)",
  };
}

export function cardPriceStyle(): React.CSSProperties {
  return {
    color: "var(--store-accent)",
    fontSize: "var(--store-price-size, 0.9375rem)",
  };
}

export function cardCtaStyle(): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    backgroundColor: "var(--store-accent)",
    color: "#ffffff",
    borderRadius: "var(--store-radius, 0.5rem)",
    padding: "0.5rem 1rem",
    fontWeight: 600,
    fontSize: "var(--store-body-size, 0.875rem)",
    textAlign: "center",
    boxSizing: "border-box",
  };
}
