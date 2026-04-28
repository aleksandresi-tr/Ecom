"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export type CardAction = {
  id: string;
  label: string;
  destructive?: boolean;
  onSelect: () => void;
};

type CardActionsMenuProps = {
  actions: CardAction[];
  triggerLabel: string;
};

export function CardActionsMenu({ actions, triggerLabel }: CardActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={triggerLabel}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:border-primary hover:text-primary"
      >
        <MoreVertical className="size-4" />
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
              className={`block w-full px-3 py-2 text-left text-xs transition hover:bg-muted ${
                action.destructive ? "text-red-600" : "text-foreground"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
