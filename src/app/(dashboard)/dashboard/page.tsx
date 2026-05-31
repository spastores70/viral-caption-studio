import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wand2, Bookmark, TrendingUp, Zap, ArrowRight, Clock } from "lucide-react";
import { formatDate, getPlatformLabel } from "@/lib/utils";

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
        where: { userId: session.user.id, action: "GENERATE", date: { gte: today, lt: tomorrow } },
        _sum: { count: true },
      }),
      db.savedContent.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.subscription.findUnique({ where: { userId: session.user.id } }),
    ]);

  const isPro = subscription?.plan === "PRO" || subscription?.plan === "CREATOR_PRO" || session.user.role === "ADMIN";
  const dailyUsed = todayUsage._sum.count || 0;
  const usagePercent = isPro ? 0 : Math.min((dailyUsed / 10) * 100, 100);

  const quickActions = [
    { label: "Facebook Reel Caption", href: "/generator?type=REEL_CAPTION&platform=FACEBOOK" },
    { label: "Viral Hook", href: "/generator?type=VIRAL_HOOK&platform=FACEBOOK" },
    { label: "Giveaway Post", href: "/generator?type=GIVEAWAY_POST&platform=FACEBOOK" },
    { label: "Funny Couple Caption", href: "/generator?type=FUNNY_COUPLE_CAPTION&platform=FACEBOOK" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Hey, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/generator">
          <Button variant="gradient" className="w-full sm:w-auto h-11 gap-2">
            <Wand2 className="h-4 w-4" />
            Generate Content
          </Button>
        </Link>
      </div>

      {/* Usage bar for free users */}
      {!isPro && (
        <Card className="border-violet-500/30 bg-violet-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-white">Daily Usage</span>
              </div>
              <span className="text-sm text-white/60">{dailyUsed} / 10</span>
            </div>
            <Progress value={usagePercent} className="h-1.5 mb-3" />
            {dailyUsed >= 8 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-white/50">Running low on daily generations</p>
                <Link href="/billing" className="w-full sm:w-auto">
                  <Button size="sm" variant="gradient" className="w-full sm:w-auto h-9 text-xs gap-1">
                    <Zap className="h-3 w-3" />Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: TrendingUp, value: totalGenerated, label: "Total Generated", color: "violet" },
          { icon: Bookmark, value: totalSaved, label: "Saved", color: "emerald" },
          { icon: Clock, value: dailyUsed, label: "Today", color: "amber" },
        ].map(({ icon: Icon, value, label, color }) => (
          <Card key={label}>
            <CardContent className="p-3 sm:p-5">
              <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-${color}-600/20 border border-${color}-500/30 mb-2 sm:mb-3`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${color}-400`} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
              <p className="text-[10px] sm:text-xs text-white/50 leading-tight mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick generate */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base">Quick Generate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {quickActions.map((item) => (
            <Link key={item.label} href={item.href}>
              <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-white/5 active:bg-white/10 transition-colors group cursor-pointer min-h-[44px]">
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">{item.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-violet-400 transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Recent saved */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-base">Recent Saved</CardTitle>
            <Link href="/saved">
              <Button variant="ghost" size="sm" className="h-8 text-xs">View all</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentContent.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="h-8 w-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40 mb-3">No saved captions yet</p>
              <Link href="/generator">
                <Button variant="outline" size="sm">Generate your first</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentContent.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-white/5 transition-colors min-h-[44px]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getPlatformLabel(item.platform)}</Badge>
                      <span className="text-[10px] text-white/30">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {!isPro && (
        <Card className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-violet-500/30">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1">Unlock Unlimited Generations</h3>
            <p className="text-xs sm:text-sm text-white/60 mb-3 sm:mb-4">
              Upgrade to Pro for unlimited AI generations, all templates, and more.
            </p>
            <Link href="/billing">
              <Button variant="gradient" className="w-full sm:w-auto h-11 gap-2">
                <Zap className="h-4 w-4" />Upgrade to Pro — $19/mo
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
