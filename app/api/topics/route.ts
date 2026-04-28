import { requireAdminUser, requireSignedInUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await requireSignedInUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const topics = await prisma.topic.findMany({
    where: {
      companyId: user.companyId,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ topics });
}

export async function POST(request: Request) {
  const authResult = await requireAdminUser();
  if (authResult.error) {
    return authResult.error;
  }
  const user = authResult.user;

  const body = (await request.json()) as {
    nameKa?: string;
    nameEn?: string;
  };

  if (!body.nameKa || !body.nameEn) {
    return NextResponse.json(
      { error: "Both nameKa and nameEn are required." },
      { status: 400 }
    );
  }

  const topic = await prisma.topic.create({
    data: {
      nameKa: body.nameKa,
      nameEn: body.nameEn,
      companyId: user.companyId,
    },
  });

  return NextResponse.json({ topic }, { status: 201 });
}
