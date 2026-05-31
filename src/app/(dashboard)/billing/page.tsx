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

  const subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });
  const currentPlan = subscription?.plan || "FREE";

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl lg:max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
          Billing
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-0.5">Manage your subscription</p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 shrink-0">
                <Zap className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{currentPlan} Plan</span>
                  <Badge variant={currentPlan === "FREE" ? "secondary" : "pro"} className="text-xs">
                    {currentPlan === "FREE" ? "Free" : "Active"}
                  </Badge>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  {currentPlan === "FREE" ? "10 generations per day" : "Unlimited generations"}
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
        <h2 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrentPlan = currentPlan === key;
            return (
              <Card
                key={key}
                className={`relative ${
                  key === "PRO" ? "border-violet-500/50 bg-violet-600/10" :
                  isCurrentPlan ? "border-emerald-500/30" : ""
                }`}
              >
                {key === "PRO" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="pro" className="text-xs shadow-lg">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-white text-sm sm:text-base">{plan.name}</h3>
                    {isCurrentPlan && <Badge variant="success" className="text-[10px]">Current</Badge>}
                  </div>
                  <p className="text-xs text-white/50 mb-3">{plan.description}</p>

                  <div className="mb-4">
                    <span className="text-2xl sm:text-3xl font-bold text-white">${plan.price}</span>
                    {plan.price > 0 && <span className="text-xs text-white/40 ml-1">/mo</span>}
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 5).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-white/70">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <BillingButtons currentPlan={currentPlan} targetPlan={key} subscription={subscription} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
