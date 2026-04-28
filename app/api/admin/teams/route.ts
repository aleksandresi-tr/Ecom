import { requireAdminUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const TEAM_INCLUDE = {
  members: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
};

export async function GET() {
  const authResult = await requireAdminUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const teams = await prisma.team.findMany({
    where: { companyId: user.companyId },
    include: TEAM_INCLUDE,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ teams });
}

export async function POST(request: Request) {
  const authResult = await requireAdminUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const body = (await request.json()) as { name?: string; memberIds?: number[] };
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Team name is required." }, { status: 400 });
  }

  const memberIds = Array.isArray(body.memberIds) ? body.memberIds : [];
  const validMembers = memberIds.length
    ? await prisma.user.findMany({
        where: { id: { in: memberIds }, companyId: user.companyId },
        select: { id: true },
      })
    : [];

  const team = await prisma.team.create({
    data: {
      name,
      companyId: user.companyId,
      members: {
        create: validMembers.map((member) => ({ userId: member.id })),
      },
    },
    include: TEAM_INCLUDE,
  });

  return NextResponse.json({ team }, { status: 201 });
}
