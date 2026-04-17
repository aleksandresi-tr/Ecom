"use client";

import { ListingDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type ListingDetailPanelProps = {
  listing: ListingDto | null;
  open: boolean;
  onClose: () => void;
  onSave: (
    listingId: number,
    values: { status: ListingDto["status"]; cooperation: number; topicId: number | null }
  ) => Promise<void>;
  onDelete: (listingId: number) => Promise<void>;
  topics: { id: number; nameKa: string; nameEn: string }[];
  locale: string;
  labels: {
    title: string;
    close: string;
    source: string;
    status: string;
    cooperation: string;
    phone: string;
    tenant: string;
    rooms: string;
    floor: string;
    apartment: string;
    price: string;
    address: string;
    date: string;
    sourceLink: string;
    topic: string;
    save: string;
    delete: string;
  };
};

function value(value: string | number | null) {
  if (value === null || value === "") {
    return "-";
  }

  return value;
}

export function ListingDetailPanel({
  listing,
  open,
  onClose,
  onSave,
  onDelete,
  topics,
  locale,
  labels,
}: ListingDetailPanelProps) {
  const [status, setStatus] = useState<ListingDto["status"]>("LISTED");
  const [cooperation, setCooperation] = useState("100");
  const [topicId, setTopicId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!listing) {
      return;
    }

    setStatus(listing.status);
    setCooperation(String(listing.cooperation));
    setTopicId(listing.topicId ? String(listing.topicId) : "");
  }, [listing]);

  async function handleSave() {
    if (!listing) {
      return;
    }

    const parsedCooperation = Number(cooperation);
    if (Number.isNaN(parsedCooperation) || parsedCooperation < 0 || parsedCooperation > 100) {
      return;
    }

    setSaving(true);
    try {
      await onSave(listing.id, {
        status,
        cooperation: parsedCooperation,
        topicId: topicId ? Number(topicId) : null,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!listing) {
      return;
    }

    setSaving(true);
    try {
      await onDelete(listing.id);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const sourceLink =
    listing?.source === "MYHOME" && listing.myhomeId
      ? `https://www.myhome.ge/en/pr/${listing.myhomeId}`
      : listing?.source === "SS_GE" && listing.ssGeId
      ? `https://www.ss.ge/en/real-estate/l/${listing.ssGeId}`
      : null;

  return (
    <>
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className={`fixed inset-0 z-20 bg-black/35 transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-30 h-full w-full max-w-md border-l border-border/80 bg-background shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border/80 p-4">
          <h2 className="text-lg font-semibold tracking-tight">{labels.title}</h2>
          <Button variant="outline" onClick={onClose}>
            {labels.close}
          </Button>
        </div>

        <div className="h-[calc(100%-65px)] space-y-3 overflow-y-auto p-4 text-sm">
          {!listing ? (
            <div className="text-muted-foreground">-</div>
          ) : (
            <>
              <Row label={labels.source} value={listing.source} />
              <Row label={labels.status} value={listing.status} />
              <Row label={labels.cooperation} value={`${listing.cooperation}%`} />
              <Row label={labels.phone} value={value(listing.phone)} />
              <Row label={labels.tenant} value={value(listing.tenantName)} />
              <Row label={labels.rooms} value={value(listing.rooms)} />
              <Row label={labels.floor} value={value(listing.floor)} />
              <Row label={labels.apartment} value={value(listing.apartment)} />
              <Row label={labels.price} value={value(listing.priceGEL)} />
              <Row label={labels.address} value={value(listing.address)} />
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-3">
                <div className="text-muted-foreground">{labels.sourceLink}</div>
                <div className="font-medium">
                  {sourceLink ? (
                    <a
                      className="break-all text-primary underline"
                      href={sourceLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {sourceLink}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <Row
                label={labels.date}
                value={new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                }).format(new Date(listing.listingDate))}
              />
              <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                <div className="mb-3 text-sm font-semibold">{labels.title}</div>
                <div className="grid gap-3">
                  <label className="grid gap-1">
                    <span className="text-xs text-muted-foreground">{labels.status}</span>
                    <select
                      className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                      value={status}
                      onChange={(event) => setStatus(event.target.value as ListingDto["status"])}
                    >
                      <option value="FOR_RENT">FOR_RENT</option>
                      <option value="RENTED">RENTED</option>
                      <option value="LISTED">LISTED</option>
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-muted-foreground">{labels.cooperation}</span>
                    <input
                      className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                      value={cooperation}
                      onChange={(event) => setCooperation(event.target.value)}
                      inputMode="numeric"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-muted-foreground">{labels.topic}</span>
                    <select
                      className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                      value={topicId}
                      onChange={(event) => setTopicId(event.target.value)}
                    >
                      <option value="">-</option>
                      {topics.map((topicOption) => (
                        <option key={topicOption.id} value={topicOption.id}>
                          {topicOption.nameKa} / {topicOption.nameEn}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleSave} disabled={saving}>
                      {labels.save}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={saving}
                    >
                      {labels.delete}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-3">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
