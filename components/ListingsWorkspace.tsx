"use client";

import { AddListingForm } from "@/components/AddListingForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ListingDetailPanel } from "@/components/ListingDetailPanel";
import { ListingsBoard } from "@/components/ListingsBoard";
import { SearchBar } from "@/components/SearchBar";
import { TopicInput } from "@/components/TopicInput";
import {
  CompanyUsersResponse,
  ListingDto,
  ListingsResponse,
  TopicsResponse,
} from "@/lib/types";
import { Building2, Wallet } from "lucide-react";
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

export function ListingsWorkspace({
  canManageTopics = false,
  isAdmin = false,
}: {
  canManageTopics?: boolean;
  isAdmin?: boolean;
}) {
  const locale = useLocale();
  const tListings = useTranslations("listings");
  const tDetail = useTranslations("detail");

  const [search, setSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ListingDto["status"]>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | ListingDto["category"]>("ALL");
  const [agentFilter, setAgentFilter] = useState<"ALL" | number>("ALL");
  const [pendingDelete, setPendingDelete] = useState<ListingDto | null>(null);

  const listingsQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    if (selectedTopicId) {
      params.set("topicId", String(selectedTopicId));
    }
    if (statusFilter !== "ALL") {
      params.set("status", statusFilter);
    }
    if (categoryFilter !== "ALL") {
      params.set("category", categoryFilter);
    }
    if (agentFilter !== "ALL") {
      params.set("createdById", String(agentFilter));
    }
    const query = params.toString();
    return `/api/listings${query ? `?${query}` : ""}`;
  }, [search, selectedTopicId, statusFilter, categoryFilter, agentFilter]);

  const { data: listingsData, mutate: mutateListings } = useSWR<ListingsResponse>(
    listingsQuery,
    fetcher,
  );
  const { data: topicsData, mutate: mutateTopics } = useSWR<TopicsResponse>(
    "/api/topics",
    fetcher,
  );
  const { data: usersData } = useSWR<CompanyUsersResponse>("/api/users", fetcher);
  const { data: meetingsData, mutate: mutateMeetings } = useSWR<ListingsResponse>(
    isAdmin ? "/api/listings?status=MEETING_SCHEDULED" : null,
    fetcher,
  );

  const listings = listingsData?.listings ?? [];
  const topics = topicsData?.topics ?? [];
  const users = usersData?.users ?? [];
  const meetingsCount = meetingsData?.listings.length ?? 0;

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
    values: Partial<ListingDto> & {
      topicId: number | null;
    },
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
    await Promise.all([mutateListings(), mutateMeetings()]);
  }

  async function handleDeleteListing(listingId: number) {
    const response = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Could not delete listing.");
    }
    setSelectedListing(null);
    await Promise.all([mutateListings(), mutateMeetings()]);
  }

  async function handleUpdateStatus(listing: ListingDto, status: ListingDto["status"]) {
    await fetch(`/api/listings/${listing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await Promise.all([mutateListings(), mutateMeetings()]);
  }

  async function handleCreateListing(payload: {
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
  }) {
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let detail = `${response.status}`;
      try {
        const data = (await response.json()) as { error?: string };
        if (data?.error) detail = `${response.status}: ${data.error}`;
      } catch {
        // ignore
      }
      window.alert(`Could not add listing — ${detail}`);
      throw new Error(`Failed to create listing: ${detail}`);
    }

    await Promise.all([mutateListings(), mutateMeetings()]);
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="grid gap-3 sm:grid-cols-2">
        <StatCard
          title={tListings("totalListingsTitle")}
          value={String(listings.length)}
          hint={tListings("totalListingsHint")}
          icon={<Building2 className="size-4" />}
        />
        <StatCard
          title={tListings("totalTopicsTitle")}
          value={String(topics.length)}
          hint={tListings("totalTopicsHint")}
          icon={<Wallet className="size-4" />}
        />
      </section>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={tListings("searchPlaceholder")}
        clearLabel={tListings("clearSearch")}
      />

      {isAdmin ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setStatusFilter(
                statusFilter === "MEETING_SCHEDULED" ? "ALL" : "MEETING_SCHEDULED",
              )
            }
            className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-xs font-semibold transition ${
              statusFilter === "MEETING_SCHEDULED"
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100"
            }`}
            aria-pressed={statusFilter === "MEETING_SCHEDULED"}
          >
            {tListings("meetingsChip")}
            <span
              className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                statusFilter === "MEETING_SCHEDULED"
                  ? "bg-white text-orange-700"
                  : "bg-orange-500 text-white"
              }`}
            >
              {meetingsCount}
            </span>
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={categoryFilter === "ALL"}
          onClick={() => setCategoryFilter("ALL")}
          label={tListings("filtersAll")}
        />
        <FilterChip
          active={categoryFilter === "RENT"}
          onClick={() => setCategoryFilter("RENT")}
          label={tListings("categoryRent")}
        />
        <FilterChip
          active={categoryFilter === "SALE"}
          onClick={() => setCategoryFilter("SALE")}
          label={tListings("categorySale")}
        />
        <FilterChip
          active={categoryFilter === "COMMERCIAL"}
          onClick={() => setCategoryFilter("COMMERCIAL")}
          label={tListings("categoryCommercial")}
        />
        <span className="mx-1 self-center text-xs text-muted-foreground">|</span>
        <FilterChip
          active={statusFilter === "ALL"}
          onClick={() => setStatusFilter("ALL")}
          label={tListings("filtersAll")}
        />
        <FilterChip
          active={statusFilter === "FOR_RENT"}
          onClick={() => setStatusFilter("FOR_RENT")}
          label={tListings("statusForRent")}
        />
        <FilterChip
          active={statusFilter === "MEETING_SCHEDULED"}
          onClick={() => setStatusFilter("MEETING_SCHEDULED")}
          label={tListings("statusMeeting")}
        />
        <FilterChip
          active={statusFilter === "RENTED"}
          onClick={() => setStatusFilter("RENTED")}
          label={tListings("statusRented")}
        />
        <FilterChip
          active={statusFilter === "LISTED"}
          onClick={() => setStatusFilter("LISTED")}
          label={tListings("statusListed")}
        />
      </div>

      {users.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {tListings("userFilterTitle")}
          </span>
          <FilterChip
            active={agentFilter === "ALL"}
            onClick={() => setAgentFilter("ALL")}
            label={tListings("userFilterAll")}
          />
          {users.map((user) => (
            <FilterChip
              key={user.id}
              active={agentFilter === user.id}
              onClick={() => setAgentFilter(user.id)}
              label={user.name ?? user.email}
            />
          ))}
        </div>
      ) : null}

      <TopicInput
        topics={topics}
        selectedTopicId={selectedTopicId}
        onTopicChange={setSelectedTopicId}
        onCreateTopic={handleCreateTopic}
        canCreateTopic={canManageTopics}
        labels={{
          title: tListings("topicsTitle"),
          hint: tListings("topicsHint"),
          allTopics: tListings("allTopics"),
          nameKa: tListings("topicKa"),
          nameEn: tListings("topicEn"),
          addTopic: tListings("addTopic"),
          adminOnlyCreate: tListings("adminOnlyTopicCreate"),
        }}
      />

      <AddListingForm
        topics={topics}
        listings={listings}
        isAdmin={isAdmin}
        locale={locale}
        onCreate={handleCreateListing}
        labels={{
          sectionLabel: tListings("sectionOneLabel"),
          panelTitle: tListings("databaseEntryPanelTitle"),
          quickAddHint: tListings("quickAddHint"),
          statusForRent: tListings("statusForRent"),
          statusListed: tListings("statusListed"),
          statusField: tDetail("status"),
          categoryRent: tListings("categoryRent"),
          categorySale: tListings("categorySale"),
          categoryCommercial: tListings("categoryCommercial"),
          categoryRentSale: tListings("categoryRentSale"),
          cooperation: tListings("cooperation"),
          topic: tListings("topic"),
          allTopics: tListings("allTopics"),
          myhomeId: tListings("myhomeId"),
          ssgeId: tListings("ssgeId"),
          phone: tListings("phone"),
          tenant: tListings("tenant"),
          bedrooms: tListings("bedrooms"),
          rooms: tListings("rooms"),
          floor: tListings("floor"),
          apartment: tListings("apartment"),
          areaSqm: tListings("areaSqm"),
          price: tDetail("price"),
          address: tDetail("address"),
          comment: tListings("comment"),
          addressAutocompleteHint: tListings("addressAutocompleteHint"),
          cityField: tListings("cityField"),
          groupField: tListings("groupField"),
          areaField: tListings("areaField"),
          subAreaField: tListings("subAreaField"),
          streetField: tListings("streetField"),
          optionalSubArea: tListings("optionalSubArea"),
          optionalStreet: tListings("optionalStreet"),
          locationPreview: tListings("locationPreview"),
          addListing: tListings("addListing"),
          creating: tListings("creating"),
          districtTitle: tListings("districtTitle"),
          gldani: tListings("gldani"),
          saburtalo: tListings("saburtalo"),
          nakhalovaka: tListings("nakhalovaka"),
          districtOther: tListings("districtOther"),
        }}
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {tListings("sectionOneLabel")}
            </p>
            <h3 className="text-sm font-semibold tracking-tight">
              {tListings("databaseDisplayPanelTitle")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tListings("listingsBoardHint")}
            </p>
          </div>
        </div>
        <ListingsBoard
          listings={listings}
          locale={locale}
          emptyLabel={tListings("noResults")}
          newDayLabel={tListings("newDayDividerLabel")}
          onEdit={(listing) => setSelectedListing(listing)}
          onDelete={(listing) => setPendingDelete(listing)}
          onUpdateStatus={handleUpdateStatus}
          selectedListingId={selectedListing?.id ?? null}
          cardLabels={{
            myhomeId: tListings("myhomeId"),
            ssgeId: tListings("ssgeId"),
            phone: tListings("phone"),
            bedrooms: tListings("bedrooms"),
            rooms: tListings("rooms"),
            floor: tListings("floor"),
            apartment: tListings("apartment"),
            areaSqm: tListings("areaSqm"),
            address: tDetail("address"),
            cooperation: tListings("cooperation"),
            comment: tListings("comment"),
            noComment: tListings("noComment"),
            agent: tListings("addedBy"),
            date: tListings("addedAt"),
            copy: tListings("copy"),
            copied: tListings("copied"),
            linkCopy: tListings("linkCopy"),
            linkCopied: tListings("linkCopied"),
            copyId: tListings("copyId"),
            idCopied: tListings("idCopied"),
            open: tListings("open"),
            openMenu: tListings("openMenu"),
            actionMeeting: tListings("actionMeeting"),
            actionRented: tListings("actionRented"),
            actionForward: tListings("actionForward"),
            actionEdit: tListings("actionEdit"),
            actionDelete: tListings("actionDelete"),
            statusForRent: tListings("statusForRent"),
            statusRented: tListings("statusRented"),
            statusListed: tListings("statusListed"),
            statusMeeting: tListings("statusMeeting"),
            categoryRent: tListings("categoryRent"),
            categorySale: tListings("categorySale"),
            categoryCommercial: tListings("categoryCommercial"),
          }}
        />
      </section>

      <ListingDetailPanel
        listing={selectedListing}
        open={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        onSave={handleSaveListing}
        onDelete={(id) => {
          const target = listings.find((l) => l.id === id) ?? null;
          if (target) {
            setPendingDelete(target);
          }
        }}
        topics={topics}
        locale={locale}
        labels={{
          title: tDetail("title"),
          close: tDetail("close"),
          source: tDetail("source"),
          status: tDetail("status"),
          category: tDetail("category"),
          cooperation: tDetail("cooperation"),
          phone: tDetail("phone"),
          tenant: tDetail("tenant"),
          rooms: tDetail("rooms"),
          bedrooms: tDetail("bedrooms"),
          floor: tDetail("floor"),
          apartment: tDetail("apartment"),
          areaSqm: tDetail("areaSqm"),
          price: tDetail("price"),
          address: tDetail("address"),
          comment: tDetail("comment"),
          date: tDetail("date"),
          sourceLink: tDetail("sourceLink"),
          topic: tDetail("topic"),
          save: tDetail("save"),
          delete: tDetail("delete"),
          actionsTitle: tDetail("actionsTitle"),
          workflowTitle: tDetail("workflowTitle"),
          workflowStep1: tDetail("workflowStep1"),
          workflowStep2: tDetail("workflowStep2"),
          workflowStep3: tDetail("workflowStep3"),
          workflowStep4: tDetail("workflowStep4"),
          workflowStep5: tDetail("workflowStep5"),
          addedBy: tDetail("addedBy"),
          addedAt: tDetail("addedAt"),
          sourceMyhome: tListings("sourceMyhome"),
          sourceSsge: tListings("sourceSsge"),
          statusForRent: tListings("statusForRent"),
          statusRented: tListings("statusRented"),
          statusListed: tListings("statusListed"),
          statusMeeting: tListings("statusMeeting"),
          categoryRent: tListings("categoryRent"),
          categorySale: tListings("categorySale"),
          categoryCommercial: tListings("categoryCommercial"),
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={tListings("deleteConfirmTitle")}
        description={tListings("deleteConfirmHint")}
        confirmLabel={tListings("confirmDelete")}
        cancelLabel={tListings("cancel")}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await handleDeleteListing(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border/80 bg-card/95 p-3 shadow-[0_4px_14px_rgba(0,0,0,0.04)] backdrop-blur">
      <div className="mb-2 inline-flex rounded-md bg-muted px-2 py-1 text-muted-foreground">
        {icon}
      </div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </article>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:border-primary"
      }`}
    >
      {label}
    </button>
  );
}
