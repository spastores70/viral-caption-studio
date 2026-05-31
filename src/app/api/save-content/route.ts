import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveContentSchema, updateContentSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const platform = searchParams.get("platform");
  const contentType = searchParams.get("contentType");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where: any = { userId: session.user.id };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  if (platform) where.platform = platform;
  if (contentType) where.contentType = contentType;

  const [items, total] = await Promise.all([
    db.savedContent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.savedContent.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = saveContentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const saved = await db.savedContent.create({
    data: {
      userId: session.user.id,
      ...result.data,
      platform: result.data.platform as any,
      contentType: result.data.contentType as any,
    },
  });

  return NextResponse.json(saved, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const existing = await db.savedContent.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = updateContentSchema.safeParse(updateData);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const updated = await db.savedContent.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json(updated);
}

