"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import styles from "./motion.module.css";

export interface HoverCardProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Disable the hover lift. Default false. */
  static?: boolean;
}

export function HoverCard({ children, as: Tag = "div", className, style, static: isStatic }: HoverCardProps) {
  return (
    <Tag
      className={[isStatic ? "" : styles["m-hoverCard"], className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </Tag>
  );
}

/** Apply to icons inside a HoverCard to get subtle movement. */
export const hoverCardIconClass = styles["m-hoverCardIcon"];