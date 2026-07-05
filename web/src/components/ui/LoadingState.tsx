type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Caricamento" }: LoadingStateProps) {
  return <p className="text-[15px] text-beauty-muted">{label}</p>;
}
