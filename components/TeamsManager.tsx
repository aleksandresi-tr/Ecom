"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  CompanyUsersResponse,
  ListingUserDto,
  TeamDto,
  TeamsResponse,
} from "@/lib/types";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import useSWR from "swr";

const fetcher = async <T,>(url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
};

export function TeamsManager() {
  const tTeams = useTranslations("teams");
  const tListings = useTranslations("listings");
  const tApp = useTranslations("app");

  const { data: teamsData, mutate: mutateTeams } = useSWR<TeamsResponse>(
    "/api/admin/teams",
    fetcher,
  );
  const { data: usersData } = useSWR<CompanyUsersResponse>("/api/users", fetcher);

  const teams = teamsData?.teams ?? [];
  const users = usersData?.users ?? [];

  const [newTeamName, setNewTeamName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<TeamDto | null>(null);

  async function handleCreateTeam() {
    const name = newTeamName.trim();
    if (!name) return;
    await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setNewTeamName("");
    await mutateTeams();
  }

  async function handleAddMember(team: TeamDto, userId: number) {
    const memberIds = Array.from(
      new Set([...team.members.map((m) => m.user.id), userId]),
    );
    await fetch(`/api/admin/teams/${team.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberIds }),
    });
    await mutateTeams();
  }

  async function handleRemoveMember(team: TeamDto, userId: number) {
    const memberIds = team.members
      .map((m) => m.user.id)
      .filter((id) => id !== userId);
    await fetch(`/api/admin/teams/${team.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberIds }),
    });
    await mutateTeams();
  }

  async function handleDeleteTeam(team: TeamDto) {
    await fetch(`/api/admin/teams/${team.id}`, { method: "DELETE" });
    await mutateTeams();
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{tTeams("title")}</h1>
        <p className="text-sm text-muted-foreground">{tTeams("hint")}</p>
      </div>

      <section className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold">{tTeams("createTeam")}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newTeamName}
            onChange={(event) => setNewTeamName(event.target.value)}
            placeholder={tTeams("newTeamName")}
            className="h-10 flex-1 min-w-[220px] rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <Button type="button" onClick={handleCreateTeam}>
            {tTeams("createTeam")}
          </Button>
        </div>
      </section>

      {teams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/80 p-6 text-center text-sm text-muted-foreground">
          {tTeams("noTeams")}
        </div>
      ) : null}

      <div className="grid gap-4">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            users={users}
            onAddMember={(userId) => handleAddMember(team, userId)}
            onRemoveMember={(userId) => handleRemoveMember(team, userId)}
            onDeleteTeam={() => setPendingDelete(team)}
            labels={{
              members: tTeams("members"),
              addMember: tTeams("addMember"),
              remove: tTeams("remove"),
              deleteTeam: tTeams("deleteTeam"),
              memberSearch: tTeams("memberSearch"),
              app: tApp("title"),
              listingsLabel: tListings("listingsBoardTitle"),
            }}
          />
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={tListings("deleteConfirmTitle")}
        description={tListings("deleteConfirmHint")}
        confirmLabel={tListings("confirmDelete")}
        cancelLabel={tListings("cancel")}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await handleDeleteTeam(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

type TeamCardProps = {
  team: TeamDto;
  users: ListingUserDto[];
  onAddMember: (userId: number) => Promise<void>;
  onRemoveMember: (userId: number) => Promise<void>;
  onDeleteTeam: () => void;
  labels: {
    members: string;
    addMember: string;
    remove: string;
    deleteTeam: string;
    memberSearch: string;
    app: string;
    listingsLabel: string;
  };
};

function TeamCard({
  team,
  users,
  onAddMember,
  onRemoveMember,
  onDeleteTeam,
  labels,
}: TeamCardProps) {
  const [memberSearch, setMemberSearch] = useState("");

  const memberIds = useMemo(() => new Set(team.members.map((m) => m.user.id)), [team]);
  const filteredUsers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    return users
      .filter((user) => !memberIds.has(user.id))
      .filter((user) => {
        if (!query) return true;
        const name = (user.name ?? "").toLowerCase();
        return name.includes(query) || user.email.toLowerCase().includes(query);
      })
      .slice(0, 10);
  }, [users, memberIds, memberSearch]);

  return (
    <article className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">{team.name}</h3>
        <Button type="button" variant="destructive" onClick={onDeleteTeam}>
          {labels.deleteTeam}
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {labels.members} ({team.members.length})
          </h4>
          <ul className="grid gap-1.5">
            {team.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-background/60 px-3 py-2 text-sm"
              >
                <span>
                  {member.user.name ?? member.user.email}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {member.user.email}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveMember(member.user.id)}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-red-400 hover:text-red-600"
                >
                  {labels.remove}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {labels.addMember}
          </h4>
          <input
            value={memberSearch}
            onChange={(event) => setMemberSearch(event.target.value)}
            placeholder={labels.memberSearch}
            className="mb-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <ul className="grid gap-1.5">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-background/60 px-3 py-2 text-sm"
              >
                <span>
                  {user.name ?? user.email}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onAddMember(user.id)}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
