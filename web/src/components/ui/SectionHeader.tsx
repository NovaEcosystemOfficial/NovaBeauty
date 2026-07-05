type SectionHeaderProps = {
  title: string;
  caption?: string;
  action?: React.ReactNode;
};

export function SectionHeader({ title, caption, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-[20px] font-bold leading-tight text-beauty-text">{title}</h2>
        {caption ? <p className="mt-1 text-[13px] text-beauty-muted">{caption}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
