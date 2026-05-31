import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [credits, subscription] = await Promise.all([
    db.videoCredit.findUnique({ where: { userId: session.user.id } }),
    db.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const isPro =
    subscription?.plan === "PRO" ||
    subscription?.plan === "CREATOR_PRO" ||
    session.user.role === "ADMIN";

  if (!credits) {
    const newCredits = await db.videoCredit.create({
      data: { userId: session.user.id, balance: 5, totalUsed: 0 },
    });
    return NextResponse.json({
      balance: newCredits.balance,
      totalUsed: newCredits.totalUsed,
      isPro,
    });
  }

  return NextResponse.json({
    balance: credits.balance,
    totalUsed: credits.totalUsed,
    isPro,
  });
}
