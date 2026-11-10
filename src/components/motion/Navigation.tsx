"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { handleMenuKeyDown, mobileMenuAria } from "@/lib/motion/helpers";
import styles from "./motion.module.css";

export interface StickyHeaderProps {
  children: (state: { scrolled: boolean }) => ReactNode;
  /** Scroll offset (px) after which the header is considered scrolled. Default 8. */
  offset?: number;
  /**
   * Element to render. Defaults to `div`.
   *
   * Integration note: this is a *sticky bar* wrapper, NOT a page landmark. It
   * deliberately does not render a banner element by default so it cannot create
   * a duplicate `header` landmark. Put this inside the page's single top-level
   * header and keep one `nav` inside. Only pass `as="header"` if it is the sole
   * top-level banner on the page.
   */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * Lightweight sticky bar that reports whether the page has scrolled.
 * Uses a passive scroll listener with a rAF throttle and only re-renders when
 * the crossed state changes.
 */
export function StickyHeader({ children, offset = 8, as: Tag = "div", className, style }: StickyHeaderProps) {
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
    <Tag
      className={[styles["m-stickyHeader"], className].filter(Boolean).join(" ")}
      style={style}
      data-scrolled={scrolled ? "true" : "false"}
    >
      {children({ scrolled })}
    </Tag>
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

/** Smoothly transitions a dropdown panel in and out (transform/opacity, never clipped). */
export function Dropdown({ children, open, className, style }: DropdownProps) {
  const aria = mobileMenuAria(open);
  return (
    <div
      role="menu"
      aria-hidden={aria["aria-hidden"]}
      inert={aria.inert || undefined}
      className={[styles["m-dropdown"], open ? styles["m-dropdownOpen"] : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      data-open={open ? "true" : "false"}
    >
      {children}
    </div>
  );
}

export interface MobileMenuProps {
  children: ReactNode;
  open: boolean;
  /** Optional close handler; enables Escape-to-close. */
  onClose?: () => void;
  /** Accessible name for the menu region. */
  label?: string;
  /** id of the toggle button, for aria-controls relationships. */
  labelledBy?: string;
  /** id for this panel so a toggle button can use aria-controls. */
  id?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Transition wrapper for a mobile menu panel.
 *
 * Height animates via `grid-template-rows` (0fr -> 1fr) with opacity + translate,
 * so content is never clipped, no magic `max-height`/`100vh` is used, and the panel
 * reserves no phantom space when closed. When closed it is `inert` + `aria-hidden`,
 * which also removes it from the tab order. Escape closes (when `onClose` is given).
 */
export function MobileMenu({ children, open, onClose, label, labelledBy, id, className, style }: MobileMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const aria = mobileMenuAria(open);

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (open) handleMenuKeyDown({ key: event.key }, { onClose });
    },
    [open, onClose],
  );

  // Escape can also be pressed while focus is on a child or the toggle; listen on
  // the document while open so it works regardless of where focus lives.
  useEffect(() => {
    if (!open || !onClose) return;
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // When opening, move focus into the panel; when closing, let the caller restore
  // focus to the trigger (we don't own it). preventScroll avoids a layout jump.
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current && ref.current) {
      const first = ref.current.querySelector<HTMLElement>(
        "a[href], button:not([disabled]), input, [tabindex]:not([tabindex='-1'])",
      );
      first?.focus({ preventScroll: true });
    }
    prevOpen.current = open;
  }, [open]);

  const labelled = Boolean(label || labelledBy);
  return (
    <div
      ref={ref}
      id={id}
      role={labelled ? "navigation" : undefined}
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-hidden={aria["aria-hidden"]}
      inert={aria.inert || undefined}
      onKeyDown={onKeyDown}
      className={[styles["m-mobileMenu"], open ? styles["m-mobileMenuOpen"] : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      data-open={open ? "true" : "false"}
    >
      <div className={styles["m-mobileMenuInner"]}>{children}</div>
    </div>
  );
}
