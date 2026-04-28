import { requireAdminUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await requireAdminUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const [counts, recentListings] = await Promise.all([
    prisma.$transaction([
      prisma.listing.count({ where: { companyId: user.companyId } }),
      prisma.listing.count({ where: { companyId: user.companyId, status: "FOR_RENT" } }),
      prisma.listing.count({ where: { companyId: user.companyId, status: "RENTED" } }),
      prisma.listing.count({ where: { companyId: user.companyId, status: "LISTED" } }),
    ]),
    prisma.listing.findMany({
      where: {
        companyId: user.companyId,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 25,
      include: { topic: true },
    }),
  ]);

  return NextResponse.json({
    metrics: {
      total: counts[0],
      forRent: counts[1],
      rented: counts[2],
      listed: counts[3],
    },
    recentListings,
  });
}
