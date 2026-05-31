import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Zap } from "lucide-react";
import { BillingButtons } from "@/components/dashboard/billing-buttons";
import { formatDate } from "@/lib/utils";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const currentPlan = subscription?.plan || "FREE";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-violet-400" />
          Billing
        </h1>
        <p className="text-sm text-white/50 mt-0.5">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20 border border-violet-500/30">
                <Zap className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{currentPlan} Plan</span>
                  <Badge variant={currentPlan === "FREE" ? "secondary" : "pro"}>
                    {currentPlan === "FREE" ? "Free" : "Active"}
                  </Badge>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  {currentPlan === "FREE"
                    ? "10 generations per day"
                    : "Unlimited generations"}
                </p>
                {subscription?.currentPeriodEnd && currentPlan !== "FREE" && (
                  <p className="text-xs text-white/40 mt-0.5">
                    Renews {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
            </div>
            <BillingButtons currentPlan={currentPlan} subscription={subscription} />
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrentPlan = currentPlan === key;
            return (
              <Card
                key={key}
                className={`relative ${
                  key === "PRO"
                    ? "border-violet-500/50 bg-violet-600/10"
                    : isCurrentPlan
                    ? "border-emerald-500/30"
                    : ""
                }`}
              >
                {key === "PRO" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="pro" className="text-xs">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white">{plan.name}</h3>
                    {isCurrentPlan && <Badge variant="success" className="text-[10px]">Current</Badge>}
                  </div>
                  <p className="text-xs text-white/50 mb-3">{plan.description}</p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-white">${plan.price}</span>
                    {plan.price > 0 && <span className="text-xs text-white/40">/month</span>}
                  </div>

                  <ul className="space-y-2 mb-5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-white/70">
                        <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <BillingButtons
                    currentPlan={currentPlan}
                    targetPlan={key}
                    subscription={subscription}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
