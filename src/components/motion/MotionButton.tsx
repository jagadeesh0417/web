"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./motion.module.css";

export interface MotionButtonProps {
  children: ReactNode;
  variant?: "gradient" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  /** Show an animated arrow that moves on hover. */
  arrow?: boolean;
  /** Render as an <a> when href is set. */
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

const sizes: Record<NonNullable<MotionButtonProps["size"]>, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

export const MotionButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, MotionButtonProps>(
  ({ children, variant = "gradient", size = "md", href, type = "button", onClick, disabled, arrow, className, style, ariaLabel }, ref) => {
    const base = [
      styles["m-btn"],
      variant === "gradient" ? styles["m-btnGradient"] : "bg-transparent",
      "inline-flex items-center justify-center rounded-lg font-medium select-none",
      sizes[size],
      disabled ? "pointer-events-none opacity-50" : "",
      className,
    ].filter(Boolean).join(" ");

    const content = (
      <>
        {children}
        {arrow && <ArrowRight className={cn("h-4 w-4", styles["m-btnArrow"])} aria-hidden="true" />}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as never}
          href={disabled ? undefined : href}
          className={base}
          style={style}
          aria-label={ariaLabel}
          aria-disabled={disabled || undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as never}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={base}
        style={style}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  },
);
MotionButton.displayName = "MotionButton";