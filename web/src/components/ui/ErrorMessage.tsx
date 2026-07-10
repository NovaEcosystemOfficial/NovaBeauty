type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className="whitespace-pre-line text-[13px] text-beauty-danger">{message}</p>;
}
