import React from "react";

type BadgeVariant = "info" | "success" | "warning" | "danger";

interface BadgeButtonProps {
  id: number | null;
  label: string;
  variant?: BadgeVariant;
  onClick?: (id: number) => void;
  disabled?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  info: "bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200 focus-visible:ring-sky-400",
  success:
    "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 focus-visible:ring-emerald-400",
  warning:
    "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 focus-visible:ring-amber-400",
  danger:
    "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 focus-visible:ring-red-400",
};

export const BadgeButton: React.FC<BadgeButtonProps> = ({
  id = null,
  label,
  variant = "info",
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
    key={id}
      type="button"
      onClick={() => onClick && id !== null && onClick(id)}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        px-3 py-1 text-xs font-semibold
        rounded-full border
        select-none
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${variants[variant]}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-inner"
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
};
