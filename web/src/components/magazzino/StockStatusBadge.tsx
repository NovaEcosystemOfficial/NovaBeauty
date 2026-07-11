import { getStockStatus, stockStatusLabels } from "@/lib/utils/stock-status";
import { cn } from "@/lib/utils/cn";

type StockStatusBadgeProps = {
  quantity: number;
  minimumQuantity: number;
  className?: string;
};

const toneClasses = {
  available: "bg-beauty-success/12 text-beauty-success",
  low: "bg-beauty-gold/15 text-beauty-gold",
  out: "bg-beauty-danger/12 text-beauty-danger"
} as const;

export function StockStatusBadge({ quantity, minimumQuantity, className }: StockStatusBadgeProps) {
  const status = getStockStatus(quantity, minimumQuantity);

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        toneClasses[status],
        className
      )}
    >
      {stockStatusLabels[status]}
    </span>
  );
}
