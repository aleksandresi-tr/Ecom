"use client";

import { ListingDto } from "@/lib/types";

type ListingsTableProps = {
  listings: ListingDto[];
  locale: string;
  onSelectListing: (listing: ListingDto) => void;
  labels: {
    topic: string;
    gldani: string;
    saburtalo: string;
    nakhalovaka: string;
    priceFactor: string;
    noResults: string;
  };
};

function listingDateLabel(dateText: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateText));
}

function ListingCell({
  listing,
  district,
  onSelect,
}: {
  listing: ListingDto;
  district: ListingDto["district"];
  onSelect: (listing: ListingDto) => void;
}) {
  if (listing.district !== district) {
    return (
      <div className="flex h-full min-h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-xs text-muted-foreground">
        -
      </div>
    );
  }

  const sourceLabel = listing.source === "MYHOME" ? "Myhome" : "SS.ge";
  const idLabel = listing.source === "MYHOME" ? listing.myhomeId : listing.ssGeId;

  return (
    <button
      type="button"
      className="w-full rounded-lg border border-border bg-background p-3 text-left text-xs shadow-sm transition hover:-translate-y-px hover:border-primary hover:shadow-md"
      onClick={() => onSelect(listing)}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          {sourceLabel}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {listing.cooperation}%
        </span>
      </div>
      <div className="font-semibold">{idLabel ?? "-"}</div>
      <div className="mt-1 text-muted-foreground">{listing.phone ?? "-"}</div>
      <div className="mt-2 text-muted-foreground">
        {listing.rooms ?? "-"} / {listing.floor ?? "-"} / {listing.apartment ?? "-"}
      </div>
    </button>
  );
}

export function ListingsTable({
  listings,
  locale,
  onSelectListing,
  labels,
}: ListingsTableProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {labels.noResults}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">{labels.topic}</th>
            <th className="px-4 py-3 font-semibold">{labels.gldani}</th>
            <th className="px-4 py-3 font-semibold">{labels.saburtalo}</th>
            <th className="px-4 py-3 font-semibold">{labels.nakhalovaka}</th>
            <th className="px-4 py-3 font-semibold">{labels.priceFactor}</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing, index) => {
            const currentDate = listingDateLabel(listing.listingDate, locale);
            const previousDate =
              index > 0
                ? listingDateLabel(listings[index - 1].listingDate, locale)
                : null;

            return (
              <tr key={listing.id} className="border-t border-border align-top">
                <td colSpan={5} className="p-0">
                  {previousDate !== currentDate ? (
                    <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground">
                      {currentDate}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-5 gap-3 px-4 py-4">
                    <div className="rounded-lg border border-border bg-background p-3 text-xs shadow-sm">
                      <div className="font-semibold tracking-tight">
                        {listing.topic
                          ? `${listing.topic.nameKa} / ${listing.topic.nameEn}`
                          : "-"}
                      </div>
                      <div className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {listing.status}
                      </div>
                    </div>
                    <ListingCell
                      listing={listing}
                      district="GLDANI"
                      onSelect={onSelectListing}
                    />
                    <ListingCell
                      listing={listing}
                      district="SABURTALO"
                      onSelect={onSelectListing}
                    />
                    <ListingCell
                      listing={listing}
                      district="NAKHALOVAKA"
                      onSelect={onSelectListing}
                    />
                    <div className="rounded-lg border border-border bg-background p-3 text-xs shadow-sm">
                      {listing.priceFactor?.toFixed(2) ?? "-"}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
