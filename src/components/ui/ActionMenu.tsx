"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { FaEllipsis } from "react-icons/fa6";
import styles from "./ActionMenu.module.css";

interface ActionMenuItemBase {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export type ActionMenuItem = ActionMenuItemBase &
  ({ onSelect: () => void; href?: never } | { href: string; external?: boolean; onSelect?: never });

interface ActionMenuProps {
  /** Accessible name of the trigger, e.g. "More actions for <activity>". */
  label: string;
  items: ActionMenuItem[];
}

/** "More actions" button with a keyboard-navigable menu (WAI-ARIA menu button pattern). */
export function ActionMenu({ label, items }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const pendingFocus = useRef<"first" | "last" | null>(null);
  const menuId = useId();

  const enabledIndexes = items.flatMap((item, index) => (item.disabled ? [] : [index]));

  const focusItem = (index: number) => itemRefs.current[index]?.focus();

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const openWith = (focus: "first" | "last") => {
    pendingFocus.current = focus;
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const target = pendingFocus.current === "last" ? enabledIndexes[enabledIndexes.length - 1] : enabledIndexes[0];
    pendingFocus.current = null;
    if (target !== undefined) focusItem(target);

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // Focus only when the menu opens, not on every items change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openWith("first");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openWith("last");
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const current = enabledIndexes.indexOf(itemRefs.current.findIndex((el) => el === document.activeElement));
    const last = enabledIndexes.length - 1;
    const moveTo = (position: number) => {
      event.preventDefault();
      focusItem(enabledIndexes[position]);
    };

    switch (event.key) {
      case "ArrowDown": return moveTo(current >= last ? 0 : current + 1);
      case "ArrowUp": return moveTo(current <= 0 ? last : current - 1);
      case "Home": return moveTo(0);
      case "End": return moveTo(last);
      case "Escape":
        event.preventDefault();
        return close(true);
      case "Tab":
        return close(false);
    }
  };

  const select = (item: ActionMenuItem) => {
    close(true);
    item.onSelect?.();
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openWith("first"))}
        onKeyDown={onTriggerKeyDown}
      >
        <FaEllipsis aria-hidden="true" />
      </button>

      {open && (
        <ul id={menuId} role="menu" aria-label={label} className={styles.menu} onKeyDown={onMenuKeyDown}>
          {items.map((item, index) => {
            const className = `${styles.item} ${item.danger ? styles.danger : ""}`;
            const content = (
              <>
                {item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}
                {item.label}
              </>
            );
            const setRef = (el: HTMLElement | null) => { itemRefs.current[index] = el; };

            return (
              <li key={item.key} role="none">
                {item.href !== undefined && !item.disabled ? (
                  <Link
                    ref={setRef}
                    href={item.href}
                    role="menuitem"
                    tabIndex={-1}
                    className={className}
                    onClick={() => close(false)}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    ref={setRef}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    className={className}
                    aria-disabled={item.disabled || undefined}
                    onClick={() => !item.disabled && select(item)}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
