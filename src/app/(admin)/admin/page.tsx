import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, TrendingUp, Bookmark, Zap } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [totalUsers, totalGenerations, totalSaved, proSubscribers, recentUsers, recentGenerations] =
    await Promise.all([
      db.user.count(),
      db.generatedContent.count(),
      db.savedContent.count(),
      db.subscription.count({ where: { plan: { not: "FREE" } } }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          subscription: true,
          _count: { select: { generatedContent: true, savedContent: true } },
        },
      }),
      db.generatedContent.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  const stats = [
    { icon: Users, value: totalUsers, label: "Total Users", color: "blue" },
    { icon: TrendingUp, value: totalGenerations, label: "Generations", color: "violet" },
    { icon: Bookmark, value: totalSaved, label: "Saved", color: "emerald" },
    { icon: Zap, value: proSubscribers, label: "Pro Users", color: "amber" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-0.5">Platform overview</p>
      </div>

      {/* Stats — 2×2 on mobile, 4 columns on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ icon: Icon, value, label, color }) => (
          <Card key={label}>
            <CardContent className="p-3 sm:p-5">
              <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-${color}-600/20 border border-${color}-500/30 mb-2 sm:mb-3`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${color}-400`} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{value.toLocaleString()}</p>
              <p className="text-[11px] sm:text-xs text-white/50 leading-tight mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users list — card-based, no table */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base">Recent Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-3 sm:p-6 sm:pt-0">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-white/5 transition-colors min-h-[56px]"
            >
              {/* Avatar + info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xs font-semibold shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name || "Unknown"}
                  </p>
                  <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[11px] text-white/40 hidden sm:inline">
                  {user._count.generatedContent} gen
                </span>
                <Badge
                  variant={user.subscription?.plan === "FREE" ? "secondary" : "pro"}
                  className="text-[10px] h-5"
                >
                  {user.subscription?.plan || "FREE"}
                </Badge>
                {!user.isActive && (
                  <Badge variant="destructive" className="text-[10px] h-5">Off</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Generations — card-based */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base">Recent Generations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-3 sm:p-6 sm:pt-0">
          {recentGenerations.map((gen) => (
            <div
              key={gen.id}
              className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-white/5 transition-colors min-h-[52px]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {gen.user.name || gen.user.email}
                </p>
                <p className="text-[11px] text-white/40 truncate">
                  {gen.contentType.replace(/_/g, " ")} · {gen.platform}
                </p>
              </div>
              <div className="text-[11px] text-white/30 shrink-0 ml-2 whitespace-nowrap">
                {formatDate(gen.createdAt)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
