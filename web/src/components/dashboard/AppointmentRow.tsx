type AppointmentRowProps = {
  time: string;
  client: string;
  service: string;
  price: string;
};

export function AppointmentRow({ time, client, service, price }: AppointmentRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-beauty border border-beauty-border/60 bg-beauty-surface/70 p-3">
      <div className="grid h-12 w-14 shrink-0 place-items-center rounded-beauty bg-beauty-primary/12 text-[13px] font-bold text-beauty-primary">
        {time}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-beauty-text">{client}</p>
        <p className="truncate text-[12px] text-beauty-muted">{service}</p>
      </div>
      <p className="text-[13px] font-bold text-beauty-text">{price}</p>
    </div>
  );
}
