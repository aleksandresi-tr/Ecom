"use client";

import { Button } from "@/components/ui/button";
import { getLocationHierarchy } from "@/lib/location-hierarchy";
import { ListingDto, TopicDto } from "@/lib/types";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const UNSPECIFIED_SUBAREA = "__UNSPECIFIED__";

type CreatePayload = {
  source: ListingDto["source"];
  district: ListingDto["district"];
  status: ListingDto["status"];
  category: ListingDto["category"];
  cooperation: number;
  myhomeId: string | null;
  ssGeId: string | null;
  phone: string | null;
  tenantName: string | null;
  topicId: number | null;
  rooms: number | null;
  floor: number | null;
  apartment: number | null;
  areaSqm: number | null;
  priceGEL: number | null;
  address: string | null;
  comment: string | null;
};

type AddListingFormProps = {
  topics: TopicDto[];
  listings: ListingDto[];
  isAdmin: boolean;
  locale: string;
  onCreate: (payload: CreatePayload) => Promise<void>;
  labels: {
    sectionLabel: string;
    panelTitle: string;
    quickAddHint: string;
    statusForRent: string;
    statusListed: string;
    categoryRent: string;
    categorySale: string;
    categoryCommercial: string;
    categoryRentSale: string;
    cooperation: string;
    topic: string;
    allTopics: string;
    myhomeId: string;
    ssgeId: string;
    phone: string;
    tenant: string;
    bedrooms: string;
    rooms: string;
    floor: string;
    apartment: string;
    areaSqm: string;
    price: string;
    address: string;
    comment: string;
    addressAutocompleteHint: string;
    cityField: string;
    groupField: string;
    areaField: string;
    subAreaField: string;
    streetField: string;
    optionalSubArea: string;
    optionalStreet: string;
    locationPreview: string;
    addListing: string;
    creating: string;
    districtTitle: string;
    gldani: string;
    saburtalo: string;
    nakhalovaka: string;
    districtOther: string;
    statusField: string;
  };
};

const COOPERATION_PRESETS = [100, 70, 50] as const;
const ROOM_OPTIONS = ["1", "2", "3", "4", "5", "6", "6+"] as const;

const STATUSES: Array<ListingDto["status"]> = ["FOR_RENT", "LISTED"];

const DISTRICTS: Array<ListingDto["district"]> = [
  "GLDANI",
  "SABURTALO",
  "NAKHALOVAKA",
  "OTHER",
];

export function AddListingForm({
  topics,
  listings,
  isAdmin,
  locale,
  onCreate,
  labels,
}: AddListingFormProps) {
  const hierarchy = useMemo(() => getLocationHierarchy(locale), [locale]);

  const [status, setStatus] = useState<ListingDto["status"]>("LISTED");
  const [category, setCategory] = useState<ListingDto["category"]>("RENT");
  const [cooperation, setCooperation] = useState("100");
  const [topicId, setTopicId] = useState<string>("");
  const [myhomeId, setMyhomeId] = useState("");
  const [ssGeId, setSsGeId] = useState("");
  const [phone, setPhone] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [rooms, setRooms] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [apartment, setApartment] = useState<string>("");
  const [areaSqm, setAreaSqm] = useState("");
  const [priceGEL, setPriceGEL] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [creating, setCreating] = useState(false);

  const [cityId, setCityId] = useState("TBILISI");
  const [groupId, setGroupId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [subAreaId, setSubAreaId] = useState(UNSPECIFIED_SUBAREA);
  const [streetText, setStreetText] = useState("");
  const [district, setDistrict] = useState<ListingDto["district"]>("OTHER");

  const selectedCity = hierarchy.find((c) => c.id === cityId) ?? hierarchy[0];
  const selectedGroup =
    selectedCity?.groups.find((g) => g.id === groupId) ?? selectedCity?.groups[0];
  const selectedArea =
    selectedGroup?.areas.find((a) => a.id === areaId) ?? selectedGroup?.areas[0];
  const hasAreaStreets = (selectedArea?.streets?.length ?? 0) > 0;
  const hasSubAreas = (selectedArea?.subAreas?.length ?? 0) > 0;
  const selectedSubArea =
    subAreaId === UNSPECIFIED_SUBAREA
      ? undefined
      : selectedArea?.subAreas.find((sa) => sa.id === subAreaId);
  const availableStreets = hasAreaStreets
    ? selectedArea?.streets ?? []
    : selectedSubArea?.streets ?? [];

  const generatedAddress = useMemo(() => {
    if (!selectedCity || !selectedGroup || !selectedArea) return "";
    const subAreaLabel = selectedSubArea ? ` > ${selectedSubArea.label}` : "";
    const streetLabel = streetText.trim() ? ` > ${streetText.trim()}` : "";
    return `${selectedCity.label} > ${selectedGroup.label} > ${selectedArea.label}${subAreaLabel}${streetLabel}`;
  }, [selectedCity, selectedGroup, selectedArea, selectedSubArea, streetText]);

  useEffect(() => {
    if (!selectedCity) return;
    if (!selectedGroup || !selectedCity.groups.some((g) => g.id === groupId)) {
      setGroupId(selectedCity.groups[0]?.id ?? "");
      return;
    }
    if (!selectedArea || !selectedGroup.areas.some((a) => a.id === areaId)) {
      setAreaId(selectedGroup.areas[0]?.id ?? "");
      return;
    }
    if (hasAreaStreets) {
      if (subAreaId !== UNSPECIFIED_SUBAREA) {
        setSubAreaId(UNSPECIFIED_SUBAREA);
      }
      return;
    }
    if (
      subAreaId !== UNSPECIFIED_SUBAREA &&
      !(selectedArea.subAreas ?? []).some((sa) => sa.id === subAreaId)
    ) {
      setSubAreaId(UNSPECIFIED_SUBAREA);
    }
  }, [
    selectedCity,
    selectedGroup,
    selectedArea,
    hasAreaStreets,
    groupId,
    areaId,
    subAreaId,
  ]);

  // Clear typed street whenever the location parents change so a stale street name doesn't carry over.
  useEffect(() => {
    setStreetText("");
  }, [cityId, groupId, areaId, subAreaId]);

  useEffect(() => {
    if (selectedGroup) {
      setDistrict(selectedGroup.district as ListingDto["district"]);
    }
  }, [selectedGroup]);

  const addressSuggestions = useMemo(() => {
    const fromListings = listings
      .map((l) => l.address)
      .filter((value): value is string => Boolean(value));
    const fromHierarchy = hierarchy.flatMap((city) =>
      city.groups.flatMap((group) =>
        group.areas.flatMap((area) => {
          const directStreets = (area.streets ?? []).map(
            (st) => `${city.label} > ${area.label} > ${st.label}`,
          );
          const subAreaStreets = (area.subAreas ?? []).flatMap((sa) =>
            (sa.streets ?? []).map(
              (st) => `${city.label} > ${area.label} > ${sa.label} > ${st.label}`,
            ),
          );
          return [...directStreets, ...subAreaStreets];
        }),
      ),
    );
    return Array.from(new Set([...fromListings, ...fromHierarchy])).slice(0, 2000);
  }, [listings, hierarchy]);

  function statusLabel(value: ListingDto["status"]) {
    switch (value) {
      case "FOR_RENT":
        return labels.statusForRent;
      case "LISTED":
      default:
        return labels.statusListed;
    }
  }

  function districtLabel(value: ListingDto["district"]) {
    switch (value) {
      case "GLDANI":
        return labels.gldani;
      case "SABURTALO":
        return labels.saburtalo;
      case "NAKHALOVAKA":
        return labels.nakhalovaka;
      default:
        return labels.districtOther;
    }
  }

  function parseInteger(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed === "6+") return 6;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
  }

  function parseFloatField(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function nullableString(value: string) {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    try {
      const myhome = nullableString(myhomeId);
      const ssGe = nullableString(ssGeId);
      const derivedSource: ListingDto["source"] =
        myhome && !ssGe ? "MYHOME" : !myhome && ssGe ? "SS_GE" : "MYHOME";

      await onCreate({
        source: derivedSource,
        district,
        status,
        category,
        cooperation: Math.max(0, Math.min(100, Math.trunc(Number(cooperation) || 0))),
        myhomeId: myhome,
        ssGeId: ssGe,
        phone: nullableString(phone),
        tenantName: nullableString(tenantName),
        topicId: topicId ? Number(topicId) : null,
        rooms: parseInteger(rooms),
        floor: parseInteger(floor),
        apartment: parseInteger(apartment),
        areaSqm: parseFloatField(areaSqm),
        priceGEL: parseFloatField(priceGEL),
        address: nullableString(address) ?? generatedAddress ?? null,
        comment: nullableString(comment),
      });
      setMyhomeId("");
      setSsGeId("");
      setPhone("");
      setTenantName("");
      setRooms("");
      setFloor("");
      setApartment("");
      setAreaSqm("");
      setPriceGEL("");
      setAddress("");
      setComment("");
      setStreetText("");
    } finally {
      setCreating(false);
    }
  }

  const roomSelectOptions = [
    { value: "", label: "—" },
    ...ROOM_OPTIONS.map((opt) => ({ value: opt, label: opt })),
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border/80 bg-card/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur"
    >
      <div className="mb-2 border-b border-border/70 pb-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {labels.sectionLabel}
        </p>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {labels.panelTitle}
        </h2>
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-end gap-3">
          <ToggleRow
            label={labels.categoryRentSale}
            options={[
              { value: "RENT", label: labels.categoryRent },
              { value: "SALE", label: labels.categorySale },
              { value: "COMMERCIAL", label: labels.categoryCommercial },
            ]}
            value={category}
            onChange={(v) => setCategory(v as ListingDto["category"])}
          />
          <ToggleRow
            label={labels.statusField}
            options={STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
            value={status}
            onChange={(v) => setStatus(v as ListingDto["status"])}
          />
          <ToggleRow
            label={labels.cooperation}
            options={COOPERATION_PRESETS.map((value) => ({
              value: String(value),
              label: `${value}%`,
            }))}
            value={cooperation}
            onChange={setCooperation}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="w-32">
            <FloatingInput
              label={labels.myhomeId}
              value={myhomeId}
              onChange={setMyhomeId}
              inputMode="numeric"
            />
          </div>
          <div className="w-32">
            <FloatingInput
              label={labels.ssgeId}
              value={ssGeId}
              onChange={setSsGeId}
              inputMode="numeric"
            />
          </div>
          <div className="w-40">
            <FloatingInput label={labels.phone} value={phone} onChange={setPhone} />
          </div>
          <div className="w-24">
            <FloatingInput
              label={labels.price}
              value={priceGEL}
              onChange={setPriceGEL}
              inputMode="decimal"
            />
          </div>
          <div className="w-24">
            <FloatingInput
              label={labels.areaSqm}
              value={areaSqm}
              onChange={setAreaSqm}
              inputMode="decimal"
            />
          </div>
          <div className="min-w-[10rem] flex-1">
            <FloatingInput
              label={labels.tenant}
              value={tenantName}
              onChange={setTenantName}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="w-24">
            <FloatingSelect
              label={labels.bedrooms}
              value={rooms}
              onChange={setRooms}
              options={roomSelectOptions}
            />
          </div>
          <div className="w-24">
            <FloatingSelect
              label={labels.floor}
              value={floor}
              onChange={setFloor}
              options={roomSelectOptions}
            />
          </div>
          <div className="w-24">
            <FloatingSelect
              label={labels.apartment}
              value={apartment}
              onChange={setApartment}
              options={roomSelectOptions}
            />
          </div>
          <div className="min-w-[12rem] flex-1">
            <FloatingSelect
              label={labels.topic}
              value={topicId}
              onChange={setTopicId}
              options={[
                { value: "", label: labels.allTopics },
                ...topics.map((t) => ({
                  value: String(t.id),
                  label: `${t.nameKa} / ${t.nameEn}`,
                })),
              ]}
            />
          </div>
        </div>

        {isAdmin ? (
          <ToggleRow
            label={labels.districtTitle}
            options={DISTRICTS.map((d) => ({ value: d, label: districtLabel(d) }))}
            value={district}
            onChange={(v) => setDistrict(v as ListingDto["district"])}
          />
        ) : null}

        <div className="grid gap-2 md:grid-cols-5">
          <FloatingSelect
            label={labels.cityField}
            value={cityId}
            onChange={setCityId}
            options={hierarchy.map((c) => ({ value: c.id, label: c.label }))}
          />
          <FloatingSelect
            label={labels.groupField}
            value={selectedGroup?.id ?? ""}
            onChange={setGroupId}
            options={(selectedCity?.groups ?? []).map((g) => ({
              value: g.id,
              label: g.label,
            }))}
          />
          <FloatingSelect
            label={labels.areaField}
            value={selectedArea?.id ?? ""}
            onChange={setAreaId}
            options={(selectedGroup?.areas ?? []).map((a) => ({
              value: a.id,
              label: a.label,
            }))}
          />
          {hasSubAreas ? (
            <FloatingSelect
              label={labels.subAreaField}
              value={subAreaId}
              onChange={setSubAreaId}
              options={[
                { value: UNSPECIFIED_SUBAREA, label: labels.optionalSubArea },
                ...(selectedArea?.subAreas ?? []).map((sa) => ({
                  value: sa.id,
                  label: sa.label,
                })),
              ]}
            />
          ) : (
            <span />
          )}
          <div>
            <FloatingInput
              label={labels.streetField}
              value={streetText}
              onChange={setStreetText}
              list="street-datalist"
              placeholder={labels.optionalStreet}
            />
            <datalist id="street-datalist">
              {availableStreets.map((st) => (
                <option key={st.id} value={st.label} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid gap-1">
          <FloatingInput
            label={labels.address}
            value={address}
            onChange={setAddress}
            list="address-autocomplete"
            placeholder={generatedAddress}
          />
          <datalist id="address-autocomplete">
            {addressSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          <p className="text-[10px] text-muted-foreground">
            {labels.addressAutocompleteHint}
          </p>
        </div>

        <FloatingTextarea label={labels.comment} value={comment} onChange={setComment} />

        <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">
              {labels.locationPreview}:
            </span>{" "}
            {generatedAddress || "-"}
          </span>
          <Button type="submit" disabled={creating} size="sm" className="rounded-md">
            <Plus className="size-3.5" />
            {creating ? labels.creating : labels.addListing}
          </Button>
        </div>
      </div>
    </form>
  );
}

function ToggleRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T | string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-md border px-2 py-0.5 text-[11px] transition ${
                active
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300"
                  : "border-border bg-background text-muted-foreground hover:border-primary"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FloatingInput({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  list,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
  list?: string;
}) {
  return (
    <label className="relative block">
      <input
        list={list}
        placeholder={placeholder ?? " "}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="peer h-9 w-full rounded-md border border-border bg-background px-2 pt-3 text-[12px] outline-none transition focus:border-primary"
      />
      <span className="pointer-events-none absolute left-2 top-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/80 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-[11px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-0.5 peer-focus:text-[9px] peer-focus:uppercase peer-focus:tracking-wide">
        {label}
      </span>
    </label>
  );
}

function FloatingSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-2 top-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/80">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-border bg-background px-2 pt-3 text-[12px] outline-none transition focus:border-primary"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FloatingTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative block">
      <textarea
        placeholder=" "
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="peer w-full rounded-md border border-border bg-background px-2 pt-3.5 pb-1 text-[12px] outline-none transition focus:border-primary"
      />
      <span className="pointer-events-none absolute left-2 top-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/80 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-[11px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-0.5 peer-focus:text-[9px] peer-focus:uppercase peer-focus:tracking-wide">
        {label}
      </span>
    </label>
  );
}
