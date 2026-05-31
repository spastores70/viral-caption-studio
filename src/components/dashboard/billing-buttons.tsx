"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BillingButtonsProps {
  currentPlan: string;
  targetPlan?: string;
  subscription?: any;
}

export function BillingButtons({ currentPlan, targetPlan, subscription }: BillingButtonsProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const plan = targetPlan || currentPlan;
  const isCurrentPlan = currentPlan === plan;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to start checkout.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to open billing portal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!targetPlan) {
    if (currentPlan === "FREE") return null;
    return (
      <Button variant="outline" size="sm" onClick={handleManage} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Manage Subscription"}
      </Button>
    );
  }

  if (plan === "FREE") {
    if (isCurrentPlan) {
      return <Button variant="outline" size="sm" className="w-full" disabled>Current Plan</Button>;
    }
    return (
      <Button variant="ghost" size="sm" className="w-full" onClick={handleManage} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Downgrade"}
      </Button>
    );
  }

  if (isCurrentPlan) {
    return <Button variant="outline" size="sm" className="w-full" onClick={handleManage} disabled={loading}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Manage"}
    </Button>;
  }

  return (
    <Button
      variant={plan === "PRO" ? "gradient" : "default"}
      size="sm"
      className="w-full"
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : currentPlan === "FREE" ? (
        "Upgrade"
      ) : (
        "Switch Plan"
      )}
    </Button>
  );
}
