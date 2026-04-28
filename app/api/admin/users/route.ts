import { requireAdminUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await requireAdminUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const users = await prisma.user.findMany({
    where: {
      companyId: user.companyId,
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ users });
}
