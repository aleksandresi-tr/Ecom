import { requireAdminUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type UserRole = "ADMIN" | "USER";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await requireAdminUser();
  if (authResult.error) {
    return authResult.error;
  }
  const adminUser = authResult.user;

  const { id } = await context.params;
  const userId = Number(id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const body = (await request.json()) as {
    role?: UserRole;
    isActive?: boolean;
  };

  if (body.role && !["ADMIN", "USER"].includes(body.role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      companyId: adminUser.companyId,
    },
    select: { id: true },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      role: body.role,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ user });
}
