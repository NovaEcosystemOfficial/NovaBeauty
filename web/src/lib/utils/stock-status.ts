export type StockStatus = "available" | "low" | "out";

export function getStockStatus(quantity: number, minimumQuantity: number): StockStatus {
  if (quantity <= 0) {
    return "out";
  }

  if (quantity <= minimumQuantity) {
    return "low";
  }

  return "available";
}

export function isBelowMinimum(quantity: number, minimumQuantity: number) {
  return quantity <= minimumQuantity;
}

export const stockStatusLabels: Record<StockStatus, string> = {
  available: "Disponibile",
  low: "Scorta bassa",
  out: "Esaurito"
};
