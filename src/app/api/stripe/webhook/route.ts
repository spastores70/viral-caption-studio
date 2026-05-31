import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) break;

        await db.subscription.update({
          where: { userId },
          data: {
            plan: plan as any,
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription as string,
          },
        });

        await db.user.update({
          where: { id: userId },
          data: { role: plan === "FREE" ? "FREE" : "PRO" },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const dbSub = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!dbSub) break;

        const status = sub.status === "active" ? "ACTIVE" :
          sub.status === "canceled" ? "CANCELED" :
          sub.status === "past_due" ? "PAST_DUE" : "ACTIVE";

        const periodStart = (sub as any).current_period_start;
        const periodEnd = (sub as any).current_period_end;

        await db.subscription.update({
          where: { id: dbSub.id },
          data: {
            status: status as any,
            ...(periodStart && { currentPeriodStart: new Date(periodStart * 1000) }),
            ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const dbSub = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!dbSub) break;

        await db.subscription.update({
          where: { id: dbSub.id },
          data: {
            plan: "FREE",
            status: "CANCELED",
            stripeSubscriptionId: null,
          },
        });

        await db.user.update({
          where: { id: dbSub.userId },
          data: { role: "FREE" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

