import { requireSignedInUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  District,
  ListingCategory,
  ListingSource,
  ListingStatus,
  Prisma,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const LISTING_INCLUDE = {
  topic: true,
  createdBy: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.ListingInclude;

function isEnumValue<T extends Record<string, string>>(input: string, enumType: T) {
  return Object.values(enumType).includes(input as T[keyof T]);
}

export async function GET(request: NextRequest) {
  const authResult = await requireSignedInUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const search = request.nextUrl.searchParams.get("search");
  const district = request.nextUrl.searchParams.get("district");
  const topicId = request.nextUrl.searchParams.get("topicId");
  const status = request.nextUrl.searchParams.get("status");
  const category = request.nextUrl.searchParams.get("category");
  const createdById = request.nextUrl.searchParams.get("createdById");

  const where: Prisma.ListingWhereInput = {
    companyId: user.companyId,
  };

  if (search) {
    where.OR = [
      { myhomeId: { contains: search } },
      { ssGeId: { contains: search } },
      { phone: { contains: search } },
      { address: { contains: search } },
      { tenantName: { contains: search } },
    ];
  }

  if (district && isEnumValue(district, District)) {
    where.district = district as District;
  }

  if (status && isEnumValue(status, ListingStatus)) {
    where.status = status as ListingStatus;
  }

  if (category && isEnumValue(category, ListingCategory)) {
    where.category = category as ListingCategory;
  }

  if (topicId) {
    const parsedTopicId = Number(topicId);
    if (!Number.isNaN(parsedTopicId)) {
      where.topicId = parsedTopicId;
    }
  }

  if (createdById) {
    const parsedCreatedById = Number(createdById);
    if (!Number.isNaN(parsedCreatedById)) {
      where.createdById = parsedCreatedById;
    }
  }

  const listings = await prisma.listing.findMany({
    where,
    include: LISTING_INCLUDE,
    orderBy: [{ listingDate: "desc" }, { id: "desc" }],
  });

  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  const authResult = await requireSignedInUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

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

  if (body.category && !isEnumValue(body.category, ListingCategory)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  if (body.topicId) {
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

  const listing = await prisma.listing.create({
    data: {
      myhomeId: body.myhomeId ?? null,
      ssGeId: body.ssGeId ?? null,
      source: body.source,
      district: body.district,
      status: body.status,
      category: body.category ?? "RENT",
      cooperation: body.cooperation ?? 100,
      phone: body.phone ?? null,
      tenantName: body.tenantName ?? null,
      rooms: body.rooms ?? null,
      floor: body.floor ?? null,
      apartment: body.apartment ?? null,
      areaSqm: body.areaSqm ?? null,
      priceGEL: body.priceGEL ?? null,
      priceFactor: body.priceFactor ?? null,
      address: body.address ?? null,
      comment: body.comment ?? null,
      companyId: user.companyId,
      createdById: user.id,
      topicId: body.topicId ?? null,
      listingDate: body.listingDate ? new Date(body.listingDate) : new Date(),
    },
    include: LISTING_INCLUDE,
  });

  return NextResponse.json({ listing }, { status: 201 });
}
