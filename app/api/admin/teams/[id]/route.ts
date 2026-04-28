import { requireAdminUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const TEAM_INCLUDE = {
  members: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
};

function parseId(raw: string) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await requireAdminUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const { id } = await context.params;
  const teamId = parseId(id);
  if (!teamId) {
    return NextResponse.json({ error: "Invalid team id." }, { status: 400 });
  }

  const team = await prisma.team.findFirst({
    where: { id: teamId, companyId: user.companyId },
    select: { id: true },
  });
  if (!team) {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }

  const body = (await request.json()) as {
    name?: string;
    memberIds?: number[];
  };

  const updates: { name?: string } = {};
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }

  if (Array.isArray(body.memberIds)) {
    const validMembers = body.memberIds.length
      ? await prisma.user.findMany({
          where: { id: { in: body.memberIds }, companyId: user.companyId },
          select: { id: true },
        })
      : [];

    await prisma.$transaction([
      prisma.teamMember.deleteMany({ where: { teamId } }),
      prisma.teamMember.createMany({
        data: validMembers.map((member) => ({ teamId, userId: member.id })),
        skipDuplicates: true,
      }),
    ]);
  }

  const updatedTeam = await prisma.team.update({
    where: { id: teamId },
    data: updates,
    include: TEAM_INCLUDE,
  });

  return NextResponse.json({ team: updatedTeam });
}

export async function DELETE(_: Request, context: RouteContext) {
  const authResult = await requireAdminUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const { id } = await context.params;
  const teamId = parseId(id);
  if (!teamId) {
    return NextResponse.json({ error: "Invalid team id." }, { status: 400 });
  }

  const result = await prisma.team.deleteMany({
    where: { id: teamId, companyId: user.companyId },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
