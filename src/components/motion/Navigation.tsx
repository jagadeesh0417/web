"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./motion.module.css";

export interface StickyHeaderProps {
  children: (state: { scrolled: boolean }) => ReactNode;
  /** Scroll offset (px) after which the header is considered scrolled. Default 8. */
  offset?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Lightweight sticky header that reports whether the page has scrolled.
 * Uses a passive scroll listener with a rAF throttle and only re-renders when
 * the crossed state changes.
 */
export function StickyHeader({ children, offset = 8, className, style }: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > offset;
        setScrolled((prev) => (prev === next ? prev : next));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);

  return (
    <header className={[styles["m-stickyHeader"], className].filter(Boolean).join(" ")} style={style}>
      {children({ scrolled })}
    </header>
  );
}

export interface NavLinkProps {
  children: ReactNode;
  href?: string;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** A nav link with an animated underline accent. */
export function NavLink({ children, href = "#", active, className, style }: NavLinkProps) {
  return (
    <a
      href={href}
      className={[styles["m-navUnderline"], className].filter(Boolean).join(" ")}
      data-active={active ? "true" : "false"}
      style={style}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </a>
  );
}

export interface DropdownProps {
  children: ReactNode;
  open: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Smoothly transitions a dropdown panel in and out. */
export function Dropdown({ children, open, className, style }: DropdownProps) {
  return (
    <div
      role="menu"
      aria-hidden={!open}
      className={[styles["m-dropdown"], open ? styles["m-dropdownOpen"] : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}

export interface MobileMenuProps {
  children: ReactNode;
  open: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Transition wrapper for a mobile menu panel. */
export function MobileMenu({ children, open, className, style }: MobileMenuProps) {
  return (
    <div
      aria-hidden={!open}
      className={[styles["m-mobileMenu"], open ? styles["m-mobileMenuOpen"] : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}