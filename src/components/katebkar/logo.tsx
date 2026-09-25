import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * KatebKar logo mark — a stylized document with a check path,
 * rendered in navy. Conveys "document/claim" + "verified/guided".
 */
export function Logo({ className, showText = true, textClassName }: LogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white shadow-sm",
          className
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
          <path d="M13 3v4h4" />
          <path d="m9.5 13.5 2 2 3.5-3.5" />
        </svg>
      </span>
      {showText && (
        <span
          className={cn(
            "text-lg font-bold tracking-tight text-navy",
            textClassName
          )}
        >
          کاتب<span className="text-forest">کار</span>
        </span>
      )}
    </span>
  );
}
