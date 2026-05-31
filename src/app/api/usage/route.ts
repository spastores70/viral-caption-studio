import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const isPro =
    subscription?.plan === "PRO" ||
    subscription?.plan === "CREATOR_PRO" ||
    session.user.role === "ADMIN";

  if (isPro) {
    return NextResponse.json({
      used: 0,
      limit: -1,
      isUnlimited: true,
      remaining: -1,
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayUsage = await db.usageLog.aggregate({
    where: {
      userId: session.user.id,
      action: "GENERATE",
      date: { gte: today, lt: tomorrow },
    },
    _sum: { count: true },
  });

  const used = todayUsage._sum.count || 0;
  const limit = 10;

  return NextResponse.json({
    used,
    limit,
    isUnlimited: false,
    remaining: Math.max(0, limit - used),
  });
}

