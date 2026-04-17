"use client";

import { ListingDetailPanel } from "@/components/ListingDetailPanel";
import { ListingsTable } from "@/components/ListingsTable";
import { SearchBar } from "@/components/SearchBar";
import { TopicInput } from "@/components/TopicInput";
import { Button } from "@/components/ui/button";
import { ListingDto, ListingsResponse, TopicsResponse } from "@/lib/types";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import useSWR from "swr";

const fetcher = async <T,>(url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
};

export function ListingsWorkspace() {
  const locale = useLocale();
  const tListings = useTranslations("listings");
  const tDetail = useTranslations("detail");

  const [search, setSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [newSource, setNewSource] = useState<"MYHOME" | "SS_GE">("MYHOME");
  const [newDistrict, setNewDistrict] = useState<"GLDANI" | "SABURTALO" | "NAKHALOVAKA">(
    "GLDANI"
  );
  const [newStatus, setNewStatus] = useState<"FOR_RENT" | "RENTED" | "LISTED">("LISTED");
  const [newMyhomeId, setNewMyhomeId] = useState("");
  const [newSsId, setNewSsId] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const listingsQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    if (selectedTopicId) {
      params.set("topicId", String(selectedTopicId));
    }

    const query = params.toString();
    return `/api/listings${query ? `?${query}` : ""}`;
  }, [search, selectedTopicId]);

  const { data: listingsData, mutate: mutateListings } = useSWR<ListingsResponse>(
    listingsQuery,
    fetcher
  );
  const { data: topicsData, mutate: mutateTopics } = useSWR<TopicsResponse>(
    "/api/topics",
    fetcher
  );

  async function handleCreateTopic(nameKa: string, nameEn: string) {
    const response = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameKa, nameEn }),
    });

    if (!response.ok) {
      throw new Error("Could not create topic.");
    }

    await Promise.all([mutateTopics(), mutateListings()]);
  }

  async function handleSaveListing(
    listingId: number,
    values: { status: ListingDto["status"]; cooperation: number; topicId: number | null }
  ) {
    const response = await fetch(`/api/listings/${listingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error("Could not save listing.");
    }

    const payload = (await response.json()) as { listing: ListingDto };
    setSelectedListing(payload.listing);
    await mutateListings();
  }

  async function handleDeleteListing(listingId: number) {
    const response = await fetch(`/api/listings/${listingId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Could not delete listing.");
    }

    setSelectedListing(null);
    await mutateListings();
  }

  async function handleCreateListing() {
    setCreating(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: newSource,
          district: newDistrict,
          status: newStatus,
          myhomeId: newSource === "MYHOME" ? newMyhomeId || null : null,
          ssGeId: newSource === "SS_GE" ? newSsId || null : null,
          phone: newPhone || null,
          cooperation: 100,
          topicId: selectedTopicId,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create listing.");
      }

      setNewMyhomeId("");
      setNewSsId("");
      setNewPhone("");
      await mutateListings();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-5">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={tListings("searchPlaceholder")}
      />
      <TopicInput
        topics={topicsData?.topics ?? []}
        selectedTopicId={selectedTopicId}
        onTopicChange={setSelectedTopicId}
        onCreateTopic={handleCreateTopic}
        labels={{
          allTopics: tListings("allTopics"),
          nameKa: tListings("topicKa"),
          nameEn: tListings("topicEn"),
          addTopic: tListings("addTopic"),
        }}
      />
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Quick Add Listing
          </h2>
          <p className="text-xs text-muted-foreground">
            Create a new listing record with source, district, status and contact.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-6">
          <select
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            value={newSource}
            onChange={(event) => setNewSource(event.target.value as "MYHOME" | "SS_GE")}
          >
            <option value="MYHOME">MYHOME</option>
            <option value="SS_GE">SS_GE</option>
          </select>
          <select
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            value={newDistrict}
            onChange={(event) =>
              setNewDistrict(event.target.value as "GLDANI" | "SABURTALO" | "NAKHALOVAKA")
            }
          >
            <option value="GLDANI">GLDANI</option>
            <option value="SABURTALO">SABURTALO</option>
            <option value="NAKHALOVAKA">NAKHALOVAKA</option>
          </select>
          <select
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            value={newStatus}
            onChange={(event) =>
              setNewStatus(event.target.value as "FOR_RENT" | "RENTED" | "LISTED")
            }
          >
            <option value="FOR_RENT">FOR_RENT</option>
            <option value="RENTED">RENTED</option>
            <option value="LISTED">LISTED</option>
          </select>
          <input
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary disabled:opacity-60"
            value={newMyhomeId}
            onChange={(event) => setNewMyhomeId(event.target.value)}
            placeholder={tListings("myhomeId")}
            disabled={newSource !== "MYHOME"}
          />
          <input
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary disabled:opacity-60"
            value={newSsId}
            onChange={(event) => setNewSsId(event.target.value)}
            placeholder={tListings("ssgeId")}
            disabled={newSource !== "SS_GE"}
          />
          <input
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            value={newPhone}
            onChange={(event) => setNewPhone(event.target.value)}
            placeholder={tListings("phone")}
          />
          <div className="md:col-span-6">
            <Button type="button" onClick={handleCreateListing} disabled={creating} className="rounded-lg px-4">
              <Plus className="size-4" />
              {tListings("addListing")}
            </Button>
          </div>
        </div>
      </div>
      <ListingsTable
        listings={listingsData?.listings ?? []}
        locale={locale}
        onSelectListing={setSelectedListing}
        labels={{
          topic: tListings("topic"),
          gldani: tListings("gldani"),
          saburtalo: tListings("saburtalo"),
          nakhalovaka: tListings("nakhalovaka"),
          priceFactor: tListings("priceFactor"),
          noResults: tListings("noResults"),
        }}
      />
      <ListingDetailPanel
        listing={selectedListing}
        open={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        onSave={handleSaveListing}
        onDelete={handleDeleteListing}
        topics={topicsData?.topics ?? []}
        locale={locale}
        labels={{
          title: tDetail("title"),
          close: tDetail("close"),
          source: tDetail("source"),
          status: tDetail("status"),
          cooperation: tDetail("cooperation"),
          phone: tDetail("phone"),
          tenant: tDetail("tenant"),
          rooms: tDetail("rooms"),
          floor: tDetail("floor"),
          apartment: tDetail("apartment"),
          price: tDetail("price"),
          address: tDetail("address"),
          date: tDetail("date"),
          sourceLink: tDetail("sourceLink"),
          topic: tDetail("topic"),
          save: tDetail("save"),
          delete: tDetail("delete"),
        }}
      />
    </div>
  );
}
