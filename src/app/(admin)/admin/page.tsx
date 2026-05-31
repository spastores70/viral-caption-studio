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

  const [
    totalUsers,
    totalGenerations,
    totalSaved,
    proSubscribers,
    recentUsers,
    recentGenerations,
  ] = await Promise.all([
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
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-amber-400" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-white/50 mt-0.5">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalUsers}</p>
                <p className="text-xs text-white/50">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20 border border-violet-500/30">
                <TrendingUp className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalGenerations}</p>
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
                <Zap className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{proSubscribers}</p>
                <p className="text-xs text-white/50">Pro Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || "Unknown"}
                    </p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-white/40">
                      {user._count.generatedContent} gen
                    </span>
                    <Badge
                      variant={
                        user.subscription?.plan === "FREE"
                          ? "secondary"
                          : "pro"
                      }
                      className="text-[10px]"
                    >
                      {user.subscription?.plan || "FREE"}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="destructive" className="text-[10px]">Disabled</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Generations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGenerations.map((gen) => (
                <div
                  key={gen.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {gen.user.name || gen.user.email}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {gen.contentType.replace(/_/g, " ")} • {gen.platform}
                    </p>
                  </div>
                  <div className="text-xs text-white/40 shrink-0">
                    {formatDate(gen.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
