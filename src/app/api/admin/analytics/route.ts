import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    totalGenerations,
    totalSaved,
    proSubscribers,
    creatorProSubscribers,
    last7DaysGenerations,
  ] = await Promise.all([
    db.user.count(),
    db.generatedContent.count(),
    db.savedContent.count(),
    db.subscription.count({ where: { plan: "PRO" } }),
    db.subscription.count({ where: { plan: "CREATOR_PRO" } }),
    db.generatedContent.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalGenerations,
    totalSaved,
    proSubscribers,
    creatorProSubscribers,
    last7DaysGenerations,
  });
}

