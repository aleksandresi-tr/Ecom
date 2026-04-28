"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon } from "lucide-react";

type AutoCopyFieldProps = {
  label: string;
  value: string;
  linkText?: string;
  copyIdLabel: string;
  copyLinkLabel: string;
  idCopiedLabel: string;
  linkCopiedLabel: string;
};

export function AutoCopyField({
  label,
  value,
  linkText,
  copyIdLabel,
  copyLinkLabel,
  idCopiedLabel,
  linkCopiedLabel,
}: AutoCopyFieldProps) {
  const [idCopied, setIdCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  async function copyValue(text: string, kind: "id" | "link") {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    if (kind === "id") {
      setIdCopied(true);
      window.setTimeout(() => setIdCopied(false), 1400);
    } else {
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1400);
    }
  }

  return (
    <div className="rounded-lg border border-sky-300 bg-sky-50/70 px-3 py-2 ring-1 ring-sky-200/80">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-sky-700">
            {label}
          </span>
          <span className="block truncate text-sm font-medium text-sky-900">
            {value || "-"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => copyValue(value, "id")}
            title={copyIdLabel}
            aria-label={copyIdLabel}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-sky-300 bg-white/80 px-2 text-[10px] font-semibold text-sky-700 shadow-sm transition hover:bg-white"
          >
            {idCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
            ID
          </button>
          {linkText ? (
            <button
              type="button"
              onClick={() => copyValue(linkText, "link")}
              title={copyLinkLabel}
              aria-label={copyLinkLabel}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-sky-300 bg-white/80 px-2 text-[10px] font-semibold text-sky-700 shadow-sm transition hover:bg-white"
            >
              {linkCopied ? <Check className="size-3" /> : <LinkIcon className="size-3" />}
              URL
            </button>
          ) : null}
        </div>
      </div>
      {idCopied || linkCopied ? (
        <span className="mt-1 block text-[10px] font-medium text-sky-700">
          {idCopied ? idCopiedLabel : linkCopiedLabel}
        </span>
      ) : null}
    </div>
  );
}
