"use client";

import { ListingCard, ListingCardLabels } from "@/components/ListingCard";
import { ListingDto } from "@/lib/types";
import { useMemo } from "react";

type ListingsBoardProps = {
  listings: ListingDto[];
  locale: string;
  cardLabels: ListingCardLabels;
  emptyLabel: string;
  newDayLabel: string;
  onEdit: (listing: ListingDto) => void;
  onDelete: (listing: ListingDto) => void;
  onUpdateStatus: (listing: ListingDto, status: ListingDto["status"]) => void;
  selectedListingId: number | null;
};

function dayKey(dateText: string) {
  const date = new Date(dateText);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

function dayDisplay(dateText: string, locale: string) {
  const date = new Date(dateText);
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
}

export function ListingsBoard({
  listings,
  locale,
  cardLabels,
  emptyLabel,
  newDayLabel,
  onEdit,
  onDelete,
  onUpdateStatus,
  selectedListingId,
}: ListingsBoardProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, ListingDto[]>();
    for (const item of listings) {
      const key = dayKey(item.listingDate);
      const bucket = map.get(key);
      if (bucket) {
        bucket.push(item);
      } else {
        map.set(key, [item]);
      }
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: dayDisplay(items[0].listingDate, locale),
      items,
    }));
  }, [listings, locale]);

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/80 px-6 py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map((group, groupIndex) => (
        <section key={group.key} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-10 rounded-full bg-rose-500" />
            <h4 className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
              {groupIndex === 0 ? group.label : `${newDayLabel} • ${group.label}`}
            </h4>
            <div className="h-0.5 flex-1 rounded-full bg-rose-500/40" />
            <span className="text-xs text-muted-foreground">
              {group.items.length}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {group.items.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                labels={cardLabels}
                locale={locale}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdateStatus={onUpdateStatus}
                isSelected={selectedListingId === listing.id}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
