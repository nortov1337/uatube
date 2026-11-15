interface FieldErrorProps {
  message?: string | null;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}
