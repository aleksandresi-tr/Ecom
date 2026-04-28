"use client";

import { ListingDto } from "@/lib/types";
import { AutoCopyField } from "@/components/AutoCopyField";
import { CardActionsMenu } from "@/components/CardActionsMenu";
import { useMemo } from "react";

export type ListingCardLabels = {
  myhomeId: string;
  ssgeId: string;
  phone: string;
  bedrooms: string;
  rooms: string;
  floor: string;
  apartment: string;
  areaSqm: string;
  address: string;
  cooperation: string;
  comment: string;
  noComment: string;
  agent: string;
  date: string;
  copy: string;
  copied: string;
  linkCopy: string;
  linkCopied: string;
  open: string;
  openMenu: string;
  actionMeeting: string;
  actionRented: string;
  actionForward: string;
  actionEdit: string;
  actionDelete: string;
  statusForRent: string;
  statusRented: string;
  statusListed: string;
  statusMeeting: string;
  categoryRent: string;
  categorySale: string;
};

type ListingCardProps = {
  listing: ListingDto;
  labels: ListingCardLabels;
  locale: string;
  onEdit: (listing: ListingDto) => void;
  onDelete: (listing: ListingDto) => void;
  onUpdateStatus: (listing: ListingDto, status: ListingDto["status"]) => void;
  isSelected?: boolean;
};

function formatDate(dateText: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(dateText),
  );
}

function statusToLabel(status: ListingDto["status"], labels: ListingCardLabels) {
  switch (status) {
    case "FOR_RENT":
      return labels.statusForRent;
    case "RENTED":
      return labels.statusRented;
    case "MEETING_SCHEDULED":
      return labels.statusMeeting;
    case "LISTED":
    default:
      return labels.statusListed;
  }
}

function statusToBorder(status: ListingDto["status"]) {
  if (status === "MEETING_SCHEDULED") {
    return "border-orange-500 ring-orange-200";
  }
  if (status === "RENTED") {
    return "border-red-500 ring-red-200";
  }
  return "border-border";
}

function buildMyhomeLink(myhomeId: string | null) {
  if (!myhomeId) return "";
  return `https://www.myhome.ge/pr/${myhomeId}/`;
}

function buildSsgeLink(ssGeId: string | null) {
  if (!ssGeId) return "";
  return `https://home.ss.ge/ka/udzravi-qoneba/listing-${ssGeId}`;
}

function buildForwardCopy(listing: ListingDto, labels: ListingCardLabels, locale: string) {
  const lines: string[] = [];
  if (listing.myhomeId) {
    lines.push(`Myhome: ${listing.myhomeId} — ${buildMyhomeLink(listing.myhomeId)}`);
  }
  if (listing.ssGeId) {
    lines.push(`SS.ge: ${listing.ssGeId} — ${buildSsgeLink(listing.ssGeId)}`);
  }
  if (listing.address) lines.push(`${labels.address}: ${listing.address}`);
  if (listing.rooms !== null) lines.push(`${labels.rooms}: ${listing.rooms}`);
  if (listing.floor !== null) lines.push(`${labels.floor}: ${listing.floor}`);
  if (listing.apartment !== null) lines.push(`${labels.apartment}: ${listing.apartment}`);
  if (listing.areaSqm !== null) lines.push(`${labels.areaSqm}: ${listing.areaSqm}`);
  if (listing.priceGEL !== null) lines.push(`GEL: ${listing.priceGEL}`);
  if (listing.phone) lines.push(`${labels.phone}: ${listing.phone}`);
  lines.push(`${labels.cooperation}: ${listing.cooperation}%`);
  lines.push(
    `${listing.category === "SALE" ? labels.categorySale : labels.categoryRent} / ${statusToLabel(listing.status, labels)}`,
  );
  if (listing.createdBy?.name || listing.createdBy?.email) {
    lines.push(`${labels.agent}: ${listing.createdBy.name ?? listing.createdBy.email}`);
  }
  lines.push(formatDate(listing.listingDate, locale));
  if (listing.comment) lines.push(`${labels.comment}: ${listing.comment}`);
  return lines.join("\n");
}

export function ListingCard({
  listing,
  labels,
  locale,
  onEdit,
  onDelete,
  onUpdateStatus,
  isSelected,
}: ListingCardProps) {
  const myhomeLink = useMemo(() => buildMyhomeLink(listing.myhomeId), [listing.myhomeId]);
  const ssgeLink = useMemo(() => buildSsgeLink(listing.ssGeId), [listing.ssGeId]);

  const borderClass = isSelected
    ? "border-emerald-500 ring-2 ring-emerald-200"
    : statusToBorder(listing.status);

  const handleForward = async () => {
    const text = buildForwardCopy(listing, labels, locale);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <article
      className={`relative flex h-full flex-col gap-2 rounded-xl border-2 bg-card p-3 shadow-sm transition ${borderClass}`}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {listing.category === "SALE" ? labels.categorySale : labels.categoryRent}
          </p>
          <p className="text-[13px] font-semibold text-foreground">
            {statusToLabel(listing.status, labels)}
          </p>
        </div>
        <CardActionsMenu
          triggerLabel={labels.openMenu}
          actions={[
            {
              id: "meeting",
              label: labels.actionMeeting,
              onSelect: () => onUpdateStatus(listing, "MEETING_SCHEDULED"),
            },
            {
              id: "rented",
              label: labels.actionRented,
              onSelect: () => onUpdateStatus(listing, "RENTED"),
            },
            {
              id: "forward",
              label: labels.actionForward,
              onSelect: handleForward,
            },
            {
              id: "edit",
              label: labels.actionEdit,
              onSelect: () => onEdit(listing),
            },
            {
              id: "delete",
              label: labels.actionDelete,
              destructive: true,
              onSelect: () => onDelete(listing),
            },
          ]}
        />
      </header>

      <div className="grid gap-1.5">
        {listing.myhomeId ? (
          <AutoCopyField
            label={labels.myhomeId}
            value={listing.myhomeId}
            copyText={myhomeLink}
            copiedLabel={labels.linkCopied}
          />
        ) : null}
        {listing.ssGeId ? (
          <AutoCopyField
            label={labels.ssgeId}
            value={listing.ssGeId}
            copyText={ssgeLink}
            copiedLabel={labels.linkCopied}
          />
        ) : null}
      </div>

      {listing.address ? (
        <p className="text-[13px] font-semibold leading-snug text-foreground">
          {listing.address}
        </p>
      ) : null}

      <dl className="grid grid-cols-3 gap-1 text-[11px]">
        <Field term={labels.bedrooms} description={listing.rooms} />
        <Field term={labels.floor} description={listing.floor} />
        <Field term={labels.apartment} description={listing.apartment} />
        <Field
          term={labels.areaSqm}
          description={listing.areaSqm !== null ? `${listing.areaSqm}` : null}
        />
        <Field
          term={labels.cooperation}
          description={`${listing.cooperation}%`}
        />
        <Field term={labels.phone} description={listing.phone ?? null} />
      </dl>

      {listing.comment ? (
        <p className="rounded-md border border-dashed border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
          {listing.comment}
        </p>
      ) : null}

      <footer className="mt-auto flex items-center justify-between border-t border-border/60 pt-1.5 text-[10px] text-muted-foreground">
        <span>
          {labels.agent}:{" "}
          <span className="font-medium text-foreground">
            {listing.createdBy?.name ?? listing.createdBy?.email ?? "-"}
          </span>
        </span>
        <span>{formatDate(listing.listingDate, locale)}</span>
      </footer>
    </article>
  );
}

function Field({ term, description }: { term: string; description: string | number | null }) {
  return (
    <div className="rounded-md border border-border bg-background/60 px-1.5 py-0.5">
      <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">{term}</dt>
      <dd className="text-[11px] font-semibold text-foreground">
        {description === null || description === "" ? "-" : description}
      </dd>
    </div>
  );
}
