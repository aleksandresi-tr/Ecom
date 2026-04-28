"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type AutoCopyFieldProps = {
  label: string;
  value: string;
  copyText?: string;
  hrefHint?: string;
  copiedLabel: string;
};

export function AutoCopyField({
  label,
  value,
  copyText,
  hrefHint,
  copiedLabel,
}: AutoCopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const text = copyText ?? value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={handleClick}
        className="group relative w-full rounded-lg border border-sky-300 bg-sky-50/70 px-3 py-2 text-left text-sm text-sky-900 ring-1 ring-sky-200/80 transition hover:bg-sky-100/80"
      >
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-sky-700">
          {label}
        </span>
        <span className="block truncate font-medium">{value || "-"}</span>
        <span className="absolute right-2 top-2 inline-flex size-5 items-center justify-center rounded bg-white/70 text-sky-700 shadow-sm">
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </span>
        {copied ? (
          <span className="absolute bottom-1 right-2 text-[10px] font-medium text-sky-700">
            {copiedLabel}
          </span>
        ) : null}
      </button>
      {hrefHint ? (
        <a
          href={hrefHint}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
        >
          {hrefHint}
        </a>
      ) : null}
    </div>
  );
}
