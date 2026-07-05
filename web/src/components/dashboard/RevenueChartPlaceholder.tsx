const bars = [42, 68, 54, 82, 58, 76, 92];

export function RevenueChartPlaceholder() {
  return (
    <div className="rounded-beauty-xl border border-beauty-border/70 bg-beauty-elevated/85 p-5 shadow-beauty-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-beauty-muted">Andamento settimana</p>
          <p className="mt-1 text-[24px] font-bold text-beauty-text">EUR 1.240</p>
        </div>
        <span className="rounded-full bg-beauty-mint/12 px-3 py-1 text-[12px] font-semibold text-beauty-mint">
          +12%
        </span>
      </div>
      <div className="mt-6 flex h-28 items-end gap-2">
        {bars.map((bar, index) => (
          <div key={bar + index} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-full bg-gradient-to-t from-beauty-primary to-beauty-secondary shadow-beauty-soft"
              style={{ height: `${bar}%` }}
            />
            <span className="text-[11px] text-beauty-subtle">{["L", "M", "M", "G", "V", "S", "D"][index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
