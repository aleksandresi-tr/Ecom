import { prisma } from "@/lib/prisma";
import { District, ListingSource, ListingStatus } from "@prisma/client";
import { NextResponse } from "next/server";

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
  const { id } = await context.params;
  const listingId = parseId(id);

  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing id." }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { topic: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export async function PUT(request: Request, context: RouteContext) {
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
    cooperation?: number;
    phone?: string | null;
    tenantName?: string | null;
    rooms?: number | null;
    floor?: number | null;
    apartment?: number | null;
    priceGEL?: number | null;
    priceFactor?: number | null;
    address?: string | null;
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

  try {
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        ...body,
        listingDate: body.listingDate ? new Date(body.listingDate) : undefined,
      },
      include: {
        topic: true,
      },
    });

    return NextResponse.json({ listing });
  } catch {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const listingId = parseId(id);

  if (!listingId) {
    return NextResponse.json({ error: "Invalid listing id." }, { status: 400 });
  }

  try {
    await prisma.listing.delete({
      where: { id: listingId },
    });
  } catch {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
