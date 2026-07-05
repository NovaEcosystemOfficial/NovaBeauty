type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className="text-[13px] text-beauty-danger">{message}</p>;
}
