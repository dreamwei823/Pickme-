
export function formatCurrency(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return `NT$${Math.round(n).toLocaleString()}`;
}
