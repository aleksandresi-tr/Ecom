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
    values: {
      source?: ListingDto["source"];
      myhomeId?: string | null;
      ssGeId?: string | null;
      status: ListingDto["status"];
      category: ListingDto["category"];
      cooperation: number;
      topicId: number | null;
      rooms: number | null;
      floor: number | null;
      apartment: number | null;
      areaSqm: number | null;
      phone: string | null;
      tenantName: string | null;
      priceGEL: number | null;
      address: string | null;
      comment: string | null;
    }
  ) => Promise<void>;
  onDelete: (listingId: number) => void;
  topics: { id: number; nameKa: string; nameEn: string }[];
  locale: string;
  labels: {
    title: string;
    close: string;
    source: string;
    status: string;
    category: string;
    cooperation: string;
    phone: string;
    tenant: string;
    rooms: string;
    bedrooms: string;
    floor: string;
    apartment: string;
    areaSqm: string;
    price: string;
    address: string;
    comment: string;
    date: string;
    sourceLink: string;
    topic: string;
    save: string;
    delete: string;
    actionsTitle: string;
    workflowTitle: string;
    workflowStep1: string;
    workflowStep2: string;
    workflowStep3: string;
    workflowStep4: string;
    workflowStep5: string;
    addedBy: string;
    addedAt: string;
    sourceMyhome: string;
    sourceSsge: string;
    statusForRent: string;
    statusRented: string;
    statusListed: string;
    statusMeeting: string;
    categoryRent: string;
    categorySale: string;
    categoryCommercial: string;
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
  const [category, setCategory] = useState<ListingDto["category"]>("RENT");
  const [source, setSource] = useState<ListingDto["source"]>("MYHOME");
  const [myhomeId, setMyhomeId] = useState("");
  const [ssGeId, setSsGeId] = useState("");
  const [cooperation, setCooperation] = useState("100");
  const [topicId, setTopicId] = useState<string>("");
  const [rooms, setRooms] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [phone, setPhone] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [priceGEL, setPriceGEL] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!listing) return;
    setStatus(listing.status);
    setCategory(listing.category);
    setSource(listing.source);
    setMyhomeId(listing.myhomeId ?? "");
    setSsGeId(listing.ssGeId ?? "");
    setCooperation(String(listing.cooperation));
    setTopicId(listing.topicId ? String(listing.topicId) : "");
    setRooms(listing.rooms === null ? "" : String(listing.rooms));
    setFloor(listing.floor === null ? "" : String(listing.floor));
    setApartment(listing.apartment === null ? "" : String(listing.apartment));
    setAreaSqm(listing.areaSqm === null ? "" : String(listing.areaSqm));
    setPhone(listing.phone ?? "");
    setTenantName(listing.tenantName ?? "");
    setPriceGEL(listing.priceGEL === null ? "" : String(listing.priceGEL));
    setAddress(listing.address ?? "");
    setComment(listing.comment ?? "");
  }, [listing]);

  async function handleSave() {
    if (!listing) return;
    const parsedCooperation = Number(cooperation);
    if (Number.isNaN(parsedCooperation) || parsedCooperation < 0 || parsedCooperation > 100) {
      return;
    }
    setSaving(true);
    try {
      await onSave(listing.id, {
        source,
        myhomeId: source === "MYHOME" ? parseNullableString(myhomeId) : null,
        ssGeId: source === "SS_GE" ? parseNullableString(ssGeId) : null,
        status,
        category,
        cooperation: parsedCooperation,
        topicId: topicId ? Number(topicId) : null,
        rooms: parseNullableInt(rooms),
        floor: parseNullableInt(floor),
        apartment: parseNullableInt(apartment),
        areaSqm: parseNullableFloat(areaSqm),
        phone: parseNullableString(phone),
        tenantName: parseNullableString(tenantName),
        priceGEL: parseNullableFloat(priceGEL),
        address: parseNullableString(address),
        comment: parseNullableString(comment),
      });
    } finally {
      setSaving(false);
    }
  }

  const sourceLinks = buildSourceLinks(source, source === "MYHOME" ? myhomeId : ssGeId);
  const currentSourceId = source === "MYHOME" ? myhomeId : ssGeId;
  const formattedDate = listing
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(listing.listingDate))
    : "-";
  const selectedTopic = topics.find((topicOption) => String(topicOption.id) === topicId);
  const topicLabel = selectedTopic
    ? `${selectedTopic.nameKa} / ${selectedTopic.nameEn}`
    : listing?.topic
    ? `${listing.topic.nameKa} / ${listing.topic.nameEn}`
    : "-";

  const sourceLabel =
    source === "MYHOME" ? labels.sourceMyhome : source === "SS_GE" ? labels.sourceSsge : "-";

  const statusLabel =
    status === "FOR_RENT"
      ? labels.statusForRent
      : status === "RENTED"
      ? labels.statusRented
      : status === "MEETING_SCHEDULED"
      ? labels.statusMeeting
      : status === "LISTED"
      ? labels.statusListed
      : "-";

  const categoryLabel =
    category === "SALE"
      ? labels.categorySale
      : category === "COMMERCIAL"
        ? labels.categoryCommercial
        : labels.categoryRent;

  const inputClass =
    "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary";

  return (
    <>
      <button
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        className={`fixed inset-0 z-20 bg-black/35 transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-30 h-full w-full max-w-[560px] border-l border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-border/80 bg-gradient-to-r from-muted/40 to-transparent p-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{labels.title}</h2>
            <p className="text-xs text-muted-foreground">
              {listing ? `${labels.date}: ${formattedDate}` : "-"}
              {listing?.createdBy
                ? ` • ${labels.addedBy}: ${listing.createdBy.name ?? listing.createdBy.email}`
                : null}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            {labels.close}
          </Button>
        </div>

        <div className="h-[calc(100%-65px)] space-y-4 overflow-y-auto p-4 text-sm">
          {!listing ? (
            <div className="text-muted-foreground">-</div>
          ) : (
            <>
              <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {labels.title}
                </div>
                <div className="grid gap-2">
                  <InfoRow label={labels.source} value={sourceLabel} />
                  <InfoRow label={labels.category} value={categoryLabel} />
                  <InfoRow label={labels.status} value={statusLabel} />
                  <InfoRow label={labels.cooperation} value={`${value(cooperation)}%`} />
                  <InfoRow label={labels.topic} value={topicLabel} />
                  <InfoRow label={labels.phone} value={value(phone)} />
                  <InfoRow label={labels.tenant} value={value(tenantName)} />
                  <InfoRow label={labels.bedrooms} value={value(rooms)} />
                  <InfoRow label={labels.floor} value={value(floor)} />
                  <InfoRow label={labels.apartment} value={value(apartment)} />
                  <InfoRow label={labels.areaSqm} value={value(areaSqm)} />
                  <InfoRow label={labels.price} value={value(priceGEL)} />
                  <InfoRow label={labels.address} value={value(address)} />
                  <InfoRow label={labels.comment} value={value(comment)} />
                  <div className="grid grid-cols-[96px,1fr] gap-3 rounded-lg border border-border/80 bg-background/60 p-2.5">
                    <div className="text-xs text-muted-foreground">{labels.sourceLink}</div>
                    <div className="font-medium">
                      {sourceLinks.length > 0 ? (
                        <div className="grid gap-1">
                          {sourceLinks.map((linkOption) => (
                            <a
                              key={linkOption.href}
                              className="break-all text-primary underline"
                              href={linkOption.href}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {linkOption.label}
                            </a>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="mb-2 text-sm font-semibold">{labels.workflowTitle}</div>
                <ol className="grid gap-1.5 text-xs">
                  <WorkflowStep label={labels.workflowStep1} done />
                  <WorkflowStep label={labels.workflowStep2} done />
                  <WorkflowStep
                    label={labels.workflowStep3}
                    done={status !== "LISTED"}
                  />
                  <WorkflowStep
                    label={labels.workflowStep4}
                    done={status === "RENTED"}
                  />
                  <WorkflowStep label={labels.workflowStep5} done={Boolean(phone)} />
                </ol>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="mb-3 text-sm font-semibold">{labels.actionsTitle}</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">{labels.source}</span>
                    <select
                      className={inputClass}
                      value={source}
                      onChange={(event) =>
                        setSource(event.target.value as ListingDto["source"])
                      }
                    >
                      <option value="MYHOME">{labels.sourceMyhome}</option>
                      <option value="SS_GE">{labels.sourceSsge}</option>
                    </select>
                  </label>
                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">{labels.sourceLink}</span>
                    <input
                      className={inputClass}
                      value={currentSourceId}
                      onChange={(event) =>
                        source === "MYHOME"
                          ? setMyhomeId(event.target.value)
                          : setSsGeId(event.target.value)
                      }
                    />
                  </label>
                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">{labels.status}</span>
                    <select
                      className={inputClass}
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as ListingDto["status"])
                      }
                    >
                      <option value="FOR_RENT">{labels.statusForRent}</option>
                      <option value="LISTED">{labels.statusListed}</option>
                      <option value="MEETING_SCHEDULED">{labels.statusMeeting}</option>
                      <option value="RENTED">{labels.statusRented}</option>
                    </select>
                  </label>
                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">{labels.category}</span>
                    <select
                      className={inputClass}
                      value={category}
                      onChange={(event) =>
                        setCategory(event.target.value as ListingDto["category"])
                      }
                    >
                      <option value="RENT">{labels.categoryRent}</option>
                      <option value="SALE">{labels.categorySale}</option>
                      <option value="COMMERCIAL">{labels.categoryCommercial}</option>
                    </select>
                  </label>
                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">
                      {labels.cooperation}
                    </span>
                    <input
                      className={inputClass}
                      value={cooperation}
                      onChange={(event) => setCooperation(event.target.value)}
                      inputMode="numeric"
                    />
                  </label>
                  <label className="grid gap-1 sm:col-span-2">
                    <span className="text-xs text-muted-foreground">{labels.topic}</span>
                    <select
                      className={inputClass}
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
                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    <label className="grid gap-1">
                      <span className="text-xs text-muted-foreground">
                        {labels.bedrooms}
                      </span>
                      <input
                        className={inputClass}
                        value={rooms}
                        onChange={(event) => setRooms(event.target.value)}
                        inputMode="numeric"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-muted-foreground">{labels.floor}</span>
                      <input
                        className={inputClass}
                        value={floor}
                        onChange={(event) => setFloor(event.target.value)}
                        inputMode="numeric"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-muted-foreground">
                        {labels.apartment}
                      </span>
                      <input
                        className={inputClass}
                        value={apartment}
                        onChange={(event) => setApartment(event.target.value)}
                        inputMode="numeric"
                      />
                    </label>
                  </div>
                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">{labels.areaSqm}</span>
                    <input
                      className={inputClass}
                      value={areaSqm}
                      onChange={(event) => setAreaSqm(event.target.value)}
                      inputMode="decimal"
                    />
                  </label>
                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">{labels.phone}</span>
                    <input
                      className={inputClass}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">{labels.tenant}</span>
                    <input
                      className={inputClass}
                      value={tenantName}
                      onChange={(event) => setTenantName(event.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">{labels.price}</span>
                    <input
                      className={inputClass}
                      value={priceGEL}
                      onChange={(event) => setPriceGEL(event.target.value)}
                      inputMode="decimal"
                    />
                  </label>
                  <label className="grid gap-1 sm:col-span-2">
                    <span className="text-xs text-muted-foreground">{labels.address}</span>
                    <input
                      className={inputClass}
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 sm:col-span-2">
                    <span className="text-xs text-muted-foreground">{labels.comment}</span>
                    <textarea
                      className="min-h-[72px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                    />
                  </label>
                  <div className="flex gap-2 sm:col-span-2">
                    <Button type="button" onClick={handleSave} disabled={saving}>
                      {labels.save}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDelete(listing.id)}
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

function parseNullableInt(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function parseNullableFloat(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function buildSourceLinks(source: "MYHOME" | "SS_GE", sourceId: string) {
  const normalizedId = sourceId.trim();
  if (!normalizedId) return [];
  if (source === "MYHOME") {
    return [
      { href: `https://www.myhome.ge/pr/${normalizedId}/`, label: "myhome.ge" },
    ];
  }
  return [
    {
      href: `https://home.ss.ge/ka/udzravi-qoneba/listing-${normalizedId}`,
      label: "ss.ge",
    },
  ];
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-[120px,1fr] gap-3 rounded-lg border border-border/80 bg-background/60 p-2.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{value}</div>
    </div>
  );
}

function WorkflowStep({ label, done }: { label: string; done: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`inline-flex size-4 items-center justify-center rounded-full text-[10px] ${
          done ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? "✓" : "•"}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}
