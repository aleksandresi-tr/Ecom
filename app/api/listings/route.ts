import { prisma } from "@/lib/prisma";
import { District, ListingSource, ListingStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

function isEnumValue<T extends Record<string, string>>(input: string, enumType: T) {
  return Object.values(enumType).includes(input as T[keyof T]);
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search");
  const district = request.nextUrl.searchParams.get("district");
  const topicId = request.nextUrl.searchParams.get("topicId");

  const where: Prisma.ListingWhereInput = {};

  if (search) {
    where.OR = [
      { myhomeId: { contains: search } },
      { ssGeId: { contains: search } },
      { phone: { contains: search } },
      { address: { contains: search } },
    ];
  }

  if (district && isEnumValue(district, District)) {
    where.district = district as District;
  }

  if (topicId) {
    const parsedTopicId = Number(topicId);
    if (!Number.isNaN(parsedTopicId)) {
      where.topicId = parsedTopicId;
    }
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      topic: true,
    },
    orderBy: [{ listingDate: "desc" }, { id: "desc" }],
  });

  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
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

  if (!body.source || !body.district || !body.status) {
    return NextResponse.json(
      { error: "source, district and status are required." },
      { status: 400 }
    );
  }

  if (!isEnumValue(body.source, ListingSource)) {
    return NextResponse.json({ error: "Invalid source." }, { status: 400 });
  }

  if (!isEnumValue(body.district, District)) {
    return NextResponse.json({ error: "Invalid district." }, { status: 400 });
  }

  if (!isEnumValue(body.status, ListingStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      myhomeId: body.myhomeId ?? null,
      ssGeId: body.ssGeId ?? null,
      source: body.source,
      district: body.district,
      status: body.status,
      cooperation: body.cooperation ?? 100,
      phone: body.phone ?? null,
      tenantName: body.tenantName ?? null,
      rooms: body.rooms ?? null,
      floor: body.floor ?? null,
      apartment: body.apartment ?? null,
      priceGEL: body.priceGEL ?? null,
      priceFactor: body.priceFactor ?? null,
      address: body.address ?? null,
      topicId: body.topicId ?? null,
      listingDate: body.listingDate ? new Date(body.listingDate) : new Date(),
    },
    include: {
      topic: true,
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
