import Link from "next/link";
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
  href,
  icon,
  iconPosition = "left",
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    bg-secondary text-primary font-semibold rounded-md
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    lg:text-sm text-xs
    px-3 py-1 sm:px-4 sm:py-2
    hover:bg-secondary-dark
    w-auto min-w-0
    ${className}
  `;

  const content = (
    <span className="flex items-center gap-2 whitespace-nowrap">
      {icon && iconPosition === "left" && (
        <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseStyles}
    >
      {content}
    </button>
  );
}
