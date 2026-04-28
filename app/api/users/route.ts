import { requireSignedInUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await requireSignedInUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const users = await prisma.user.findMany({
    where: {
      companyId: user.companyId,
      isActive: true,
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return NextResponse.json({ users });
}
