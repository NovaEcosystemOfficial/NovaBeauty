type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-beauty bg-beauty-card p-4 text-center shadow-beauty">
      <p className="text-[17px] font-semibold">{title}</p>
      {description ? <p className="mt-2 text-[13px] text-beauty-muted">{description}</p> : null}
    </div>
  );
}
