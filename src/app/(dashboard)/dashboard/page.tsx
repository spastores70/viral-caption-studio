import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Wand2,
  Bookmark,
  TrendingUp,
  Zap,
  ArrowRight,
  Clock,
} from "lucide-react";
import { formatDate, getPlatformLabel, getContentTypeLabel } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalGenerated, totalSaved, todayUsage, recentContent, subscription] =
    await Promise.all([
      db.generatedContent.count({ where: { userId: session.user.id } }),
      db.savedContent.count({ where: { userId: session.user.id } }),
      db.usageLog.aggregate({
        where: {
          userId: session.user.id,
          action: "GENERATE",
          date: { gte: today, lt: tomorrow },
        },
        _sum: { count: true },
      }),
      db.savedContent.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.subscription.findUnique({ where: { userId: session.user.id } }),
    ]);

  const isPro =
    subscription?.plan === "PRO" || subscription?.plan === "CREATOR_PRO" || session.user.role === "ADMIN";
  const dailyUsed = todayUsage._sum.count || 0;
  const dailyLimit = isPro ? -1 : 10;
  const usagePercent = isPro ? 0 : Math.min((dailyUsed / 10) * 100, 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-white/50 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/generator">
          <Button variant="gradient" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Generate Content
          </Button>
        </Link>
      </div>

      {/* Usage card for free users */}
      {!isPro && (
        <Card className="border-violet-500/30 bg-violet-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-white">Daily Usage</span>
              </div>
              <span className="text-sm text-white/60">
                {dailyUsed} / {dailyLimit} generations
              </span>
            </div>
            <Progress value={usagePercent} className="h-1.5 mb-3" />
            {dailyUsed >= 8 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/50">Running low on daily generations</p>
                <Link href="/billing">
                  <Button size="sm" variant="gradient" className="h-7 text-xs gap-1">
                    <Zap className="h-3 w-3" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20 border border-violet-500/30">
                <TrendingUp className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalGenerated}</p>
                <p className="text-xs text-white/50">Total Generations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20 border border-emerald-500/30">
                <Bookmark className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalSaved}</p>
                <p className="text-xs text-white/50">Saved Captions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/20 border border-amber-500/30">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{dailyUsed}</p>
                <p className="text-xs text-white/50">Generated Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick generate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Generate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Facebook Reel Caption", href: "/generator?type=REEL_CAPTION&platform=FACEBOOK" },
              { label: "Viral Hook", href: "/generator?type=VIRAL_HOOK&platform=FACEBOOK" },
              { label: "Giveaway Post", href: "/generator?type=GIVEAWAY_POST&platform=FACEBOOK" },
              { label: "Funny Couple Caption", href: "/generator?type=FUNNY_COUPLE_CAPTION&platform=FACEBOOK" },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors group cursor-pointer">
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-violet-400 transition-colors" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent saved */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Saved</CardTitle>
              <Link href="/saved">
                <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentContent.length === 0 ? (
              <div className="text-center py-6">
                <Bookmark className="h-8 w-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">No saved captions yet</p>
                <Link href="/generator">
                  <Button variant="ghost" size="sm" className="mt-2 text-xs">Generate your first</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentContent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {getPlatformLabel(item.platform)}
                        </Badge>
                        <span className="text-[10px] text-white/30">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA for free users */}
      {!isPro && (
        <Card className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-violet-500/30">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white mb-1">
                Unlock Unlimited Generations
              </h3>
              <p className="text-sm text-white/60">
                Upgrade to Pro for unlimited AI generations, all templates, and more.
              </p>
            </div>
            <Link href="/billing">
              <Button variant="gradient" className="gap-2 shrink-0">
                <Zap className="h-4 w-4" />
                Upgrade to Pro — $19/mo
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
