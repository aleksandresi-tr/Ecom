import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect(`/${locale}/listings`);
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const companyId = session.user.companyId;

  const t = await getTranslations("admin");
  const [users, recentListings, meetingListings, counts, companies] = await Promise.all([
    prisma.user.findMany({
      where: {
        companyId,
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.listing.findMany({
      where: {
        companyId,
      },
      orderBy: [{ updatedAt: "desc" }],
      include: { topic: true },
      take: 10,
    }),
    prisma.listing.findMany({
      where: {
        companyId,
        status: "MEETING_SCHEDULED",
      },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.$transaction([
      prisma.user.count({ where: { companyId } }),
      prisma.listing.count({ where: { companyId } }),
      prisma.topic.count({ where: { companyId } }),
      prisma.listing.count({ where: { companyId, status: "FOR_RENT" } }),
    ]),
    isSuperAdmin
      ? prisma.company.findMany({
          orderBy: [{ createdAt: "desc" }],
          include: {
            _count: {
              select: {
                users: true,
                listings: true,
                topics: true,
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  async function updateUser(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (
      !currentSession?.user?.id ||
      (currentSession.user.role !== "ADMIN" && currentSession.user.role !== "SUPER_ADMIN")
    ) {
      redirect(`/${locale}/login`);
    }

    const userId = Number(formData.get("userId"));
    const role = String(formData.get("role")) as UserRole;
    const isActive = formData.get("isActive") === "on";

    if (!Number.isFinite(userId) || !["ADMIN", "USER"].includes(role)) {
      return;
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: currentSession.user.companyId,
      },
      select: { id: true },
    });

    if (!targetUser) {
      return;
    }

    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        role,
        isActive,
      },
    });

    revalidatePath(`/${locale}/admin`);
  }

  async function updateListingStatus(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (
      !currentSession?.user?.id ||
      (currentSession.user.role !== "ADMIN" && currentSession.user.role !== "SUPER_ADMIN")
    ) {
      redirect(`/${locale}/login`);
    }

    const listingId = Number(formData.get("listingId"));
    const status = String(formData.get("status"));
    if (
      !Number.isFinite(listingId) ||
      !["FOR_RENT", "RENTED", "LISTED"].includes(status)
    ) {
      return;
    }

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        companyId: currentSession.user.companyId,
      },
      select: { id: true },
    });

    if (!listing) {
      return;
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: status as "FOR_RENT" | "RENTED" | "LISTED" },
    });

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/listings`);
  }

  async function createUser(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (
      !currentSession?.user?.id ||
      (currentSession.user.role !== "ADMIN" && currentSession.user.role !== "SUPER_ADMIN")
    ) {
      redirect(`/${locale}/login`);
    }

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "USER") as UserRole;
    const requestedCompanyId = Number(formData.get("companyId"));

    if (!email || !password || password.length < 6 || !["ADMIN", "USER"].includes(role)) {
      return;
    }

    const targetCompanyId =
      currentSession.user.role === "SUPER_ADMIN" && Number.isFinite(requestedCompanyId)
        ? requestedCompanyId
        : currentSession.user.companyId;

    const targetCompany = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      select: { id: true },
    });

    if (!targetCompany) {
      return;
    }

    const existing = await prisma.user.findFirst({
      where: {
        email,
      },
      select: { id: true },
    });
    if (existing) {
      return;
    }

    await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash: await hashPassword(password),
        role,
        isActive: true,
        companyId: targetCompany.id,
      },
    });

    revalidatePath(`/${locale}/admin`);
  }

  async function createCompany(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (!currentSession?.user?.id || currentSession.user.role !== "SUPER_ADMIN") {
      redirect(`/${locale}/login`);
    }

    const companyName = String(formData.get("companyName") ?? "").trim();
    const companySlugInput = String(formData.get("companySlug") ?? "").trim();
    const adminName = String(formData.get("companyAdminName") ?? "").trim();
    const adminEmail = String(formData.get("companyAdminEmail") ?? "")
      .trim()
      .toLowerCase();
    const adminPassword = String(formData.get("companyAdminPassword") ?? "");

    const companySlug = companySlugInput
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!companyName || !companySlug || !adminEmail || adminPassword.length < 6) {
      return;
    }

    const [existingCompany, existingUser] = await Promise.all([
      prisma.company.findUnique({
        where: { slug: companySlug },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { email: adminEmail },
        select: { id: true },
      }),
    ]);

    if (existingCompany || existingUser) {
      return;
    }

    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug: companySlug,
        },
      });

      await tx.user.create({
        data: {
          email: adminEmail,
          name: adminName || null,
          passwordHash: await hashPassword(adminPassword),
          role: "ADMIN",
          isActive: true,
          companyId: company.id,
        },
      });
    });

    revalidatePath(`/${locale}/admin`);
  }

  const [usersCount, listingsCount, topicsCount, forRentCount] = counts;

  return (
    <div className="space-y-5 pb-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border/80 bg-card/95 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("totalUsers")}</p>
          <p className="mt-1 text-2xl font-semibold">{usersCount}</p>
        </article>
        <article className="rounded-2xl border border-border/80 bg-card/95 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("totalListings")}</p>
          <p className="mt-1 text-2xl font-semibold">{listingsCount}</p>
        </article>
        <article className="rounded-2xl border border-border/80 bg-card/95 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("totalTopics")}</p>
          <p className="mt-1 text-2xl font-semibold">{topicsCount}</p>
        </article>
        <article className="rounded-2xl border border-border/80 bg-card/95 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("forRent")}</p>
          <p className="mt-1 text-2xl font-semibold">{forRentCount}</p>
        </article>
      </section>

      <section className="rounded-2xl border-2 border-orange-500 bg-orange-50/40 p-4 shadow-[0_4px_14px_rgba(255,149,0,0.08)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-orange-900">
              {t("meetingsTitle")}
            </h2>
            <p className="mt-1 text-sm text-orange-800/80">{t("meetingsHint")}</p>
          </div>
          <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-orange-500 px-2 py-1 text-sm font-bold text-white">
            {meetingListings.length}
          </span>
        </div>
        {meetingListings.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-orange-300 bg-white/60 px-4 py-3 text-sm text-orange-800/80">
            {t("noMeetings")}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-orange-200 bg-white/80">
            <table className="min-w-full text-sm">
              <thead className="bg-orange-100/60 text-left text-orange-900">
                <tr>
                  <th className="px-3 py-2">{t("listingId")}</th>
                  <th className="px-3 py-2">{t("address")}</th>
                  <th className="px-3 py-2">{t("agent")}</th>
                  <th className="px-3 py-2">{t("reference")}</th>
                  <th className="px-3 py-2">{t("updatedAt")}</th>
                </tr>
              </thead>
              <tbody>
                {meetingListings.map((listing) => (
                  <tr key={listing.id} className="border-t border-orange-100">
                    <td className="px-3 py-2">#{listing.id}</td>
                    <td className="px-3 py-2">{listing.address ?? "-"}</td>
                    <td className="px-3 py-2">
                      {listing.createdBy?.name ?? listing.createdBy?.email ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {listing.myhomeId ? `myhome:${listing.myhomeId}` : ""}
                      {listing.myhomeId && listing.ssGeId ? " • " : ""}
                      {listing.ssGeId ? `ss.ge:${listing.ssGeId}` : ""}
                      {!listing.myhomeId && !listing.ssGeId ? "-" : ""}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(listing.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isSuperAdmin ? (
        <section className="rounded-2xl border border-border/80 bg-card/95 p-4">
          <h2 className="text-base font-semibold">{t("createCompanyTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("createCompanyHint")}</p>
          <form action={createCompany} className="mt-4 grid gap-3 md:grid-cols-5">
            <input
              name="companyName"
              required
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
              placeholder={t("companyName")}
            />
            <input
              name="companySlug"
              required
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
              placeholder={t("companySlug")}
            />
            <input
              name="companyAdminName"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
              placeholder={t("companyAdminName")}
            />
            <input
              name="companyAdminEmail"
              type="email"
              required
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
              placeholder={t("companyAdminEmail")}
            />
            <div className="flex items-center gap-2">
              <input
                name="companyAdminPassword"
                type="password"
                required
                minLength={6}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                placeholder={t("companyAdminPassword")}
              />
              <button
                type="submit"
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                {t("createCompany")}
              </button>
            </div>
          </form>

          <div className="mt-5 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-3 py-2">{t("companyName")}</th>
                  <th className="px-3 py-2">{t("companySlug")}</th>
                  <th className="px-3 py-2">{t("totalUsers")}</th>
                  <th className="px-3 py-2">{t("totalListings")}</th>
                  <th className="px-3 py-2">{t("totalTopics")}</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-t border-border/80">
                    <td className="px-3 py-2">{company.name}</td>
                    <td className="px-3 py-2">{company.slug}</td>
                    <td className="px-3 py-2">{company._count.users}</td>
                    <td className="px-3 py-2">{company._count.listings}</td>
                    <td className="px-3 py-2">{company._count.topics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border/80 bg-card/95 p-4">
        <h2 className="text-base font-semibold">{t("createUserTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("createUserHint")}</p>
        <form action={createUser} className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            name="name"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            placeholder={t("name")}
          />
          <input
            name="email"
            type="email"
            required
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            placeholder={t("email")}
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            placeholder={t("newUserPassword")}
          />
          <div className="flex items-center gap-2">
            {isSuperAdmin ? (
              <select
                name="companyId"
                defaultValue={String(companyId)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.slug})
                  </option>
                ))}
              </select>
            ) : (
              <input type="hidden" name="companyId" value={companyId} />
            )}
            <select
              name="role"
              defaultValue="USER"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button
              type="submit"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {t("createUser")}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card/95 p-4">
        <h2 className="text-base font-semibold">{t("usersTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("usersHint")}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-3 py-2">{t("name")}</th>
                <th className="px-3 py-2">{t("email")}</th>
                <th className="px-3 py-2">{t("role")}</th>
                <th className="px-3 py-2">{t("active")}</th>
                <th className="px-3 py-2">{t("joinedAt")}</th>
                <th className="px-3 py-2">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border/80">
                  <td className="px-3 py-2">{user.name ?? "-"}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">
                    <form action={updateUser} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="h-9 rounded-lg border border-border bg-background px-2"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                      </select>
                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={user.isActive}
                          className="rounded border-border"
                        />
                        {t("active")}
                      </label>
                      <button
                        type="submit"
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium transition hover:border-primary hover:text-primary"
                      >
                        {t("save")}
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-2">{user.isActive ? t("yes") : t("no")}</td>
                  <td className="px-3 py-2">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(user.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">#{user.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card/95 p-4">
        <h2 className="text-base font-semibold">{t("moderationTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("moderationHint")}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-3 py-2">{t("listingId")}</th>
                <th className="px-3 py-2">{t("reference")}</th>
                <th className="px-3 py-2">{t("topic")}</th>
                <th className="px-3 py-2">{t("status")}</th>
                <th className="px-3 py-2">{t("updatedAt")}</th>
              </tr>
            </thead>
            <tbody>
              {recentListings.map((listing) => (
                <tr key={listing.id} className="border-t border-border/80">
                  <td className="px-3 py-2">#{listing.id}</td>
                  <td className="px-3 py-2">{listing.myhomeId ?? listing.ssGeId ?? "-"}</td>
                  <td className="px-3 py-2">{listing.topic ? `${listing.topic.nameKa} / ${listing.topic.nameEn}` : "-"}</td>
                  <td className="px-3 py-2">
                    <form action={updateListingStatus} className="flex items-center gap-2">
                      <input type="hidden" name="listingId" value={listing.id} />
                      <select
                        name="status"
                        defaultValue={listing.status}
                        className="h-9 rounded-lg border border-border bg-background px-2"
                      >
                        <option value="FOR_RENT">FOR_RENT</option>
                        <option value="RENTED">RENTED</option>
                        <option value="LISTED">LISTED</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium transition hover:border-primary hover:text-primary"
                      >
                        {t("save")}
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-2">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(listing.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
