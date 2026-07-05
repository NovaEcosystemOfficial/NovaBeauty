import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function RevenueChartPlaceholder() {
  return (
    <Card>
      <EmptyState
        title="Nessun dato incassi"
        description="I grafici saranno disponibili quando esisteranno movimenti reali collegati agli appuntamenti."
      />
    </Card>
  );
}
