"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearLabel: string;
};

export function SearchBar({ value, onChange, placeholder, clearLabel }: SearchBarProps) {
  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_6px_20px_rgba(0,0,0,0.05)] backdrop-blur">
      <div className="flex items-center gap-2 rounded-xl bg-background px-3 ring-1 ring-transparent transition focus-within:ring-primary/30">
        <Search className="size-4 text-muted-foreground" />
        <input
          className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
