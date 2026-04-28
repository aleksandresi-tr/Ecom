import { requireAdminUser, requireSignedInUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  District,
  ListingCategory,
  ListingSource,
  ListingStatus,
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";

const LISTING_INCLUDE = {
  topic: true,
  createdBy: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.ListingInclude;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseId(rawId: string) {
  const listingId = Number(rawId);

  if (Number.isNaN(listingId) || listingId <= 0) {
    return null;
  }

  return listingId;
}

function isEnumValue<T extends Record<string, string>>(input: string, enumType: T) {
  return Object.values(enumType).includes(input as T[keyof T]);
}

export async function GET(_: Request, context: RouteContext) {
  const authResult = await requireSignedInUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const { id } = await context.params;
  const listingId = parseId(id);

  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing id." }, { status: 400 });
  }

  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      companyId: user.companyId,
    },
    include: LISTING_INCLUDE,
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await requireSignedInUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const { id } = await context.params;
  const listingId = parseId(id);

  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing id." }, { status: 400 });
  }

  const body = (await request.json()) as {
    myhomeId?: string | null;
    ssGeId?: string | null;
    source?: ListingSource;
    district?: District;
    status?: ListingStatus;
    category?: ListingCategory;
    cooperation?: number;
    phone?: string | null;
    tenantName?: string | null;
    rooms?: number | null;
    floor?: number | null;
    apartment?: number | null;
    areaSqm?: number | null;
    priceGEL?: number | null;
    priceFactor?: number | null;
    address?: string | null;
    comment?: string | null;
    topicId?: number | null;
    listingDate?: string;
  };

  if (body.source && !isEnumValue(body.source, ListingSource)) {
    return NextResponse.json({ error: "Invalid source." }, { status: 400 });
  }

  if (body.district && !isEnumValue(body.district, District)) {
    return NextResponse.json({ error: "Invalid district." }, { status: 400 });
  }

  if (body.status && !isEnumValue(body.status, ListingStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (body.category && !isEnumValue(body.category, ListingCategory)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const existingListing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      companyId: user.companyId,
    },
    select: { id: true },
  });

  if (!existingListing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  if (body.topicId !== undefined && body.topicId !== null) {
    const topic = await prisma.topic.findFirst({
      where: {
        id: body.topicId,
        companyId: user.companyId,
      },
      select: { id: true },
    });

    if (!topic) {
      return NextResponse.json({ error: "Invalid topic." }, { status: 400 });
    }
  }

  const updateData: Prisma.ListingUpdateInput = {
    myhomeId: body.myhomeId ?? undefined,
    ssGeId: body.ssGeId ?? undefined,
    source: body.source ?? undefined,
    district: body.district ?? undefined,
    status: body.status ?? undefined,
    category: body.category ?? undefined,
    cooperation: body.cooperation ?? undefined,
    phone: body.phone ?? undefined,
    tenantName: body.tenantName ?? undefined,
    rooms: body.rooms ?? undefined,
    floor: body.floor ?? undefined,
    apartment: body.apartment ?? undefined,
    areaSqm: body.areaSqm ?? undefined,
    priceGEL: body.priceGEL ?? undefined,
    priceFactor: body.priceFactor ?? undefined,
    address: body.address ?? undefined,
    comment: body.comment ?? undefined,
    topic:
      body.topicId === undefined
        ? undefined
        : body.topicId === null
        ? { disconnect: true }
        : { connect: { id: body.topicId } },
    listingDate: body.listingDate ? new Date(body.listingDate) : undefined,
  };

  try {
    const listing = await prisma.listing.update({
      where: { id: existingListing.id },
      data: updateData,
      include: LISTING_INCLUDE,
    });

    return NextResponse.json({ listing });
  } catch {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const authResult = await requireAdminUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const { id } = await context.params;
  const listingId = parseId(id);

  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing id." }, { status: 400 });
  }

  try {
    const deleted = await prisma.listing.deleteMany({
      where: {
        id: listingId,
        companyId: user.companyId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
