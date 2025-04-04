import Link from "next/link";
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  href?: string; // href ekliyoruz
};

export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
  href,
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center
    bg-secondary text-primary font-semibold
    rounded-md px-4 py-1
    hover:bg-yellow transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {children}
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
      {children}
    </button>
  );
}
