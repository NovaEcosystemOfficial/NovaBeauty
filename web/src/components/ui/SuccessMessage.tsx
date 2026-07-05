type SuccessMessageProps = {
  message: string;
};

export function SuccessMessage({ message }: SuccessMessageProps) {
  return <p className="text-[13px] text-beauty-success">{message}</p>;
}
