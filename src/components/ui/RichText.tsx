import Link from "next/link";

const TOKEN_PATTERN = /(#[^\s#]{1,40})/gu;

interface RichTextProps {
  text: string;
  className?: string;
}

export function RichText({ text, className = "" }: RichTextProps) {
  const parts = text.split(TOKEN_PATTERN);

  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) =>
        part.startsWith("#") && part.length > 1 ? (
          <Link
            key={`${part}-${index}`}
            href={`/?tag=${encodeURIComponent(part.slice(1))}`}
            className="font-medium text-red-600 hover:underline"
          >
            {part}
          </Link>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  );
}
