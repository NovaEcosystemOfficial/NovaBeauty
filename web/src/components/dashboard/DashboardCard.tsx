type DashboardCardProps = {
  title: string;
  value: string;
  caption?: string;
  variant?: "primary" | "secondary";
};

export function DashboardCard({
  title,
  value,
  caption,
  variant = "primary"
}: DashboardCardProps) {
  return (
    <article className="rounded-beauty-lg bg-beauty-card p-4 shadow-beauty">
      <p className="text-[17px] font-semibold">{title}</p>
      <p className={variant === "primary" ? "mt-3 text-[32px] font-bold text-beauty-primary" : "mt-3 text-[32px] font-bold text-beauty-secondary"}>
        {value}
      </p>
      {caption ? <p className="mt-1 text-[13px] text-beauty-muted">{caption}</p> : null}
    </article>
  );
}
