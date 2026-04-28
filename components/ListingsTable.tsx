"use client";

import { ListingDto } from "@/lib/types";
import { useMemo, useState } from "react";

type SortDirection = "asc" | "desc";
type SortKey =
  | "date"
  | "topic"
  | "district"
  | "reference"
  | "recordId"
  | "location"
  | "contact"
  | "status"
  | "progress"
  | "cooperation"
  | "priceFactor";

type ListingsTableProps = {
  listings: ListingDto[];
  locale: string;
  onSelectListing: (listing: ListingDto) => void;
  labels: {
    date: string;
    topic: string;
    district: string;
    reference: string;
    recordId: string;
    location: string;
    contact: string;
    property: string;
    status: string;
    progress: string;
    cooperation: string;
    priceFactor: string;
    open: string;
    copy: string;
    copied: string;
    sort: string;
    noResults: string;
    noReference: string;
    noLocation: string;
    noTopic: string;
    noContact: string;
    noProperty: string;
    sourceMyhome: string;
    sourceSsge: string;
    gldani: string;
    saburtalo: string;
    nakhalovaka: string;
    districtOther: string;
    statusForRent: string;
    statusRented: string;
    statusListed: string;
  };
};

function listingDateLabel(dateText: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date(dateText))
    .replaceAll("/", ".");
}

function statusClass(status: ListingDto["status"]) {
  if (status === "RENTED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "FOR_RENT") {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-amber-100 text-amber-700";
}

function districtClass(district: ListingDto["district"]) {
  if (district === "GLDANI") {
    return "bg-indigo-100 text-indigo-700";
  }
  if (district === "SABURTALO") {
    return "bg-cyan-100 text-cyan-700";
  }
  if (district === "NAKHALOVAKA") {
    return "bg-purple-100 text-purple-700";
  }
  return "bg-slate-100 text-slate-700";
}

function statusLabel(status: ListingDto["status"], labels: ListingsTableProps["labels"]) {
  if (status === "RENTED") {
    return labels.statusRented;
  }
  if (status === "FOR_RENT") {
    return labels.statusForRent;
  }
  return labels.statusListed;
}

function statusProgress(status: ListingDto["status"]) {
  if (status === "RENTED") {
    return 100;
  }
  if (status === "FOR_RENT") {
    return 70;
  }
  return 50;
}

function districtLabel(district: ListingDto["district"], labels: ListingsTableProps["labels"]) {
  if (district === "GLDANI") {
    return labels.gldani;
  }
  if (district === "SABURTALO") {
    return labels.saburtalo;
  }
  if (district === "NAKHALOVAKA") {
    return labels.nakhalovaka;
  }
  return labels.districtOther;
}

export function ListingsTable({
  listings,
  locale,
  onSelectListing,
  labels,
}: ListingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [copiedListingId, setCopiedListingId] = useState<number | null>(null);

  const sortedListings = useMemo(() => {
    const sorted = [...listings];

    const valueByKey = (listing: ListingDto, key: SortKey): string | number => {
      switch (key) {
        case "date":
          return new Date(listing.listingDate).getTime();
        case "topic":
          return listing.topic ? `${listing.topic.nameKa} ${listing.topic.nameEn}` : "";
        case "district":
          return districtLabel(listing.district, labels);
        case "reference":
          return listing.source === "MYHOME" ? listing.myhomeId ?? "" : listing.ssGeId ?? "";
        case "recordId":
          return listing.id;
        case "location":
          return listing.address ?? "";
        case "contact":
          return listing.phone ?? "";
        case "status":
          return statusLabel(listing.status, labels);
        case "cooperation":
          return listing.cooperation;
        case "progress":
          return statusProgress(listing.status);
        case "priceFactor":
          return listing.priceFactor ?? Number.NEGATIVE_INFINITY;
        default:
          return "";
      }
    };

    sorted.sort((left, right) => {
      const leftValue = valueByKey(left, sortKey);
      const rightValue = valueByKey(right, sortKey);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return sortDirection === "asc" ? leftValue - rightValue : rightValue - leftValue;
      }

      const comparison = String(leftValue).localeCompare(String(rightValue), locale, {
        sensitivity: "base",
        numeric: true,
      });

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [labels, listings, locale, sortDirection, sortKey]);

  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {labels.noResults}
      </div>
    );
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "date" ? "desc" : "asc");
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) {
      return "↕";
    }
    return sortDirection === "asc" ? "↑" : "↓";
  }

  async function copyReference(reference: string, listingId: number) {
    if (!reference) {
      return;
    }

    try {
      await navigator.clipboard.writeText(reference);
    } catch {
      return;
    }
    setCopiedListingId(listingId);
    window.setTimeout(() => setCopiedListingId((current) => (current === listingId ? null : current)), 1200);
  }

  function SortHeader({ label, sortBy }: { label: string; sortBy: SortKey }) {
    return (
      <th className="px-4 py-3 font-semibold">
        <button
          type="button"
          onClick={() => toggleSort(sortBy)}
          className="inline-flex items-center gap-1 text-left transition hover:text-primary"
          title={labels.sort}
        >
          <span>{label}</span>
          <span className="text-xs text-muted-foreground">{sortIndicator(sortBy)}</span>
        </button>
      </th>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card/95 shadow-[0_6px_20px_rgba(0,0,0,0.05)] backdrop-blur">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-gradient-to-r from-muted/70 to-muted/30 text-left">
          <tr>
            <SortHeader label={labels.date} sortBy="date" />
            <SortHeader label={labels.topic} sortBy="topic" />
            <SortHeader label={labels.district} sortBy="district" />
            <SortHeader label={labels.reference} sortBy="reference" />
            <SortHeader label={labels.recordId} sortBy="recordId" />
            <SortHeader label={labels.location} sortBy="location" />
            <SortHeader label={labels.contact} sortBy="contact" />
            <th className="px-4 py-3 font-semibold">{labels.property}</th>
            <SortHeader label={labels.status} sortBy="status" />
            <SortHeader label={labels.progress} sortBy="progress" />
            <SortHeader label={labels.cooperation} sortBy="cooperation" />
            <SortHeader label={labels.priceFactor} sortBy="priceFactor" />
            <th className="px-4 py-3 font-semibold">{labels.open}</th>
          </tr>
        </thead>
        <tbody>
          {sortedListings.map((listing) => {
            const sourceLabel =
              listing.source === "MYHOME" ? labels.sourceMyhome : labels.sourceSsge;
            const sourceRef = listing.source === "MYHOME" ? listing.myhomeId : listing.ssGeId;
            const property =
              listing.rooms || listing.floor || listing.apartment
                ? `${listing.rooms ?? "-"} / ${listing.floor ?? "-"} / ${listing.apartment ?? "-"}`
                : labels.noProperty;

            return (
              <tr
                key={listing.id}
                className="border-t border-border align-middle transition odd:bg-background even:bg-muted/10 hover:bg-muted/30"
              >
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {listingDateLabel(listing.listingDate, locale)}
                </td>
                <td className="px-4 py-3">
                  {listing.topic
                    ? `${listing.topic.nameKa} / ${listing.topic.nameEn}`
                    : labels.noTopic}
                </td>
                <td className="px-4 py-3">
                  <div
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${districtClass(
                      listing.district
                    )}`}
                  >
                    {districtLabel(listing.district, labels)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {sourceLabel}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-medium">{sourceRef ?? labels.noReference}</span>
                    {sourceRef ? (
                      <button
                        type="button"
                        className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                        onClick={() => copyReference(sourceRef, listing.id)}
                      >
                        {copiedListingId === listing.id ? labels.copied : labels.copy}
                      </button>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{listing.id}</td>
                <td className="max-w-56 px-4 py-3">
                  <span className="line-clamp-2">{listing.address ?? labels.noLocation}</span>
                </td>
                <td className="px-4 py-3">{listing.phone ?? labels.noContact}</td>
                <td className="px-4 py-3">{property}</td>
                <td className="px-4 py-3">
                  <div
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(
                      listing.status
                    )}`}
                  >
                    {statusLabel(listing.status, labels)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-20">
                    <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{statusProgress(listing.status)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${statusProgress(listing.status)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{listing.cooperation}%</td>
                <td className="px-4 py-3">{listing.priceFactor?.toFixed(2) ?? "-"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary"
                    onClick={() => onSelectListing(listing)}
                  >
                    {labels.open}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
