import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export type SessionUser = {
  id: number;
  role: UserRole;
  email: string;
  companyId: number;
  companyName: string;
};

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { company: true },
  });

  if (!dbUser || !dbUser.isActive) {
    return null;
  }

  return {
    id: dbUser.id,
    role: dbUser.role,
    email: dbUser.email,
    companyId: dbUser.companyId,
    companyName: dbUser.company.name,
  } satisfies SessionUser;
}

export async function requireSignedInUser() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  return { user, error: null };
}

export async function requireAdminUser() {
  const result = await requireSignedInUser();
  if (result.error || !result.user) {
    return result;
  }

  if (result.user.role !== "ADMIN" && result.user.role !== "SUPER_ADMIN") {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return result;
}

export async function requireSuperAdminUser() {
  const result = await requireSignedInUser();
  if (result.error || !result.user) {
    return result;
  }

  if (result.user.role !== "SUPER_ADMIN") {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return result;
}
