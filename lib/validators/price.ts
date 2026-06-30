export function parsePriceRupees(price: string | undefined | null): number | undefined {
  if (!price) return undefined;

  const cleaned = price.replace(/[^0-9.]/g, "");
  if (!cleaned) return undefined;

  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) return undefined;

  return Math.floor(num);
}
